import yahooFinance from 'yahoo-finance';

export async function getStockQuote(symbol: string): Promise<number> {
  const quote = await yahooFinance.quote<'price'>(symbol, ['price']);

  return quote.price.regularMarketPrice;
}
