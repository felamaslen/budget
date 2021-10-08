import axios from 'axios';
import { DatabaseTransactionConnectionType } from 'slonik';
import config from '~api/config';
import logger from '~api/modules/logger';

import { redisClient } from '~api/modules/redis';
import { ExchangeRate, ExchangeRatesResponse, QueryExchangeRatesArgs } from '~api/types';

type Rates = Record<string, number>;

type OpenExchangeRatesApiResponse = {
  disclaimer: string;
  license: string;
  timestamp: number;
  base: string;
  rates: Rates;
};

type RawExchangeRates = Pick<OpenExchangeRatesApiResponse, 'base' | 'rates'>;

const currencyCacheKey = 'currencies';

export async function getOrFetchExchangeRates(): Promise<RawExchangeRates> {
  const cachedRates = await redisClient.get(currencyCacheKey);
  if (cachedRates) {
    logger.verbose('Fetching cached exchange rates');
    return JSON.parse(cachedRates) as RawExchangeRates;
  }

  logger.info('Fetching exchange rates from API');
  const res = await axios.get<OpenExchangeRatesApiResponse>(
    `https://openexchangerates.org/api/latest.json?app_id=${config.openExchangeRatesApiKey}`,
    { timeout: config.scrapeTimeout },
  );

  await redisClient.set(
    currencyCacheKey,
    JSON.stringify({
      base: res.data.base,
      rates: res.data.rates,
    }),
    'ex',
    config.apiCacheExpirySeconds,
  );

  return res.data;
}

function convertRatesBase(rates: Rates, newBase: string): ExchangeRate[] {
  if (!rates[newBase]) {
    return [];
  }
  return Object.entries(rates).reduce<ExchangeRate[]>(
    (last, [currency, rate]) => [
      ...last,
      {
        currency,
        rate: rate / rates[newBase], // newBase / currency = (oldBase / currency) / (oldBase / newBase)
      },
    ],
    [],
  );
}

export async function getExchangeRates(
  _: DatabaseTransactionConnectionType,
  __: number,
  args: QueryExchangeRatesArgs,
): Promise<ExchangeRatesResponse> {
  try {
    const rawExchangeRates = await getOrFetchExchangeRates();
    const rates = convertRatesBase(rawExchangeRates.rates, args.base);
    return { error: null, rates };
  } catch (err) {
    return { error: (err as Error).message, rates: null };
  }
}
