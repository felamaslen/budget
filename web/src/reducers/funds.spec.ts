import numericHash from 'string-hash';

import reducer, { State, initialState } from './funds';
import {
  ActionTypeApi,
  ActionTypeFunds,
  allocationTargetsUpdated,
  cashTargetUpdated,
  dataRead,
  fundPricesUpdated,
  fundQueryUpdated,
  fundsViewSoldToggled,
  todayPricesFetched,
} from '~client/actions';
import { testResponse, testState } from '~client/test-data';
import type { FundQuotes, GQL } from '~client/types';
import { FundPeriod, PageNonStandard } from '~client/types/enum';
import type { FundHistory, InitialQuery } from '~client/types/gql';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('Funds reducer', () => {
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
            transactions: [{ date: '2019-06-30', units: 100, price: 99.23, fees: 0, taxes: 0 }],
            allocationTarget: 0,
          },
          {
            id: numericHash('id-2'),
            item: 'My fund 2',
            transactions: [],
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
              { date: new Date('2019-06-30'), units: 100, price: 99.23, fees: 0, taxes: 0 },
            ],
            allocationTarget: 0,
          },
          { id: numericHash('id-2'), item: 'My fund 2', transactions: [], allocationTarget: 0.3 },
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

  describe(ActionTypeFunds.QueryUpdated, () => {
    it('should set the query', () => {
      expect.assertions(1);
      const result = reducer(
        initialState,
        fundQueryUpdated({
          period: FundPeriod.Year,
          length: 7,
        }),
      );

      expect(result.historyOptions).toStrictEqual({
        period: FundPeriod.Year,
        length: 7,
      });
    });
  });

  describe(ActionTypeFunds.PricesUpdated, () => {
    const res: GQL<FundHistory> = {
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
    const action = todayPricesFetched(quotes);

    it("should set today's prices", () => {
      expect.assertions(1);
      const result = reducer(
        {
          ...initialState,
          todayPrices: {
            13: 652.49,
          },
        },
        action,
      );
      expect(result.todayPrices).toStrictEqual({
        13: 652.49,
        17: 1185.32,
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
      { id: 10, allocationTarget: 13 },
      { id: 1, allocationTarget: 77 },
    ]);

    it('should update the allocation targets in state', () => {
      expect.assertions(1);
      const result = reducer(testState.funds, action);

      expect(result.items).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 10,
            allocationTarget: 13,
          }),
          expect.objectContaining({
            id: 3,
            allocationTarget: 0,
          }),
          expect.objectContaining({
            id: 1,
            allocationTarget: 77,
          }),
          expect.objectContaining({
            id: 5,
            allocationTarget: 0,
          }),
        ]),
      );
    });
  });
});
