import yahooFinance from 'yahoo-finance';

import logger from '~api/modules/logger';

export async function getStockQuote(symbol: string): Promise<number | null> {
  const quote = await yahooFinance.quote(symbol, ['price']);
  return quote?.price.regularMarketPrice ?? null;
}

export async function getMultipleStockQuotes(symbols: string[]): Promise<(number | null)[]> {
  logger.verbose('[stock-prices] Fetching new prices: %s', symbols.join(','));
  const quotes = await yahooFinance.quote({
    symbols,
    modules: ['price'],
  });
  return Object.values(quotes).map((quote) => quote?.price.regularMarketPrice ?? null);
}
