import groupBy from 'lodash/groupBy';
import { DatabaseTransactionConnectionType } from 'slonik';

import { getCurrencyPrices } from './currencies';
import { scrapeFundHoldings } from './holdings';
import { scrapeFundPrices, getGenericQuotes } from './prices';
import { selectFunds } from './queries';
import { getFundUrl, downloadMultipleUrls } from './scrape';
import { CLIOptions, Broker, Fund } from './types';
import config from '~api/config';
import logger from '~api/modules/logger';

export function getBroker(name: string): Broker {
  if (config.data.funds.scraper.regexGeneric.test(name)) {
    return Broker.Generic;
  }
  if (config.data.funds.scraper.regex.test(name)) {
    return Broker.HL;
  }

  throw new Error(`Invalid fund name: ${name}`);
}

export const getFunds = async (db: DatabaseTransactionConnectionType): Promise<Fund[]> => {
  const rows = await selectFunds(db);
  return rows
    .map(({ uid, name, units, cost }) => ({
      uid,
      name,
      broker: getBroker(name),
      units,
      cost,
    }))
    .map((fund) => ({
      ...fund,
      url: getFundUrl(fund),
    }));
};

function sumFundsUnitsCosts(funds: Fund[], groupKey: keyof Fund): Fund[] {
  const groupedFunds = groupBy(funds, groupKey);
  const uniqueFunds = Object.keys(groupedFunds).map((key) => ({
    ...groupedFunds[key][0],
    units: groupedFunds[key].reduce((last, { units: value }) => last + value, 0),
    cost: groupedFunds[key].reduce((last, { cost: value }) => last + value, 0),
  }));

  return uniqueFunds;
}

export async function processScrape(
  db: DatabaseTransactionConnectionType,
  flags: CLIOptions,
): Promise<void> {
  const { holdings, prices } = flags;

  if (!holdings && !prices) {
    throw new Error('Must have either holdings or prices flag');
  }

  logger.info('Starting fund scraper...');

  try {
    const funds = await getFunds(db);

    if (!funds.length) {
      logger.info('No funds to scrape - exiting!');

      return;
    }

    const uniqueFunds = [
      ...sumFundsUnitsCosts(
        funds.filter(({ broker }) => broker === Broker.Generic),
        'name',
      ),
      ...sumFundsUnitsCosts(
        funds.filter(({ broker }) => broker !== Broker.Generic),
        'url',
      ),
    ];

    const rawData = await downloadMultipleUrls(uniqueFunds.map(({ url }) => url));

    if (holdings) {
      await scrapeFundHoldings(db, funds, uniqueFunds, rawData);
    }
    if (prices) {
      const [currencyPrices, genericQuotes] = await Promise.all([
        getCurrencyPrices(),
        getGenericQuotes(uniqueFunds),
      ]);
      await scrapeFundPrices(db, currencyPrices, uniqueFunds, rawData, genericQuotes);
    }

    logger.info('Finished scraping funds');
  } catch (err) {
    logger.error('Error scraping funds:', err.message);

    throw err;
  }
}
