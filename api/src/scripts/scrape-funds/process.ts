import groupBy from 'lodash/groupBy';
import { DatabaseTransactionConnectionType } from 'slonik';

import { getCurrencyPrices } from './currencies';
import { scrapeFundHoldings } from './holdings';
import { scrapeFundPrices } from './prices';
import { selectFunds } from './queries';
import { getFundUrl, downloadMultipleUrls } from './scrape';
import { CLIOptions, Broker, Fund } from './types';
import config from '~api/config';
import { fundHash } from '~api/controllers';
import logger from '~api/modules/logger';

export function getBroker(name: string): Broker {
  if (config.data.funds.scraper.regex.test(name)) {
    // At the moment, only Hargreaves Lansdown is supported
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
      hash: fundHash(name, config.data.funds.salt),
      broker: getBroker(name),
      units,
      cost,
    }))
    .map((fund) => ({
      ...fund,
      url: getFundUrl(fund),
    }));
};

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

    const groupedFunds = groupBy(funds, 'url');
    const uniqueFunds = Object.keys(groupedFunds).map((url) => ({
      ...groupedFunds[url][0],
      units: groupedFunds[url].reduce((last, { units: value }) => last + value, 0),
      cost: groupedFunds[url].reduce((last, { cost: value }) => last + value, 0),
    }));

    const rawData = await downloadMultipleUrls(uniqueFunds.map(({ url }) => url));

    if (holdings) {
      await scrapeFundHoldings(db, funds, uniqueFunds, rawData);
    }
    if (prices) {
      const currencyPrices = await getCurrencyPrices();
      await scrapeFundPrices(db, currencyPrices, uniqueFunds, rawData);
    }

    logger.info('Finished scraping funds');
  } catch (err) {
    logger.error('Error scraping funds:', err.message);

    throw err;
  }
}
