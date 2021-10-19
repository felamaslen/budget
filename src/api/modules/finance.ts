import yahooFinance from 'yahoo-finance2';

import logger from '~api/modules/logger';

export async function getStockQuote(symbol: string): Promise<number | null> {
  const quote = await yahooFinance.quote(symbol);
  return quote.regularMarketPrice ?? null;
}

export async function getMultipleStockQuotes(symbols: string[]): Promise<(number | null)[]> {
  logger.verbose('[stock-prices] Fetching new prices: %s', symbols.join(','));
  const quotes = await yahooFinance.quote(symbols);
  return symbols.map(
    (symbol) => quotes.find((compare) => compare.symbol === symbol)?.regularMarketPrice ?? null,
  );
}
