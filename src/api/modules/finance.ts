import yahooFinance from 'yahoo-finance2';

import logger from '~api/modules/logger';

export async function getMultipleStockQuotes(
  symbols: string[],
): Promise<Record<string, number | null>> {
  const quotes = await yahooFinance.quote(symbols);
  const prices = symbols.reduce<Record<string, number | null>>(
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
  logger.info('[stock-prices] Fetched new prices', {
    symbols,
    prices,
  });
  return prices;
}
