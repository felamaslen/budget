import yahooFinance from 'yahoo-finance';

import { getStockQuote } from './finance';

describe('API finance module', () => {
  describe('getStockQuote', () => {
    beforeEach(() => {
      jest.spyOn(yahooFinance, 'quote').mockResolvedValue({
        price: {
          regularMarketPrice: 388.29,
        } as yahooFinance.Quote<'price'>['price'],
      } as yahooFinance.QuoteBase);
    });

    it('should return the market price of the given stock', async () => {
      expect.assertions(1);
      expect(await getStockQuote('TSLA')).toBe(388.29);
    });
  });
});
