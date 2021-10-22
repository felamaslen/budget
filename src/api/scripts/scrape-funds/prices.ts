import { DatabaseTransactionConnectionType } from 'slonik';

import { getPriceFromDataHL } from './hl';
import { upsertFundHashes, insertPrices, insertPriceCache } from './queries';
import { Fund, CurrencyPrices, Broker } from './types';
import config from '~api/config';
import { getMultipleStockQuotes } from '~api/modules/finance';
import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import logger from '~api/modules/logger';

type FundWithPrice = Fund & { price: number };

function getPriceFromData(fund: Fund, currencyPrices: CurrencyPrices, data: string): number {
  if (!data) {
    throw new Error('Data empty');
  }

  if (fund.broker === Broker.HL) {
    return getPriceFromDataHL(data, currencyPrices);
  }

  throw new Error('Unknown broker');
}

function getGenericSymbol(fund: Pick<Fund, 'name' | 'broker'>): string | null {
  if (fund.broker !== Broker.Generic) {
    return null;
  }
  const [, , symbol] = fund.name.match(config.data.funds.scraper.regexGeneric) as RegExpMatchArray;
  return symbol;
}

export async function getGenericQuotes(
  funds: Pick<Fund, 'name' | 'broker'>[],
): Promise<(number | null)[]> {
  const symbols = Array.from(new Set(funds.map(getGenericSymbol).filter((s): s is string => !!s)));
  const prices = await getMultipleStockQuotes(symbols);

  return funds.map<number | null>((fund) => {
    const symbol = getGenericSymbol(fund);
    return symbol ? prices[symbol] : null;
  });
}

function getPricesFromData(
  currencyPrices: CurrencyPrices,
  funds: Fund[],
  rawData: (string | null)[],
  genericQuotes: (number | null)[],
): FundWithPrice[] {
  return funds.reduce<FundWithPrice[]>((results, fund, index) => {
    try {
      const price =
        fund.broker === Broker.Generic
          ? (genericQuotes[index] as number)
          : getPriceFromData(fund, currencyPrices, rawData[index] as string);

      logger.verbose(`Price update: ${price} for ${fund.name}`);

      return [...results, { ...fund, price }];
    } catch (err) {
      logger.warn(`Couldn't get price for fund with name: ${fund.name}`);
      logger.debug((err as Error).stack);

      return results;
    }
  }, []);
}

async function insertNewPriceCache(
  db: DatabaseTransactionConnectionType,
  fundsWithPrices: FundWithPrice[],
  now: Date,
): Promise<void> {
  const cid = await insertPriceCache(db, now);
  const fids = await upsertFundHashes(
    db,
    fundsWithPrices.map(({ name, broker }) => [name, broker]),
  );
  await insertPrices(
    db,
    fundsWithPrices.map(({ price }, index) => [cid, fids[index], price]),
  );
}

export async function scrapeFundPrices(
  db: DatabaseTransactionConnectionType,
  currencyPrices: CurrencyPrices,
  funds: Fund[],
  rawData: (string | null)[],
  genericQuotes: (number | null)[],
): Promise<void> {
  logger.info('Processing fund prices...');

  const fundsWithPrices = getPricesFromData(currencyPrices, funds, rawData, genericQuotes);

  const currentValue = (
    fundsWithPrices.reduce((value, { units, price }) => value + units * price, 0) / 100
  ).toFixed(2);

  logger.verbose(`Total value: ${config.data.currencyUnit}${currentValue}`);

  logger.debug('Inserting prices into database');

  await insertNewPriceCache(db, fundsWithPrices, new Date());

  logger.info('Sending update to pubsub queue');
  await pubsub.publish(PubSubTopic.FundPricesUpdated, true);
}
