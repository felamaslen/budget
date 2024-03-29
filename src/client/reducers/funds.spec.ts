import numericHash from 'string-hash';

import reducer, { State, initialState } from './funds';
import {
  ActionTypeApi,
  ActionTypeFunds,
  allocationTargetsUpdated,
  cashTargetUpdated,
  dataRead,
  fundPricesUpdated,
  fundsViewSoldToggled,
  todayPricesFetched,
} from '~client/actions';
import { testResponse, testState } from '~client/test-data';
import type { FundQuotes } from '~client/types';
import { PageNonStandard } from '~client/types/enum';
import type { FundHistory, InitialQuery } from '~client/types/gql';
import type { GQL } from '~shared/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('funds reducer', () => {
  describe(ActionTypeFunds.ViewSoldToggled, () => {
    const action = fundsViewSoldToggled();

    it('should toggle the view sold status', () => {
      expect.assertions(2);

      expect(
        reducer(
          {
            ...initialState,
            viewSoldFunds: false,
          },
          action,
        ),
      ).toHaveProperty('viewSoldFunds', true);

      expect(
        reducer(
          {
            ...initialState,
            viewSoldFunds: true,
          },
          action,
        ),
      ).toHaveProperty('viewSoldFunds', false);
    });
  });

  describe(ActionTypeApi.DataRead, () => {
    const res: InitialQuery = {
      ...testResponse,
      [PageNonStandard.Funds]: {
        items: [
          {
            id: numericHash('id-1'),
            item: 'My fund 1',
            transactions: [
              {
                date: '2019-06-30',
                units: 100,
                price: 99.23,
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
            id: numericHash('id-2'),
            item: 'My fund 2',
            transactions: [],
            stockSplits: [],
            allocationTarget: 0.3,
          },
        ],
      },
      cashAllocationTarget: 2500000,
      fundHistory: {
        startTime: 1000,
        cacheTimes: [1, 2, 100, 183],
        annualisedFundReturns: 0.186,
        overviewCost: [996, 1923],
        prices: [
          {
            fundId: numericHash('id-1'),
            groups: [
              {
                startIndex: 1,
                values: [45, 45.6, 44.9],
              },
            ],
          },
          {
            fundId: numericHash('id-2'),
            groups: [
              {
                startIndex: 0,
                values: [101.2, 100.94, 101.4, 102.03],
              },
            ],
          },
        ],
      },
    };

    const action = dataRead(res);

    it('should set funds-related properties', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result).toStrictEqual<State>({
        ...initialState,
        cashTarget: 2500000,
        items: [
          {
            id: numericHash('id-1'),
            item: 'My fund 1',
            transactions: [
              {
                date: new Date('2019-06-30'),
                units: 100,
                price: 99.23,
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
            id: numericHash('id-2'),
            item: 'My fund 2',
            transactions: [],
            stockSplits: [],
            allocationTarget: 0.3,
          },
        ],
        __optimistic: [undefined, undefined],
        startTime: 1000,
        cacheTimes: [1, 2, 100, 183],
        prices: {
          [numericHash('id-1')]: [{ startIndex: 1, values: [45, 45.6, 44.9] }],
          [numericHash('id-2')]: [{ startIndex: 0, values: [101.2, 100.94, 101.4, 102.03] }],
        },
      });
    });
  });

  describe(ActionTypeFunds.PricesUpdated, () => {
    const res: GQL<Omit<FundHistory, 'latestValue'>> = {
      startTime: 1430,
      cacheTimes: [2, 100, 183],
      annualisedFundReturns: 0.674,
      overviewCost: [991],
      prices: [
        {
          fundId: numericHash('id-1'),
          groups: [
            {
              startIndex: 1,
              values: [45.6, 44.9],
            },
          ],
        },
        {
          fundId: numericHash('id-2'),
          groups: [
            {
              startIndex: 0,
              values: [100.94, 101.4, 102.03],
            },
          ],
        },
      ],
    };

    const action = fundPricesUpdated(res);

    it('should not touch the current items list', () => {
      expect.assertions(1);

      const result = reducer(initialState, action);
      expect(result.items).toBe(initialState.items);
    });

    it('should set the new values', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result).toStrictEqual(
        expect.objectContaining({
          startTime: 1430,
          cacheTimes: [2, 100, 183],
          prices: {
            [numericHash('id-1')]: [{ startIndex: 1, values: [45.6, 44.9] }],
            [numericHash('id-2')]: [{ startIndex: 0, values: [100.94, 101.4, 102.03] }],
          },
        }),
      );
    });
  });

  describe(ActionTypeFunds.TodayPricesFetched, () => {
    const quotes: FundQuotes = {
      17: 1185.32,
    };
    const action = todayPricesFetched(quotes, '2020-04-20T13:11:20Z');

    const stateWithExistingTodayPrices: State = {
      ...initialState,
      todayPrices: {
        13: 652.49,
      },
    };

    it("should set today's prices", () => {
      expect.assertions(1);
      const result = reducer(stateWithExistingTodayPrices, action);
      expect(result.todayPrices).toStrictEqual({
        13: 652.49,
        17: 1185.32,
      });
    });

    it('should set the fetch time', () => {
      expect.assertions(1);
      const result = reducer(stateWithExistingTodayPrices, action);
      expect(result.todayPriceFetchTime).toStrictEqual(new Date('2020-04-20T13:11:20Z'));
    });

    describe('when every price is the same as the latest existing price', () => {
      const stateWithScrapedPrices: State = {
        ...initialState,
        prices: {
          11: [{ startIndex: 1, values: [671, 693.2] }],
          19: [
            { startIndex: 10, values: [106] },
            { startIndex: 3, values: [109] },
          ],
          21: [{ startIndex: 13, values: [97] }],
        },
      };

      const actionNoUpdate = todayPricesFetched({
        11: 693.2,
        19: 109,
      });

      it('should not update the state', () => {
        expect.assertions(2);
        const result = reducer(stateWithScrapedPrices, actionNoUpdate);
        expect(result.todayPrices).toStrictEqual({});
        expect(result.todayPriceFetchTime).toBeNull();
      });
    });
  });

  describe(ActionTypeFunds.CashTargetUpdated, () => {
    const action = cashTargetUpdated(4500000);

    it('should update the cash target in state', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result.cashTarget).toBe(4500000);
    });
  });

  describe(ActionTypeFunds.AllocationTargetsUpdated, () => {
    const action = allocationTargetsUpdated([
      { id: numericHash('some-fund-1'), allocationTarget: 13 },
      { id: numericHash('some-fund-3'), allocationTarget: 77 },
    ]);

    it('should update the allocation targets in state', () => {
      expect.assertions(1);
      const result = reducer(testState.funds, action);

      expect(result.items).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: numericHash('some-fund-1'),
            allocationTarget: 13,
          }),
          expect.objectContaining({
            id: numericHash('some-fund-2'),
            allocationTarget: 0,
          }),
          expect.objectContaining({
            id: numericHash('some-fund-3'),
            allocationTarget: 77,
          }),
          expect.objectContaining({
            id: numericHash('some-fund-4'),
            allocationTarget: 0,
          }),
        ]),
      );
    });
  });
});
