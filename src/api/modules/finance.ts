import yahooFinance from 'yahoo-finance2';

import logger from '~api/modules/logger';

export async function getMultipleStockQuotes(
  symbols: string[],
): Promise<Record<string, number | null>> {
  logger.verbose('[stock-prices] Fetching new prices: %s', symbols.join(','));
  const quotes = await yahooFinance.quote(symbols);
  return symbols.reduce<Record<string, number | null>>(
    (last, symbol) => ({
      ...last,
      [symbol]:
        Reflect.get(
          quotes.find((compare) => compare.symbol === symbol) ?? {},
          'regularMarketPrice',
        ) ?? null,
    }),
    {},
  );
}
