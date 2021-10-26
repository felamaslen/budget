import type { DatabaseTransactionConnectionType } from 'slonik';

import { getStockPrices } from './stocks';
import * as finance from '~api/modules/finance';
import * as redis from '~api/modules/redis';
import { StockPricesResponse } from '~api/types';

jest.mock('~api/modules/redis');

describe(getStockPrices.name, () => {
  let getMultipleStockQuotesSpy: jest.SpyInstance;

  beforeEach(() => {
    getMultipleStockQuotesSpy = jest.spyOn(finance, 'getMultipleStockQuotes').mockResolvedValue({
      'SMT.L': 1448.93,
      'CTY.L': 388.67,
    });
  });

  describe('when a request is not in progress', () => {
    beforeEach(() => {
      jest.spyOn(redis.redisClient, 'get').mockImplementation(async (key) => {
        if (key === 'stockPrice_REL.L') {
          return '2227.31';
        }
        return null;
      });
    });

    it('should return prices for the given codes', async () => {
      expect.assertions(2);
      const result = await getStockPrices({} as DatabaseTransactionConnectionType, 1, {
        codes: ['CTY.L', 'CTY.L', 'REL.L', 'SMT.L'],
      });

      expect(result).toStrictEqual(
        expect.objectContaining<Partial<StockPricesResponse>>({
          prices: expect.arrayContaining([
            { code: 'SMT.L', price: 1448.93 },
            { code: 'CTY.L', price: 388.67 },
            { code: 'REL.L', price: 2227.31 },
          ]),
        }),
      );
      expect(result.prices).toHaveLength(3);
    });

    it('should request new prices for any which are missing from the cache', async () => {
      expect.assertions(2);
      await getStockPrices({} as DatabaseTransactionConnectionType, 1, {
        codes: ['CTY.L', 'CTY.L', 'REL.L', 'SMT.L'],
      });

      expect(getMultipleStockQuotesSpy).toHaveBeenCalledTimes(1);
      expect(getMultipleStockQuotesSpy).toHaveBeenCalledWith(['CTY.L', 'SMT.L']);
    });
  });

  describe('when a request is in progress', () => {
    beforeEach(() => {
      jest.spyOn(redis.redisClient, 'get').mockImplementation(async (key) => {
        if (key === 'stockPrice_REL.L') {
          return '2227.31';
        }
        if (key === 'stockPriceLock') {
          return 'locked';
        }
        return null;
      });
    });

    it('should return cached prices where possible', async () => {
      expect.assertions(1);
      const result = await getStockPrices({} as DatabaseTransactionConnectionType, 1, {
        codes: ['CTY.L', 'CTY.L', 'REL.L', 'SMT.L'],
      });

      expect(result).toStrictEqual(
        expect.objectContaining<Partial<StockPricesResponse>>({
          prices: [{ code: 'REL.L', price: 2227.31 }],
        }),
      );
    });

    it('should not request new prices', async () => {
      expect.assertions(1);
      await getStockPrices({} as DatabaseTransactionConnectionType, 1, {
        codes: ['CTY.L', 'CTY.L', 'REL.L', 'SMT.L'],
      });

      expect(getMultipleStockQuotesSpy).not.toHaveBeenCalled();
    });
  });
});
