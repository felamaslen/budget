import yahooFinance from 'yahoo-finance';

import { getStockQuote } from './finance';

describe('aPI finance module', () => {
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
      await expect(getStockQuote('TSLA')).resolves.toBe(388.29);
    });
  });
});
