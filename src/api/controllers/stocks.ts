import { isValid } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import { getMultipleStockQuotes } from '~api/modules/finance';
import logger from '~api/modules/logger';
import { redisClient } from '~api/modules/redis';
import { QueryStockPricesArgs, StockPrice, StockPricesResponse } from '~api/types';

const codeKey = (code: string): string => `stockPrice_${code}`;
const lockKey = 'stockPriceLock';
const lastUpdateKey = 'stockPriceUpdateTime';

const cacheExpirySeconds = process.env.NODE_ENV === 'development' ? 86400 : 60 * 5;

async function getStockPricesFromApi(codes: string[]): Promise<(number | null)[]> {
  if (!codes.length) {
    return [];
  }
  const quotes = await getMultipleStockQuotes(codes);
  await Promise.all(
    codes.map((code, index) =>
      redisClient.set(codeKey(code), quotes[index] ?? 0, 'ex', cacheExpirySeconds),
    ),
  );
  await redisClient.set(lastUpdateKey, new Date().toISOString());

  return quotes;
}

async function getCachedStockPrices(codes: string[]): Promise<StockPrice[]> {
  const existingPrices = await Promise.all(codes.map((code) => redisClient.get(codeKey(code))));
  const codesToFetchFresh = existingPrices.reduce<string[]>(
    (last, price, index) => (price === null ? [...last, codes[index]] : last),
    [],
  );

  const pricesFromApi = await getStockPricesFromApi(codesToFetchFresh);

  return [
    ...existingPrices
      .map<StockPrice>((price, index) => ({ code: codes[index], price: Number(price) || null }))
      .filter(({ price }) => price !== null),

    ...pricesFromApi.map<StockPrice>((price, index) => ({
      code: codesToFetchFresh[index],
      price,
    })),
  ];
}

export async function getStockPrices(
  _: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryStockPricesArgs,
): Promise<StockPricesResponse> {
  if (!uid) {
    return { error: 'Must be logged in', prices: [] };
  }

  const lock = await redisClient.get(lockKey);
  if (lock !== null) {
    logger.verbose('[stock-prices] returning empty object as request is locked');
    return { prices: [] };
  }

  await redisClient.set(lockKey, 'locked', 'ex', cacheExpirySeconds);

  const uniqueCodes = Array.from(new Set(args.codes));
  const prices = await getCachedStockPrices(uniqueCodes);
  const refreshTimeRaw = await redisClient.get(lastUpdateKey);
  const refreshTimeDate = refreshTimeRaw ? new Date(refreshTimeRaw) : null;
  const refreshTime = isValid(refreshTimeDate) ? refreshTimeDate : null;

  await redisClient.del(lockKey);

  return { prices, refreshTime };
}