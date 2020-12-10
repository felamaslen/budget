import yahooFinance from 'yahoo-finance';

export async function getStockQuote(symbol: string): Promise<number | null> {
  const quote = await yahooFinance.quote(symbol, ['price']);

  return quote?.price.regularMarketPrice ?? null;
}
