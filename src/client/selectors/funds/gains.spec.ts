import { getUnixTime } from 'date-fns';
import { rgb } from 'polished';
import numericHash from 'string-hash';

import { getRowGains, getFundMetadata, getDayGain, getDayGainAbs, RowGains } from './gains';
import { PriceCacheRebased } from './helpers';

import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import { FundNative } from '~client/types';
import { FundPeriod, PageNonStandard } from '~client/types/enum';

describe('funds selectors / gains', () => {
  const stateWithGains: State = {
    ...testState,
    api: {
      ...testState.api,
      appConfig: {
        ...testState.api.appConfig,
        historyOptions: { period: FundPeriod.Year, length: 1 },
      },
    },
    [PageNonStandard.Funds]: {
      viewSoldFunds: true,
      cashTarget: 0,
      items: [
        {
          id: numericHash('fund1'),
          item: 'Some fund',
          transactions: [
            {
              date: new Date('2019-10-09'),
              units: 345,
              price: 3.475,
              fees: 0,
              taxes: 0,
              drip: false,
              pension: false,
            },
          ],
          stockSplits: [],
          allocationTarget: 0,
        },
        {
          id: numericHash('fund2'),
          item: 'Other fund',
          transactions: [
            {
              date: new Date('2019-10-01'),
              units: 167,
              price: 589.838,
              fees: 0,
              taxes: 0,
              drip: false,
              pension: false,
            },
            {
              date: new Date('2019-10-27'),
              units: -23,
              price: 5.6522,
              fees: 0,
              taxes: 0,
              drip: false,
              pension: false,
            },
          ],
          stockSplits: [],
          allocationTarget: 0,
        },
      ],
      __optimistic: [undefined, undefined],
      startTime: getUnixTime(new Date('2019-10-10')),
      cacheTimes: [0, 86400 * 5, 86400 * 32],
      prices: {
        [numericHash('fund1')]: [
          {
            startIndex: 1,
            values: [109, 113.2],
          },
        ],
        [numericHash('fund2')]: [
          {
            startIndex: 0,
            values: [56.2, 57.9, 49.3],
          },
        ],
      },
      todayPrices: {},
      todayPriceFetchTime: null,
    },
  };

  describe('getRowGains', () => {
    it("should calculate the present value, gain and day-gain with today and yesterday's price", () => {
      expect.assertions(8);
      const result = getRowGains(
        [
          {
            id: numericHash('my-fund'),
            item: 'My fund',
            stockSplits: [],
            transactions: [
              {
                date: new Date('2014-05-11'),
                units: 104,
                price: 52.39,
                fees: 15,
                taxes: 35,
                drip: false,
                pension: false,
              },
            ],
          },
        ],
        {
          startTime: getUnixTime(new Date('2019-05-03T11:04:30Z')),
          cacheTimes: [0, 86400 * 1.5],
          prices: {
            [numericHash('my-fund')]: [
              { startIndex: 0, values: [56.23, 56.19], rebasePriceRatio: [1, 1] },
            ],
          },
        },
      );

      expect(result[numericHash('my-fund')]?.value).toBeCloseTo(104 * 56.19);
      expect(result[numericHash('my-fund')]?.gainAbs).toBeCloseTo(
        104 * (56.19 - 52.39) - (15 + 35),
        0,
      );
      expect(result[numericHash('my-fund')]?.dayGainAbs).toBeCloseTo(104 * (56.19 - 56.23), 0);

      expect(result[numericHash('my-fund')]?.gain).toBeCloseTo(
        (104 * (56.19 - 52.39) - (15 + 35)) / (104 * 52.39 + 15 + 35),
        0,
      );
      expect(result[numericHash('my-fund')]?.dayGain).toBeCloseTo(
        (104 * (56.19 - 56.23)) / (104 * 52.39 + 15 + 35),
        0,
      );

      expect(result[numericHash('my-fund')]?.price).toBe(56.19);
      expect(result[numericHash('my-fund')]?.previousPrice).toBe(56.23);

      expect(result[numericHash('my-fund')]).toMatchInlineSnapshot(`
        Object {
          "dayGain": -0.0008,
          "dayGainAbs": -4,
          "gain": 0.0628,
          "gainAbs": 345,
          "previousPrice": 56.23,
          "price": 56.19,
          "value": 5843.76,
        }
      `);
    });

    const fullRows: FundNative[] = [
      {
        id: numericHash('my-fund'),
        item: 'some fund',
        transactions: [
          {
            date: new Date('2014-03-10'),
            units: 104,
            price: 11.52,
            fees: 0,
            taxes: 0,
            drip: false,
            pension: false,
          },
        ],
        stockSplits: [],
      },
    ];
    const emptyRows: FundNative[] = [
      { id: numericHash('my-fund'), item: 'some fund', transactions: [], stockSplits: [] },
    ];

    const fullCache: PriceCacheRebased = {
      startTime: 0,
      cacheTimes: [0],
      prices: {
        [numericHash('my-fund')]: [{ startIndex: 0, values: [10.3], rebasePriceRatio: [] }],
      },
    };
    const noCache: PriceCacheRebased = {
      startTime: 0,
      cacheTimes: [],
      prices: {},
    };
    const emptyCache: PriceCacheRebased = {
      startTime: 0,
      cacheTimes: [0, 100],
      prices: {
        [numericHash('my-fund')]: [{ startIndex: 0, values: [], rebasePriceRatio: [] }],
      },
    };

    describe.each`
      case              | rows         | cache
      ${'transactions'} | ${emptyRows} | ${fullCache}
      ${'cache'}        | ${fullRows}  | ${noCache}
      ${'cache values'} | ${fullRows}  | ${emptyCache}
    `('for funds with no $case data', ({ rows, cache }) => {
      it('should return null', () => {
        expect.assertions(1);
        const result = getRowGains(rows, cache);

        expect(result).toStrictEqual(
          expect.objectContaining({
            [numericHash('my-fund')]: null,
          }),
        );
      });
    });

    it('should set the split-rebased cost, price and estimated value', () => {
      expect.assertions(1);
      const result = getRowGains(
        [
          {
            id: numericHash('some-fund'),
            item: 'some fund',
            transactions: [
              {
                price: 428,
                units: 934,
                fees: 148,
                taxes: 100,
                date: new Date('2017-07-09'),
                drip: false,
                pension: false,
              },
              {
                price: 495 / 5,
                units: 117,
                fees: 176,
                taxes: 85,
                date: new Date('2017-07-13'),
                drip: false,
                pension: false,
              },
              {
                price: 476 / 5 / 2,
                units: 220,
                fees: 82,
                taxes: 19,
                date: new Date('2017-07-20'),
                drip: false,
                pension: false,
              },
            ],
            stockSplits: [
              {
                date: new Date('2017-07-10'),
                ratio: 5,
              },
              {
                date: new Date('2017-07-19'),
                ratio: 2,
              },
            ],
            allocationTarget: 0,
          },
        ],
        {
          startTime: getUnixTime(new Date('2017-07-08')),
          cacheTimes: [
            86400 * 0, // 2017-07-08
            86400 * 1, // 2017-07-09
            86400 * 2, // 2017-07-10
            86400 * 3, // 2017-07-11
            86400 * 4, // 2017-07-12
            86400 * 5, // 2017-07-13
            86400 * 6, // 2017-07-14
            86400 * 7, // 2017-07-15
            86400 * 8, // 2017-07-16
            86400 * 9, // 2017-07-17
            86400 * 10, // 2017-07-18
            86400 * 11, // 2017-07-19
            86400 * 12, // 2017-07-20
            86400 * 13, // 2017-07-21
          ],
          prices: {
            [numericHash('some-fund')]: [
              {
                startIndex: 0,
                values: [
                  423.0, // 8 Jul
                  427.5, // 9 Jul
                  430.3 / 5, // 10 Jul (first stock split - x5)
                  475.9 / 5, // 11 Jul
                  483.0 / 5, // 12 Jul
                  492.4 / 5, // 13 Jul
                  499.1 / 5, // 14 Jul
                  491.0 / 5, // 15 Jul
                  485.0 / 5, // 16 Jul
                  469.0 / 5, // 17 Jul
                  472.0 / 5, // 18 Jul
                  483.0 / 5 / 2, // 19 Jul (second stock split - x2)
                  476.4 / 5 / 2, // 20 Jul
                ],
                rebasePriceRatio: [5 * 2, 5 * 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1],
              },
            ],
          },
        },
      );

      const expectedPrice = 476.4 / 5 / 2;
      const expectedPreviousPrice = 483.0 / 5 / 2;
      const expectedValue = (476.4 / 5 / 2) * (220 + 117 * 2 + 934 * 5 * 2);
      const expectedCost =
        428 * 934 +
        148 +
        100 + // 9 Jul
        ((495 / 5) * 117 + 176 + 85) + // 13 Jul
        ((476 / 5 / 2) * 220 + 82 + 19); // 20 Jul

      const expectedGainAbs = Math.round(expectedValue - expectedCost);
      const expectedGain = Number((expectedGainAbs / expectedCost).toFixed(4));

      expect(result).toStrictEqual({
        [numericHash('some-fund')]: expect.objectContaining<Partial<RowGains[string]>>({
          price: expectedPrice,
          previousPrice: expectedPreviousPrice,
          gainAbs: expectedGainAbs,
          value: expectedValue,
          gain: expectedGain,
        }),
      });
    });

    it('should use the buy cost', () => {
      expect.assertions(3);
      const result = getRowGains(
        [
          {
            id: numericHash('some-fund'),
            item: 'some fund',
            transactions: [
              {
                date: new Date('2020-04-20'),
                units: 100,
                price: 1.05,
                fees: 0,
                taxes: 0,
                drip: false,
                pension: false,
              },
              {
                date: new Date('2020-05-20'),
                units: -65,
                price: 1.8,
                fees: 0,
                taxes: 0,
                drip: false,
                pension: false,
              },
            ],
            stockSplits: [],
            allocationTarget: 0,
          },
        ],
        {
          startTime: 0,
          cacheTimes: [10],
          prices: {
            [numericHash('some-fund')]: [
              {
                startIndex: 0,
                values: [1.05, 1.8],
                rebasePriceRatio: [1, 1],
              },
            ],
          },
        },
      );

      expect(result[numericHash('some-fund')]?.value).toBeCloseTo((100 - 65) * 1.8);
      expect(result[numericHash('some-fund')]?.gainAbs).toBeCloseTo((100 - 65) * 1.8 + 117 - 105);
      expect(result[numericHash('some-fund')]?.gain).toBeCloseTo(
        ((100 - 65) * 1.8 + 117 - 105) / 105,
      );
    });
  });

  describe('getFundMetadata', () => {
    const rowGains: RowGains = {
      [numericHash('some-fund-1')]: {
        price: 452,
        previousPrice: 451.3,
        value: 399098.2,
        gain: -0.0023,
        gainAbs: -902,
        dayGain: 0.0075,
        dayGainAbs: 2989,
      },
      [numericHash('some-fund-2')]: {
        price: 193,
        previousPrice: 192.9,
        value: 50300,
        gain: 0.1178,
        gainAbs: 5300,
      },
      [numericHash('some-fund-3')]: {
        price: 671,
        previousPrice: 682.9,
        value: 80760,
        gain: -0.1027,
        gainAbs: -9240,
      },
      [numericHash('some-fund-4')]: {
        price: 172,
        previousPrice: 177.39,
        value: 265622,
        gain: 0.3281,
        gainAbs: 65622,
      },
      [numericHash('some-fund-5')]: {
        price: 88,
        previousPrice: 87.98,
        value: 2600,
        gain: 0,
        gainAbs: 0,
      },
      'some-id': null,
    };

    it.each`
      id                            | expected
      ${numericHash('some-fund-1')} | ${rgb(255, 250, 250)}
      ${numericHash('some-fund-2')} | ${rgb(163, 246, 170)}
      ${numericHash('some-fund-3')} | ${rgb(255, 44, 44)}
      ${numericHash('some-fund-4')} | ${rgb(0, 230, 18)}
      ${numericHash('some-fund-5')} | ${rgb(255, 255, 255)}
    `('should set the colour for fund ID $id to $expected', ({ id, expected }) => {
      expect.assertions(1);
      expect(getFundMetadata(rowGains, id)?.color).toBe(expected);
    });

    it('should return null for a fund ID which does not exist', () => {
      expect.assertions(1);
      expect(getFundMetadata(rowGains, numericHash('NOEXIST'))).toBeNull();
    });

    it('should return null if there are no gain data for the fund', () => {
      expect.assertions(1);
      expect(getFundMetadata(rowGains, numericHash('some-id'))).toBeNull();
    });
  });

  describe('getDayGainAbs', () => {
    it('should return the absolute gain from the previous scrape, taking into account cost changes', () => {
      expect.assertions(1);

      const valueLatest = 345 * 113.2 + (167 - 23) * 49.3;
      const valuePrev = 345 * 109 + 167 * 57.9;

      const costLatest = 1199 + 98503 - 130;
      const costPrev = 1199 + 98503;

      expect(getDayGainAbs(stateWithGains)).toBeCloseTo(
        valueLatest - valuePrev - (costLatest - costPrev),
      );
    });

    describe('when the latest price is missing for a fund', () => {
      const stateWithMissingLatestPrice: State = {
        ...stateWithGains,
        [PageNonStandard.Funds]: {
          ...stateWithGains[PageNonStandard.Funds],
          prices: {
            ...stateWithGains[PageNonStandard.Funds].prices,
            [numericHash('fund1')]: [
              {
                startIndex: 1,
                values: [109],
              },
            ],
          },
        },
      };

      it('should use the latest available price for the fund', () => {
        expect.assertions(1);

        const valueLatest = 345 * 109 + (167 - 23) * 49.3;
        const valuePrev = 345 * 109 + 167 * 57.9;

        const costLatest = 1199 + 98503 - 130;
        const costPrev = 1199 + 98503;

        expect(getDayGainAbs(stateWithMissingLatestPrice)).toBeCloseTo(
          valueLatest - valuePrev - (costLatest - costPrev),
        );
      });
    });

    describe('when a fund had its stock split', () => {
      const stateWithStockSplit: State = {
        ...stateWithGains,
        [PageNonStandard.Funds]: {
          ...stateWithGains[PageNonStandard.Funds],
          items: [
            {
              ...stateWithGains[PageNonStandard.Funds].items[0],
              stockSplits: [
                {
                  date: new Date('2019-11-05'),
                  ratio: 3,
                },
              ],
            },
          ],
        },
      };

      it('should use the rebased price to calculate the gain', () => {
        expect.assertions(1);

        const valueLatest = 345 * 113.2 * 3;
        const valuePrev = 345 * 109;

        const costLatest = 345 * 3.475;
        const costPrev = 345 * 3.475;

        expect(getDayGainAbs(stateWithStockSplit)).toBeCloseTo(
          valueLatest - valuePrev - (costLatest - costPrev),
        );
      });
    });
  });

  describe('getDayGain', () => {
    it('should return the gain from the previous scrape, taking into account cost changes', () => {
      expect.assertions(1);
      const costLatest = 1199 + (98503 - 130);
      const costPrev = 1199 + 98503;

      const valueLatest = 345 * 113.2 + (167 - 23) * 49.3;

      // on the second cache item, the 2019-10-27 transaction is in the future
      const valuePrev = 345 * 109 + 167 * 57.9;

      expect(getDayGain(stateWithGains)).toBeCloseTo(
        (valueLatest - valuePrev - (costLatest - costPrev)) / valuePrev,
      );
    });

    describe('when a fund has only one scraped price', () => {
      const stateOne = {
        ...stateWithGains,
        [PageNonStandard.Funds]: {
          ...stateWithGains.funds,
          prices: {
            ...stateWithGains.funds.prices,
            [numericHash('fund1')]: [
              {
                ...stateWithGains.funds.prices[numericHash('fund1')][0],
                values: [427.3],
              },
            ],
          },
        },
      };

      it('should not be NaN', () => {
        expect.assertions(1);
        const result = getDayGain(stateOne);
        expect(result).not.toBeNaN();
      });
    });

    describe('when there are no items', () => {
      const stateNone: State = {
        ...stateWithGains,
        api: {
          ...testState.api,
          appConfig: {
            ...testState.api.appConfig,
            historyOptions: { period: FundPeriod.Year, length: 5 },
          },
        },
        [PageNonStandard.Funds]: {
          ...stateWithGains[PageNonStandard.Funds],
          items: [],
          __optimistic: [],
          startTime: getUnixTime(new Date('2019-10-10')),
          cacheTimes: [0, 86400 * 5, 86400 * 32],
          prices: {
            [numericHash('fund1')]: [
              {
                startIndex: 1,
                values: [109, 113.2],
              },
            ],
            [numericHash('fund2')]: [
              {
                startIndex: 0,
                values: [56.2, 57.9, 49.3],
              },
            ],
          },
        },
      };

      it('should return 0', () => {
        expect.assertions(1);
        expect(getDayGain(stateNone)).toBe(0);
      });
    });

    describe('when there is no cache', () => {
      const stateNoCache: State = {
        ...stateWithGains,
        [PageNonStandard.Funds]: {
          ...stateWithGains[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('fund1'),
              item: 'Some fund',
              transactions: [
                {
                  date: new Date('2019-10-09'),
                  units: 345,
                  price: 3.47536,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
              ],
              stockSplits: [],
              allocationTarget: 0,
            },
            {
              id: numericHash('fund2'),
              item: 'Other fund',
              transactions: [
                {
                  date: new Date('2019-10-01'),
                  units: 167,
                  price: 589.838,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
                {
                  date: new Date('2019-10-27'),
                  units: -23,
                  price: 5.65217,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
              ],
              stockSplits: [],
              allocationTarget: 0,
            },
          ],
          prices: {},
        },
      };

      it('should return 0', () => {
        expect.assertions(1);
        expect(getDayGain(stateNoCache)).toBe(0);
      });
    });

    describe('when the cache contains only one item', () => {
      const stateOneItem: State = {
        ...stateWithGains,
        [PageNonStandard.Funds]: {
          ...stateWithGains[PageNonStandard.Funds],
          items: [
            {
              id: numericHash('fund1'),
              item: 'Some fund',
              transactions: [
                {
                  date: new Date('2019-10-09'),
                  units: 345,
                  price: 3.47536,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
              ],
              stockSplits: [],
              allocationTarget: 0,
            },
            {
              id: numericHash('fund2'),
              item: 'Other fund',
              transactions: [
                {
                  date: new Date('2019-10-01'),
                  units: 167,
                  price: 589.838,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
                {
                  date: new Date('2019-10-27'),
                  units: -23,
                  price: 5.65217,
                  fees: 0,
                  taxes: 0,
                  drip: false,
                  pension: false,
                },
              ],
              stockSplits: [],
              allocationTarget: 0,
            },
          ],
          startTime: getUnixTime(new Date('2019-10-10')),
          cacheTimes: [10],
          prices: {
            [numericHash('fund1')]: [
              {
                startIndex: 1,
                values: [109, 113.2],
              },
            ],
            [numericHash('fund2')]: [
              {
                startIndex: 0,
                values: [56.2, 57.9, 49.3],
              },
            ],
          },
        },
      };

      it('should return 0', () => {
        expect.assertions(1);
        expect(getDayGain(stateOneItem)).toBe(0);
      });
    });
  });
});
