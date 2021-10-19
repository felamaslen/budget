import yahooFinance from 'yahoo-finance2';

import { getMultipleStockQuotes, getStockQuote } from './finance';
import { AsyncReturnType } from '~api/types';

describe('api finance module', () => {
  describe(getStockQuote.name, () => {
    let quoteSpy: jest.SpyInstance;
    beforeEach(() => {
      quoteSpy = jest.spyOn(yahooFinance, 'quote').mockResolvedValue({
        regularMarketPrice: 388.29,
      } as AsyncReturnType<typeof yahooFinance.quote>);
    });

    it('should return the market price of the given stock', async () => {
      expect.assertions(1);
      await expect(getStockQuote('TSLA')).resolves.toBe(388.29);
    });

    it('should call the finance API with the correct args', async () => {
      expect.assertions(2);
      await getStockQuote('TSLA');
      expect(quoteSpy).toHaveBeenCalledTimes(1);
      expect(quoteSpy).toHaveBeenCalledWith('TSLA');
    });
  });

  describe(getMultipleStockQuotes.name, () => {
    let quoteSpy: jest.SpyInstance;
    beforeEach(() => {
      quoteSpy = jest.spyOn(yahooFinance, 'quote').mockResolvedValue([
        {
          regularMarketPrice: 769.93,
          symbol: 'TSLA',
        },
        {
          regularMarketPrice: 137.72,
          symbol: 'AAPL',
        },
      ] as AsyncReturnType<typeof yahooFinance.quote>);
    });

    it('should return the market price of the given stocks', async () => {
      expect.assertions(1);
      await expect(getMultipleStockQuotes(['AAPL', 'MSFT', 'TSLA'])).resolves.toStrictEqual([
        137.72,
        null,
        769.93,
      ]);
    });

    it('should call the finance API with the correct args', async () => {
      expect.assertions(2);
      await getMultipleStockQuotes(['AAPL', 'MSFT', 'TSLA']);
      expect(quoteSpy).toHaveBeenCalledTimes(1);
      expect(quoteSpy).toHaveBeenCalledWith(['AAPL', 'MSFT', 'TSLA']);
    });
  });
});
