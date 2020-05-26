import groupBy from 'lodash/groupBy';
import { sql } from 'slonik';

import { getCurrencyPrices } from './currencies';
import { scrapeFundHoldings } from './holdings';
import { scrapeFundPrices } from './prices';
import { getFundUrl, downloadMultipleUrls } from './scrape';
import { CLIOptions, Broker, Fund } from './types';
import config from '~api/config';
import { withSlonik } from '~api/modules/db';
import logger from '~api/modules/logger';
import { fundHash } from '~api/routes/data/funds/common';

export function getBroker(name: string): Broker {
  if (config.data.funds.scraper.regex.test(name)) {
    // At the moment, only Hargreaves Lansdown is supported
    return Broker.HL;
  }

  throw new Error(`Invalid fund name: ${name}`);
}

export const getFunds = withSlonik<Fund[]>(async (db) => {
  const { rows } = await db.query<{
    uid: string;
    name: string;
    units: number;
    cost: number;
  }>(sql`
  SELECT uid, item as name, units, cost
  FROM (
    SELECT ${sql.join(
      [
        sql`f.uid`,
        sql`f.item`,
        sql`ROUND(SUM(ft.units)::decimal, 5) AS units`,
        sql`SUM(ft.cost)::float AS cost`,
      ],
      sql`, `,
    )}
    FROM funds f
    INNER JOIN funds_transactions ft ON ft.fund_id = f.id
    GROUP BY f.uid, f.item
  ) r
  WHERE r.units > 0
  ORDER BY r.uid, r.item
  `);

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
});

export async function processScrape(flags: CLIOptions): Promise<void> {
  const { holdings, prices } = flags;

  if (!holdings && !prices) {
    throw new Error('Must have either holdings or prices flag');
  }

  logger.info('Starting fund scraper...');

  try {
    const funds = await getFunds();

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
      await scrapeFundHoldings(funds, uniqueFunds, rawData);
    }
    if (prices) {
      const currencyPrices = await getCurrencyPrices();

      await scrapeFundPrices(currencyPrices, uniqueFunds, rawData);
    }

    logger.info('Finished scraping funds');
  } catch (err) {
    logger.error('Error scraping funds:', err.message);

    throw err;
  }
}
