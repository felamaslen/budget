import { getUnixTime } from 'date-fns';
import { DatabaseTransactionConnectionType } from 'slonik';

import {
  createFund,
  deleteFund,
  getMaxAge,
  processFundHistory,
  updateCashTarget,
  updateFund,
  updateFundAllocationTargets,
} from './funds';
import * as overview from './overview';
import * as crudQueries from '~api/modules/crud/queries';
import * as pubsub from '~api/modules/graphql/pubsub';
import * as queries from '~api/queries';
import {
  FundInput,
  FundPeriod,
  FundPrices,
  FundSubscription,
  MutationCreateFundArgs,
  MutationDeleteFundArgs,
  MutationUpdateFundArgs,
  NetWorthCashTotal,
} from '~api/types';

jest.mock('~api/queries');
jest.mock('~api/modules/crud/queries');

describe('Funds controller', () => {
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
      expect(getMaxAge(now, FundPeriod.Year, 0).getTime()).toBe(0);
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

  describe(createFund.name, () => {
    const uid = 1823;

    it('should publish the created fund and updated cash total', async () => {
      expect.assertions(3);

      const publishSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();

      jest.spyOn(crudQueries, 'insertCrudItem').mockResolvedValueOnce({ id: 781 });
      jest.spyOn(overview, 'getDisplayedFundValues').mockResolvedValueOnce([1, 7, 23]);

      const args: MutationCreateFundArgs = {
        fakeId: -8813,
        input: {
          item: 'Some fund',
          allocationTarget: 37,
          transactions: [
            {
              date: new Date('2020-04-20'),
              units: 3,
              price: 21,
              fees: 13,
              taxes: 7,
              drip: false,
              pension: false,
            },
          ],
        },
      };

      await createFund({} as DatabaseTransactionConnectionType, uid, args);

      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy).toHaveBeenCalledWith<[string, FundSubscription]>(
        `${pubsub.PubSubTopic.FundsChanged}.${uid}`,
        {
          created: {
            fakeId: -8813,
            item: {
              ...args.input,
              id: 781,
              transactions: [
                {
                  date: new Date('2020-04-20'),
                  units: 3,
                  price: 21,
                  fees: 13,
                  taxes: 7,
                  drip: false,
                  pension: false,
                },
              ],
              stockSplits: [],
            },
          },
          overviewCost: [1, 7, 23],
        },
      );
      expect(publishSpy).toHaveBeenCalledWith<[string, NetWorthCashTotal]>(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${uid}`,
        {
          cashInBank: expect.any(Number),
          stockValue: expect.any(Number),
          stocksIncludingCash: expect.any(Number),
          date: null,
          incomeSince: expect.any(Number),
          spendingSince: expect.any(Number),
        },
      );
    });
  });

  describe(updateFund.name, () => {
    const uid = 71;

    it('should publish to the pubsub topic', async () => {
      expect.assertions(3);

      const input: FundInput = {
        item: 'Some fund',
        allocationTarget: 37,
        transactions: [
          {
            date: new Date('2020-04-20'),
            units: 3,
            price: 21,
            fees: 13,
            taxes: 7,
            drip: false,
            pension: false,
          },
        ],
        stockSplits: [{ date: new Date('2020-05-10'), ratio: 6 }],
      };

      const publishSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();

      jest.spyOn(crudQueries, 'updateCrudItem').mockResolvedValueOnce({ ...input, id: 792 });
      jest.spyOn(overview, 'getDisplayedFundValues').mockResolvedValueOnce([1, 7, 23]);

      const args: MutationUpdateFundArgs = {
        id: 792,
        input,
      };

      await updateFund({} as DatabaseTransactionConnectionType, uid, args);

      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy).toHaveBeenCalledWith<[string, FundSubscription]>(
        `${pubsub.PubSubTopic.FundsChanged}.${uid}`,
        {
          updated: {
            ...args.input,
            id: args.id,
            transactions: [
              {
                date: new Date('2020-04-20'),
                units: 3,
                price: 21,
                fees: 13,
                taxes: 7,
                drip: false,
                pension: false,
              },
            ],
            stockSplits: [{ date: new Date('2020-05-10'), ratio: 6 }],
          },
          overviewCost: [1, 7, 23],
        },
      );
      expect(publishSpy).toHaveBeenCalledWith<[string, NetWorthCashTotal]>(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${uid}`,
        {
          cashInBank: expect.any(Number),
          stockValue: expect.any(Number),
          stocksIncludingCash: expect.any(Number),
          date: null,
          incomeSince: expect.any(Number),
          spendingSince: expect.any(Number),
        },
      );
    });
  });

  describe(deleteFund.name, () => {
    const uid = 71;

    it('should publish to the pubsub topic', async () => {
      expect.assertions(3);

      jest.spyOn(crudQueries, 'deleteCrudItem').mockResolvedValueOnce(1);
      jest.spyOn(overview, 'getDisplayedFundValues').mockResolvedValueOnce([1, 7, 23]);

      const publishSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();

      const args: MutationDeleteFundArgs = {
        id: 118,
      };

      await deleteFund({} as DatabaseTransactionConnectionType, uid, args);

      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy).toHaveBeenCalledWith<[string, FundSubscription]>(
        `${pubsub.PubSubTopic.FundsChanged}.${uid}`,
        {
          deleted: 118,
          overviewCost: [1, 7, 23],
        },
      );
      expect(publishSpy).toHaveBeenCalledWith<[string, NetWorthCashTotal]>(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${uid}`,
        {
          cashInBank: expect.any(Number),
          stockValue: expect.any(Number),
          stocksIncludingCash: expect.any(Number),
          date: null,
          incomeSince: expect.any(Number),
          spendingSince: expect.any(Number),
        },
      );
    });
  });

  describe(updateCashTarget.name, () => {
    it('should publish a message to the queue', async () => {
      expect.assertions(2);

      const publishSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();

      await updateCashTarget({} as DatabaseTransactionConnectionType, 37, { target: 724000 });

      expect(publishSpy).toHaveBeenCalledTimes(1);
      expect(publishSpy).toHaveBeenCalledWith(
        `${pubsub.PubSubTopic.CashAllocationTargetUpdated}.37`,
        724000,
      );
    });
  });

  describe(updateFundAllocationTargets.name, () => {
    it('should publish a message to the queue', async () => {
      expect.assertions(2);

      jest
        .spyOn(queries, 'updateAllocationTarget')
        .mockResolvedValueOnce({ id: 3, allocation_target: 17 })
        .mockResolvedValueOnce({ id: 21, allocation_target: 9 });

      const uid = 130;

      const publishSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();

      await updateFundAllocationTargets({} as DatabaseTransactionConnectionType, uid, {
        deltas: [
          { id: 3, allocationTarget: 17 },
          { id: 21, allocationTarget: 11 },
        ],
      });

      expect(publishSpy).toHaveBeenCalledTimes(1);
      expect(publishSpy).toHaveBeenCalledWith(
        `${pubsub.PubSubTopic.FundAllocationTargetsUpdated}.${uid}`,
        {
          deltas: expect.arrayContaining([
            { id: 3, allocationTarget: 17 },
            { id: 21, allocationTarget: 9 },
          ]),
        },
      );
    });
  });
});
