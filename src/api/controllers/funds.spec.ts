import { getUnixTime } from 'date-fns';

import { getMaxAge, processFundHistory } from './funds';
import { FundPeriod, FundPrices } from '~api/types';

jest.mock('~api/queries');
jest.mock('~api/modules/crud/queries');

describe('funds controller', () => {
  describe(getMaxAge.name, () => {
    const now = new Date('2017-09-05');

    it.each`
      period              | length  | expectedDate
      ${FundPeriod.Year}  | ${1}    | ${'2016-09-05'}
      ${FundPeriod.Year}  | ${3}    | ${'2014-09-05'}
      ${FundPeriod.Month} | ${6}    | ${'2017-03-05'}
      ${FundPeriod.Ytd}   | ${null} | ${'2017-01-01'}
    `('should return the correct timestamp', ({ period, length, expectedDate }) => {
      expect.assertions(1);
      expect(getMaxAge(now, period, length)).toStrictEqual(new Date(expectedDate));
    });

    it('should handle a zero length', () => {
      expect.assertions(1);
      expect(getMaxAge(now, new Date(0), FundPeriod.Year, 0).getTime()).toBe(0);
      expect(getMaxAge(now, new Date('1987-05-02'), FundPeriod.Year, 0).getTime()).toBe(
        getUnixTime(new Date('1987-05-02')),
      );
    });
  });

  describe(processFundHistory.name, () => {
    const priceRows = [
      {
        time: new Date('2017-04-03 14:23:49').getTime(),
        id: [3, 22, 23, 24],
        price: [96.5, 100.2, 16.29, 1.23],
      },
      {
        time: new Date('2017-04-21 09:00:01').getTime(),
        id: [3, 22, 23, 25],
        price: [97.3, 100.03, 16.35, 67.08],
      },
      {
        time: new Date('2017-05-01 10:32:43').getTime(),
        id: [7, 3, 22, 23, 25],
        price: [10.21, 97.4, 100.1, 16.33, 67.22],
      },
      {
        time: new Date('2017-05-03 10:31:06').getTime(),
        id: [22, 25],
        price: [100.15, 66.98],
      },
    ];

    const maxAge = new Date('2020-04-20');

    it('should return the start time', () => {
      expect.assertions(1);
      expect(processFundHistory(maxAge, priceRows)).toStrictEqual(
        expect.objectContaining({
          startTime: getUnixTime(new Date('2017-04-03 14:23:49')),
        }),
      );
    });

    it('should return the cached times, relative to the start time', () => {
      expect.assertions(1);
      const result = processFundHistory(maxAge, priceRows);
      expect(result.cacheTimes).toMatchInlineSnapshot(`
        Array [
          0,
          1535772,
          2405334,
          2578037,
        ]
      `);
    });

    it('should return the prices objects', () => {
      expect.assertions(2);
      const result = processFundHistory(maxAge, priceRows);
      expect(result.prices).toHaveLength(6);

      expect(result).toStrictEqual(
        expect.objectContaining({
          prices: expect.arrayContaining<FundPrices>([
            {
              fundId: 3,
              groups: [
                {
                  startIndex: 0,
                  values: [96.5, 97.3, 97.4],
                },
              ],
            },
            {
              fundId: 22,
              groups: [
                {
                  startIndex: 0,
                  values: [100.2, 100.03, 100.1, 100.15],
                },
              ],
            },
            {
              fundId: 24,
              groups: [
                {
                  startIndex: 0,
                  values: [1.23],
                },
              ],
            },
            {
              fundId: 25,
              groups: [
                {
                  startIndex: 1,
                  values: [67.08, 67.22, 66.98],
                },
              ],
            },
            {
              fundId: 7,
              groups: [
                {
                  startIndex: 2,
                  values: [10.21],
                },
              ],
            },
            {
              fundId: 23,
              groups: [
                {
                  startIndex: 0,
                  values: [16.29, 16.35, 16.33],
                },
              ],
            },
          ]),
        }),
      );
    });

    describe('if a fund was sold and then re-bought', () => {
      const idFundNeverSold = 1776;
      const idFundOnceSold = 7619;

      const priceRowsRebought = [
        {
          time: new Date('2019-12-31').getTime(),
          id: [idFundNeverSold],
          price: [99.93],
        },
        {
          time: new Date('2020-01-01').getTime(),
          id: [idFundNeverSold, idFundOnceSold],
          price: [100, 200],
        },
        {
          time: new Date('2020-01-02').getTime(),
          id: [idFundNeverSold],
          price: [100.1],
        },
        {
          time: new Date('2020-01-03').getTime(),
          id: [idFundNeverSold, idFundOnceSold],
          price: [100.05, 196.54],
        },
      ];

      it('should split the prices into different groups', () => {
        expect.assertions(1);
        const result = processFundHistory(new Date('2020-04-20'), priceRowsRebought);

        expect(result).toStrictEqual(
          expect.objectContaining({
            prices: expect.arrayContaining<FundPrices>([
              {
                fundId: idFundNeverSold,
                groups: [
                  {
                    startIndex: 0,
                    values: [99.93, 100, 100.1, 100.05],
                  },
                ],
              },
              {
                fundId: idFundOnceSold,
                groups: [
                  {
                    startIndex: 1,
                    values: [200],
                  },
                  {
                    startIndex: 3,
                    values: [196.54],
                  },
                ],
              },
            ]),
          }),
        );
      });
    });
  });
});
