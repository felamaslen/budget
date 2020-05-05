import sinon from 'sinon';

import reducer, { initialState, State } from '~client/reducers/stocks';
import {
  stocksListRequested,
  stocksListReceived,
  stockPricesReceived,
} from '~client/actions/stocks';
import { loggedOut } from '~client/actions/login';

describe('Stocks reducer', () => {
  describe.each`
    description      | action
    ${'Null action'} | ${null}
    ${'LOGGED_OUT'}  | ${loggedOut()}
  `('$description', ({ action }) => {
    it('should return the initial state', () => {
      expect.assertions(1);
      expect(reducer(undefined, action)).toStrictEqual(initialState);
    });
  });

  describe('STOCKS_LIST_REQUESTED', () => {
    it('STOCKS_LIST_REQUESTED sets stocks list to loading', () => {
      expect.assertions(1);
      const state: State = {
        ...initialState,
        loading: false,
      };

      const action = stocksListRequested();
      const result = reducer(state, action);

      expect(result.loading).toBe(true);
    });
  });

  describe('STOCKS_LIST_RECEIVED', () => {
    it('should set stocks list', () => {
      expect.assertions(3);
      const state = {
        ...initialState,
        loading: true,
      };

      const action = stocksListReceived({
        data: {
          stocks: [
            ['LLOY.L', 'Lloyds Banking Group plc Ordinary 10p', 3],
            ['SMT.L', 'Scottish Mortgage IT Ordinary Shares 5p', 5],
          ],
          total: 11,
        },
      });

      const result = reducer(state, action);

      expect(result.shares).toStrictEqual([
        {
          code: 'LLOY.L',
          name: 'Lloyds Banking Group plc Ordinary 10p',
          weight: 3 / 11,
          gain: 0,
          price: null,
          up: false,
          down: false,
        },
        {
          code: 'SMT.L',
          name: 'Scottish Mortgage IT Ordinary Shares 5p',
          weight: 5 / 11,
          gain: 0,
          price: null,
          up: false,
          down: false,
        },
      ]);

      expect(result.loading).toBe(false);
      expect(result.lastPriceUpdate).toBeNull();
    });

    it('should add duplicate stocks together', () => {
      expect.assertions(3);
      const state = {
        ...initialState,
        loading: true,
      };

      const action = stocksListReceived({
        data: {
          stocks: [
            ['HKG:0700', 'TENCENT HLDGS', 3],
            ['HKG:0700', 'Tencent Holdings', 5],
          ],
          total: 11,
        },
      });

      const result = reducer(state, action);

      expect(result.shares).toStrictEqual([
        {
          code: 'HKG:0700',
          name: 'TENCENT HLDGS',
          weight: 8 / 11,
          gain: 0,
          price: null,
          up: false,
          down: false,
        },
      ]);

      expect(result.loading).toBe(false);
      expect(result.lastPriceUpdate).toBeNull();
    });
  });

  describe('STOCKS_PRICES_RECEIVED', () => {
    it('should set stock prices', () => {
      expect.assertions(6);
      const now = new Date('2019-07-02T19:13:32+01:00');

      const clock = sinon.useFakeTimers(now.getTime());

      const state = {
        ...initialState,
        indices: [],
        shares: [
          {
            code: 'LLOY.L',
            name: 'Lloyds Banking Group plc Ordinary 10p',
            weight: 3 / 11,
            gain: 0,
            price: null,
            up: false,
            down: false,
          },
          {
            code: 'SMT.L',
            name: 'Scottish Mortgage IT Ordinary Shares 5p',
            weight: 5 / 11,
            gain: 0,
            price: null,
            up: false,
            down: false,
          },
        ],
        history: [],
      };

      const action = stockPricesReceived([
        { code: 'LLOY.L', open: 100, close: 101.3 },
        { code: 'SMT.L', open: 321, close: 308 },
      ]);

      const result = reducer(state, action);

      expect(result.shares[0].gain).toBe(100 * ((101.3 - 100) / 100));
      expect(result.shares[0].price).toBe(101.3);

      expect(result.shares[1].gain).toBe(100 * ((308 - 321) / 321));
      expect(result.shares[1].price).toBe(308);

      expect(result.lastPriceUpdate).toBe(now.getTime());

      expect(result.history).toStrictEqual([
        [
          now.getTime(),
          (3 / 11) * ((101.3 - 100) / 100) * 100 + (5 / 11) * ((308 - 321) / 321) * 100,
        ],
      ]);

      clock.restore();
    });
  });
});
