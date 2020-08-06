import { AxiosResponse } from 'axios';
import numericHash from 'string-hash';
import reducer, { State, initialState } from './funds';
import {
  dataRead,
  fundsViewSoldToggled,
  cashTargetUpdated,
  fundsReceived,
  ListActionType,
  listItemCreated,
  listItemUpdated,
  listItemDeleted,
  ListItemUpdated,
  ActionTypeFunds,
} from '~client/actions';
import { DataKeyAbbr } from '~client/constants/api';
import { Period } from '~client/constants/graph';
import { getTransactionsList } from '~client/modules/data';
import { testResponse } from '~client/test-data';
import { Page, ReadResponseFunds, ReadResponse, Fund } from '~client/types';

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

  describe('DATA_READ', () => {
    const res: ReadResponse = {
      ...testResponse,
      [Page.funds]: {
        startTime: 1000,
        cacheTimes: [1, 2, 100, 183],
        cashTarget: 2500000,
        data: [
          {
            [DataKeyAbbr.id]: numericHash('id-1'),
            [DataKeyAbbr.item]: 'My fund 1',
            [DataKeyAbbr.transactions]: [{ date: '2019-06-30', units: 100, cost: 9923 }],
            [DataKeyAbbr.allocationTarget]: 0,
            pr: [45, 45.6, 44.9],
            prStartIndex: 1,
          },
          {
            [DataKeyAbbr.id]: numericHash('id-2'),
            [DataKeyAbbr.item]: 'My fund 2',
            [DataKeyAbbr.transactions]: [],
            [DataKeyAbbr.allocationTarget]: 0.3,
            pr: [101.2, 100.94, 101.4, 102.03],
            prStartIndex: 0,
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
            transactions: getTransactionsList([{ date: '2019-06-30', units: 100, cost: 9923 }]),
            allocationTarget: 0,
          },
          { id: numericHash('id-2'), item: 'My fund 2', transactions: [], allocationTarget: 0.3 },
        ],
        __optimistic: [undefined, undefined],
        cache: {
          [initialState.period]: {
            startTime: 1000,
            cacheTimes: [1, 2, 100, 183],
            prices: {
              [numericHash('id-1')]: { startIndex: 1, values: [45, 45.6, 44.9] },
              [numericHash('id-2')]: { startIndex: 0, values: [101.2, 100.94, 101.4, 102.03] },
            },
          },
        },
      });
    });
  });

  describe(ActionTypeFunds.Received, () => {
    const res = {
      data: {
        startTime: 1430,
        cacheTimes: [2, 100, 183],
        data: [
          {
            [DataKeyAbbr.id]: numericHash('id-1'),
            [DataKeyAbbr.item]: 'My fund 1',
            [DataKeyAbbr.transactions]: [{ date: '2019-06-30', units: 100, cost: 9923 }],
            [DataKeyAbbr.allocationTarget]: 0.12,
            pr: [45.6, 44.9],
            prStartIndex: 1,
          },
          {
            [DataKeyAbbr.id]: numericHash('id-2'),
            [DataKeyAbbr.item]: 'My fund 2',
            [DataKeyAbbr.transactions]: [],
            [DataKeyAbbr.allocationTarget]: 0.5,
            pr: [100.94, 101.4, 102.03],
            prStartIndex: 0,
          },
        ],
      },
    } as AxiosResponse<ReadResponseFunds>;

    const action = fundsReceived(Period.month3, res);

    it('should not touch the current items list', () => {
      expect.assertions(2);
      expect(initialState.period).not.toBe(Period.month3);
      const result = reducer(initialState, action);
      expect(result.items).toBe(initialState.items);
    });

    it('should not touch the cache for the current period', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result.cache[initialState.period]).toBe(initialState.cache[initialState.period]);
    });

    it('should cache the new values', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result.cache[Period.month3]).toStrictEqual<State['cache'][Period]>({
        startTime: 1430,
        cacheTimes: [2, 100, 183],
        prices: {
          [numericHash('id-1')]: { startIndex: 1, values: [45.6, 44.9] },
          [numericHash('id-2')]: { startIndex: 0, values: [100.94, 101.4, 102.03] },
        },
      });
    });

    describe('if no data are passed', () => {
      const actionNoData = fundsReceived(Period.month3);

      it('should just set the period', () => {
        expect.assertions(3);
        const result = reducer(initialState, actionNoData);

        expect(result.items).toBe(initialState.items);
        expect(result.cache).toBe(initialState.cache);

        expect(result.period).toBe(Period.month3);
      });
    });
  });

  describe(ListActionType.Created, () => {
    const stateBefore: State = {
      ...initialState,
      items: [
        {
          id: numericHash('id-1'),
          item: 'Fund 1',
          transactions: [],
          allocationTarget: 0.6,
        },
      ],
      __optimistic: [undefined, undefined, undefined],
    };

    const action = listItemCreated<Fund, Page.funds>(Page.funds)({
      item: 'Fund 2',
      transactions: [],
      allocationTarget: 0.9, // this should be ignored
    });

    const setup = (): State => reducer(stateBefore, action);

    it('should fill the remaining allocation target', () => {
      expect.assertions(1);
      const result = setup();

      const fund2 = result.items.find(({ item }) => item === 'Fund 2');

      expect(fund2?.allocationTarget).toBe(0.4); // 1 - 0.6
    });

    it('should not change the existing allocation targets', () => {
      expect.assertions(1);
      const result = setup();

      const fund1 = result.items.find(({ item }) => item === 'Fund 1');

      expect(fund1?.allocationTarget).toBe(0.6);
    });
  });

  describe(ListActionType.Updated, () => {
    const stateBefore: State = {
      ...initialState,
      items: [
        {
          id: numericHash('id-1'),
          item: 'Fund 1',
          transactions: [],
          allocationTarget: 0,
        },
        {
          id: numericHash('id-2'),
          item: 'Fund 2',
          transactions: [],
          allocationTarget: 0.4,
        },
        {
          id: numericHash('id-3'),
          item: 'Fund 3',
          transactions: [],
          allocationTarget: 0.25,
        },
      ],
      __optimistic: [undefined, undefined, undefined],
    };

    const action = (nextAllocationTarget: number): ListItemUpdated<Fund, Page.funds> =>
      listItemUpdated<Fund, Page.funds>(Page.funds)(
        numericHash('id-1'),
        {
          allocationTarget: nextAllocationTarget,
        },
        stateBefore.items[0],
      );

    it("should update the given fund's allocation target", () => {
      expect.assertions(1);
      const result = reducer(stateBefore, action(0.15));

      const fund1 = result.items.find(({ item }) => item === 'Fund 1');

      expect(fund1?.allocationTarget).toBe(0.15);
    });

    it('should not allow an increase above the remaining allocation', () => {
      expect.assertions(3);
      const result = reducer(stateBefore, action(0.4));

      const fund1 = result.items.find(({ item }) => item === 'Fund 1');
      const fund2 = result.items.find(({ item }) => item === 'Fund 2');
      const fund3 = result.items.find(({ item }) => item === 'Fund 3');

      expect(fund1?.allocationTarget).toBe(0.35); // 1 - (0.4 + 0.25)
      expect(fund2?.allocationTarget).toBe(0.4);
      expect(fund3?.allocationTarget).toBe(0.25);
    });

    it('should allow a decrease to the existing allocation', () => {
      expect.assertions(3);
      const result = reducer(reducer(stateBefore, action(0.25)), action(0.1));

      const fund1 = result.items.find(({ item }) => item === 'Fund 1');
      const fund2 = result.items.find(({ item }) => item === 'Fund 2');
      const fund3 = result.items.find(({ item }) => item === 'Fund 3');

      expect(fund1?.allocationTarget).toBe(0.1);
      expect(fund2?.allocationTarget).toBe(0.4);
      expect(fund3?.allocationTarget).toBe(0.25);
    });
  });

  describe(ListActionType.Deleted, () => {
    const stateBefore: State = {
      ...initialState,
      items: [
        {
          id: numericHash('id-1'),
          item: 'Fund 1',
          transactions: [],
          allocationTarget: 0.3,
        },
        {
          id: numericHash('id-2'),
          item: 'Fund 2',
          transactions: [],
          allocationTarget: 0.5,
        },
        {
          id: numericHash('id-3'),
          item: 'Fund 3',
          transactions: [],
          allocationTarget: 0.2,
        },
      ],
      __optimistic: [undefined, undefined, undefined],
    };

    const action = listItemDeleted<Fund, Page.funds>(Page.funds)(
      numericHash('id-1'),
      stateBefore.items[0],
    );

    const setup = (): State => reducer(stateBefore, action);

    it('should keep the previous allocations for existing funds', () => {
      expect.assertions(2);
      const result = setup();

      const fund2 = result.items.find(({ item }) => item === 'Fund 2');
      const fund3 = result.items.find(({ item }) => item === 'Fund 3');

      const fund2AllocationTarget = 0.5;
      const fund3AllocationTarget = 0.2;

      expect(fund2?.allocationTarget).toBe(fund2AllocationTarget);
      expect(fund3?.allocationTarget).toBe(fund3AllocationTarget);
    });
  });

  describe(ActionTypeFunds.CashTargetUpdated, () => {
    const action = cashTargetUpdated(4500000);

    it('should (optimistically) update the cash target in state', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result.cashTarget).toBe(4500000);
    });
  });
});
