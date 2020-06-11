import { DatabaseTransactionConnectionType } from 'slonik';

import { getPriceFromDataHL } from './hl';
import { upsertFundHash, insertPrice, insertPriceCache } from './queries';
import { Fund, CurrencyPrices, Broker } from './types';
import config from '~api/config';
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

function getPricesFromData(
  currencyPrices: CurrencyPrices,
  funds: Fund[],
  data: string[],
): FundWithPrice[] {
  return funds.reduce((results: FundWithPrice[], fund, index) => {
    try {
      const price = getPriceFromData(fund, currencyPrices, data[index]);

      logger.verbose(`Price update: ${price} for ${fund.name}`);

      return [...results, { ...fund, price }];
    } catch (err) {
      logger.warn(`Couldn't get price for fund with name: ${fund.name}`);
      logger.debug(err.stack);

      return results;
    }
  }, []);
}

async function insertNewSinglePriceCache(
  db: DatabaseTransactionConnectionType,
  cid: string,
  fund: Pick<FundWithPrice, 'hash' | 'broker' | 'price'>,
): Promise<void> {
  const { hash, broker, price } = fund;
  const fid = await upsertFundHash(db, hash, broker);

  await insertPrice(db, cid, fid, price);
}

async function insertNewPriceCache(
  db: DatabaseTransactionConnectionType,
  fundsWithPrices: FundWithPrice[],
  now: Date,
): Promise<void> {
  const cid = await insertPriceCache(db, now);
  await Promise.all(fundsWithPrices.map((fund) => insertNewSinglePriceCache(db, cid, fund)));
}

export async function scrapeFundPrices(
  db: DatabaseTransactionConnectionType,
  currencyPrices: CurrencyPrices,
  funds: Fund[],
  data: string[],
): Promise<void> {
  logger.info('Processing fund prices...');

  const fundsWithPrices = getPricesFromData(currencyPrices, funds, data);

  const currentValue = (
    fundsWithPrices.reduce((value, { units, price }) => value + units * price, 0) / 100
  ).toFixed(2);

  logger.verbose(`Total value: ${config.data.currencyUnit}${currentValue}`);

  logger.debug('Inserting prices into database');

  await insertNewPriceCache(db, fundsWithPrices, new Date());
}
