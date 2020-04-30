import reducer, { initialState } from '~client/reducers/funds';
import { dataRead } from '~client/actions/api';
import { fundsViewSoldToggled, fundsReceived } from '~client/actions/funds';
import { getTransactionsList } from '~client/modules/data';
import { DATA_KEY_ABBR } from '~client/constants/data';
import { Period } from '~client/constants/graph';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('Funds reducer', () => {
  describe('FUNDS_VIEW_SOLD_TOGGLED', () => {
    const action = fundsViewSoldToggled();

    it('should toggle the view sold status', () => {
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
    const res = {
      funds: {
        startTime: 1000,
        cacheTimes: [1, 2, 100, 183],
        data: [
          {
            [DATA_KEY_ABBR.id]: 'id-1',
            [DATA_KEY_ABBR.item]: 'My fund 1',
            [DATA_KEY_ABBR.transactions]: [{ date: '2019-06-30', units: 100, cost: 9923 }],
            pr: [45, 45.6, 44.9],
            prStartIndex: 1,
          },
          {
            [DATA_KEY_ABBR.id]: 'id-2',
            [DATA_KEY_ABBR.item]: 'My fund 2',
            [DATA_KEY_ABBR.transactions]: [],
            pr: [101.2, 100.94, 101.4, 102.03],
            prStartIndex: 0,
          },
        ],
      },
    };

    const action = dataRead(res);

    it('should set funds-related properties', () => {
      const result = reducer(initialState, action);

      expect(result).toEqual({
        ...initialState,
        items: [
          {
            id: 'id-1',
            item: 'My fund 1',
            transactions: getTransactionsList([{ date: '2019-06-30', units: 100, cost: 9923 }]),
          },
          { id: 'id-2', item: 'My fund 2', transactions: [] },
        ],
        cache: {
          [initialState.period]: {
            startTime: 1000,
            cacheTimes: [1, 2, 100, 183],
            prices: {
              'id-1': { startIndex: 1, values: [45, 45.6, 44.9] },
              'id-2': { startIndex: 0, values: [101.2, 100.94, 101.4, 102.03] },
            },
          },
        },
      });
    });
  });

  describe('FUNDS_RECEIVED', () => {
    const res = {
      data: {
        startTime: 1430,
        cacheTimes: [2, 100, 183],
        data: [
          {
            [DATA_KEY_ABBR.id]: 'id-1',
            [DATA_KEY_ABBR.item]: 'My fund 1',
            [DATA_KEY_ABBR.transactions]: [{ date: '2019-06-30', units: 100, cost: 9923 }],
            pr: [45.6, 44.9],
            prStartIndex: 1,
          },
          {
            [DATA_KEY_ABBR.id]: 'id-2',
            [DATA_KEY_ABBR.item]: 'My fund 2',
            [DATA_KEY_ABBR.transactions]: [],
            pr: [100.94, 101.4, 102.03],
            prStartIndex: 0,
          },
        ],
      },
    };

    const action = fundsReceived(Period.month3, res);

    it('should not touch the current items list', () => {
      expect(initialState.period).not.toBe(Period.month3);
      const result = reducer(initialState, action);
      expect(result.items).toBe(initialState.items);
    });

    it('should not touch the cache for the current period', () => {
      const result = reducer(initialState, action);
      expect(result.cache[initialState.period]).toBe(initialState.cache[initialState.period]);
    });

    it('should cache the new values', () => {
      const result = reducer(initialState, action);
      expect(result.cache[Period.month3]).toEqual({
        startTime: 1430,
        cacheTimes: [2, 100, 183],
        prices: {
          'id-1': { startIndex: 1, values: [45.6, 44.9] },
          'id-2': { startIndex: 0, values: [100.94, 101.4, 102.03] },
        },
      });
    });

    describe('if no data are passed', () => {
      const actionNoData = fundsReceived(Period.month3);

      it('should just set the period', () => {
        const result = reducer(initialState, actionNoData);

        expect(result.items).toBe(initialState.items);
        expect(result.cache).toBe(initialState.cache);

        expect(result.period).toBe(Period.month3);
      });
    });
  });
});