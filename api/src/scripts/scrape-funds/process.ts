import { QueryBuilder } from 'knex';
import groupBy from 'lodash/groupBy';

import db from '~api/modules/db';
import config from '~api/config';
import logger from '~api/modules/logger';
import { fundHash } from '~api/routes/data/funds/common';
import { CLIOptions, Broker, Fund } from './types';
import { getCurrencyPrices } from './currencies';
import { getFundUrl, downloadMultipleUrls } from './scrape';
import { scrapeFundHoldings } from './holdings';
import { scrapeFundPrices } from './prices';

export function getBroker(name: string): Broker {
  if (config.data.funds.scraper.regex.test(name)) {
    // At the moment, only Hargreaves Lansdown is supported
    return Broker.HL;
  }

  throw new Error(`Invalid fund name: ${name}`);
}

export async function getFunds(): Promise<Fund[]> {
  const rows = await db
    .select<
      {
        uid: string;
        item: string;
        units: number;
        cost: number;
      }[]
    >('uid', 'item', 'units', 'cost')
    .from(
      (qb1: QueryBuilder): QueryBuilder =>
        qb1
          .select(
            'f.uid',
            'f.item',
            db.raw('SUM(ft.units)::float AS units'),
            db.raw('SUM(ft.cost)::float AS cost'),
          )
          .from('funds as f')
          .innerJoin('funds_transactions as ft', 'ft.fund_id', 'f.id')
          .groupBy('f.uid')
          .groupBy('f.item')
          .as('r'),
    )
    .where('units', '>', 0)
    .orderBy('uid')
    .orderBy('item');

  return rows
    .map(({ uid, item, units, cost }) => ({
      uid,
      name: item,
      hash: fundHash(item, config.data.funds.salt),
      broker: getBroker(item),
      units: Number(units.toFixed(5)),
      cost,
    }))
    .map(fund => ({
      ...fund,
      url: getFundUrl(fund),
    }));
}

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
    const uniqueFunds = Object.keys(groupedFunds).map(url => ({
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
