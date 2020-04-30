import { DateTime } from 'luxon';
import { compose } from '@typed/compose';
import { replaceAtIndex } from 'replace-array';

import {
  getAllPageRows,
  getSortedPageRows,
  getWeeklyAverages,
  getTotalCost,
  getCrudRequests,
} from '~client/selectors/list';
import state from '~client/test-data/state';
import { getTransactionsList } from '~client/modules/data';
import { Page } from '~client/types/app';
import { PAGES } from '~client/constants/data';
import { RequestType } from '~client/types/crud';
import { State } from '~client/reducers';

describe('List selectors', () => {
  const now = new Date('2018-04-13T12:45:23Z');

  const stateWithUnorderedRows: State = {
    ...state,
    now: DateTime.fromJSDate(now),
    [Page.general]: {
      ...state[Page.general],
      items: [
        {
          id: 'id300',
          date: DateTime.fromISO('2018-02-03'),
          item: 'foo1',
          category: 'bar1',
          cost: 1139,
          shop: 'bak2',
        },
        {
          id: 'id29',
          date: DateTime.fromISO('2018-02-02'),
          item: 'foo3',
          category: 'bar3',
          cost: 498,
          shop: 'bak3',
        },
        {
          id: 'id81',
          date: DateTime.fromISO('2018-02-03'),
          item: 'foo2',
          category: 'bar2',
          cost: 876,
          shop: 'bak2',
        },
        {
          id: 'id956__SHOULD_NOT_SEE_THIS!',
          date: DateTime.fromISO('2018-03-09'),
          item: 'foo4',
          category: 'bar4',
          cost: 198,
          shop: 'bak4',
          __optimistic: RequestType.delete,
        },
        {
          id: 'id19',
          date: DateTime.fromISO('2018-04-17'),
          item: 'foo3',
          category: 'bar3',
          cost: 29,
          shop: 'bak3',
        },
      ],
    },
  };

  const testItems = [
    { id: 'id2', date: DateTime.fromISO('2019-06-16'), cost: 2 },
    { id: 'id3', date: DateTime.fromISO('2019-06-16'), cost: 3 },
    { id: 'id5', date: DateTime.fromISO('2019-06-16'), cost: 5 },
    { id: 'id7', date: DateTime.fromISO('2019-06-15'), cost: 7 },
    { id: 'id11', date: DateTime.fromISO('2019-06-16'), cost: 11 },
    { id: 'id13', date: DateTime.fromISO('2019-06-16'), cost: 13 },
    { id: 'id17', date: DateTime.fromISO('2019-06-15'), cost: 17 },
    { id: 'id19', date: DateTime.fromISO('2019-06-14'), cost: 19 },
    { id: 'id29', date: DateTime.fromISO('2019-06-13'), cost: 29 },
    { id: 'id23', date: DateTime.fromISO('2019-06-14'), cost: 23 },
    { id: 'id31', date: DateTime.fromISO('2019-07-25'), cost: 31 },
    { id: 'id37', date: DateTime.fromISO('2019-08-21'), cost: 37 },
  ];

  const stateWithManyRows: State = {
    ...state,
    now: DateTime.fromISO('2019-07-13T15:23:39Z'),
    [Page.general]: {
      ...state[Page.general],
      items: testItems.map(item => ({
        ...item,
        item: 'some-general-item',
        category: 'some-general-category',
        shop: 'some-general-shop',
      })),
    },
    [Page.income]: {
      ...state[Page.income],
      items: testItems.map(item => ({
        ...item,
        item: 'some-income-item',
      })),
    },
  };

  describe('getAllPageRows', () => {
    it('should get all rows except optimistically deleted ones', () => {
      const result = getAllPageRows(stateWithUnorderedRows, { page: Page.general });

      expect(result).toEqual([
        expect.objectContaining({
          id: 'id300',
        }),
        expect.objectContaining({
          id: 'id29',
        }),
        expect.objectContaining({
          id: 'id81',
        }),
        expect.objectContaining({
          id: 'id19',
        }),
      ]);
    });
  });

  describe('getSortedPageRows', () => {
    it('should sort list rows by date, newest first', () => {
      expect(PAGES[Page.general].daily).toBe(true);
      const result = getSortedPageRows(stateWithManyRows, { page: Page.general });

      expect(result).toEqual([
        expect.objectContaining({
          id: 'id37',
          date: DateTime.fromISO('2019-08-21'),
          cost: 37,
          future: true,
          firstPresent: false,
          daily: 37,
        }),
        expect.objectContaining({
          id: 'id31',
          date: DateTime.fromISO('2019-07-25'),
          cost: 31,
          future: true,
          firstPresent: false,
          daily: 31,
        }),
        expect.objectContaining({
          id: 'id5',
          date: DateTime.fromISO('2019-06-16'),
          cost: 5,
          future: false,
          firstPresent: true,
          daily: undefined,
        }),
        expect.objectContaining({
          id: 'id2',
          date: DateTime.fromISO('2019-06-16'),
          cost: 2,
          future: false,
          firstPresent: false,
          daily: undefined,
        }),
        expect.objectContaining({
          id: 'id11',
          date: DateTime.fromISO('2019-06-16'),
          cost: 11,
          future: false,
          firstPresent: false,
          daily: undefined,
        }),
        expect.objectContaining({
          id: 'id13',
          date: DateTime.fromISO('2019-06-16'),
          cost: 13,
          future: false,
          firstPresent: false,
          daily: undefined,
        }),
        expect.objectContaining({
          id: 'id3',
          date: DateTime.fromISO('2019-06-16'),
          cost: 3,
          future: false,
          firstPresent: false,
          daily: 34,
        }),
        expect.objectContaining({
          id: 'id7',
          date: DateTime.fromISO('2019-06-15'),
          cost: 7,
          future: false,
          firstPresent: false,
          daily: undefined,
        }),
        expect.objectContaining({
          id: 'id17',
          date: DateTime.fromISO('2019-06-15'),
          cost: 17,
          future: false,
          firstPresent: false,
          daily: 24,
        }),
        expect.objectContaining({
          id: 'id19',
          date: DateTime.fromISO('2019-06-14'),
          cost: 19,
          future: false,
          firstPresent: false,
          daily: undefined,
        }),
        expect.objectContaining({
          id: 'id23',
          date: DateTime.fromISO('2019-06-14'),
          cost: 23,
          future: false,
          firstPresent: false,
          daily: 42,
        }),
        expect.objectContaining({
          id: 'id29',
          date: DateTime.fromISO('2019-06-13'),
          cost: 29,
          future: false,
          firstPresent: false,
          daily: 29,
        }),
      ]);
    });

    it('should add future and firstPresent props', () => {
      const result = getSortedPageRows(stateWithManyRows, { page: Page.general });

      expect(result).toEqual([
        expect.objectContaining({
          future: true,
          firstPresent: false,
        }),
        expect.objectContaining({
          future: true,
          firstPresent: false,
        }),
        expect.objectContaining({
          future: false,
          firstPresent: true,
        }),
        expect.objectContaining({
          future: false,
          firstPresent: false,
        }),
        expect.objectContaining({
          future: false,
          firstPresent: false,
        }),
        expect.objectContaining({
          future: false,
          firstPresent: false,
        }),
        expect.objectContaining({
          future: false,
          firstPresent: false,
        }),
        expect.objectContaining({
          future: false,
          firstPresent: false,
        }),
        expect.objectContaining({
          future: false,
          firstPresent: false,
        }),
        expect.objectContaining({
          future: false,
          firstPresent: false,
        }),
        expect.objectContaining({
          future: false,
          firstPresent: false,
        }),
        expect.objectContaining({
          future: false,
          firstPresent: false,
        }),
      ]);
    });

    it('should add daily totals', () => {
      const result = getSortedPageRows(stateWithManyRows, { page: Page.general });

      expect(result).toEqual([
        expect.objectContaining({
          daily: 37,
        }),
        expect.objectContaining({
          daily: 31,
        }),
        expect.objectContaining({
          daily: undefined,
        }),
        expect.objectContaining({
          daily: undefined,
        }),
        expect.objectContaining({
          daily: undefined,
        }),
        expect.objectContaining({
          daily: undefined,
        }),
        expect.objectContaining({
          daily: 34,
        }),
        expect.objectContaining({
          daily: undefined,
        }),
        expect.objectContaining({
          daily: 24,
        }),
        expect.objectContaining({
          daily: undefined,
        }),
        expect.objectContaining({
          daily: 42,
        }),
        expect.objectContaining({
          daily: 29,
        }),
      ]);
    });

    it('should return shallowly equal rows where possible', () => {
      const result0 = getSortedPageRows(state, { page: Page.food });

      expect(result0).toHaveLength(4);

      const modifiedState: State = {
        ...state,
        now: DateTime.fromISO('2018-04-18'),
        [Page.food]: {
          ...state[Page.food],
          items: compose(
            (array: State[Page.food]['items']): State[Page.food]['items'] =>
              replaceAtIndex(array, 3, value => ({
                ...value,
                __optimistic: RequestType.update,
              })),
            (array: State[Page.food]['items']): State[Page.food]['items'] =>
              replaceAtIndex(array, 2, value => ({ ...value, item: 'foo3_updated' })),
          )(state[Page.food].items),
        },
      };

      const result1 = getSortedPageRows(modifiedState, { page: Page.food });

      expect(result0[0].future).toBe(true);
      expect(result1[0].future).toBe(false);
      expect(result0[0].firstPresent).toBe(false);
      expect(result1[0].firstPresent).toBe(true);

      expect(result0[1].firstPresent).toBe(true);
      expect(result1[1].firstPresent).toBe(false);

      expect(result1[2]).toBe(result0[2]);

      expect(result1[3]).not.toBe(result0[3]);
      expect(result1[3]).toHaveProperty('item', 'foo3_updated');
    });

    it('should memoise the result set across different pages', () => {
      const resultFood0 = getSortedPageRows(state, { page: Page.food });
      const resultGeneral0 = getSortedPageRows(state, { page: Page.general });
      const resultFood1 = getSortedPageRows(state, { page: Page.food });
      const resultGeneral1 = getSortedPageRows(state, { page: Page.general });

      expect(resultFood0).toBe(resultFood1);
      expect(resultGeneral0).toBe(resultGeneral1);
    });

    it("shouldn't recalculate until the next day", () => {
      const getState = (date: string): State => ({
        ...stateWithUnorderedRows,
        now: DateTime.fromISO(date),
      });

      const resultA = getSortedPageRows(getState('2019-07-13T16:45:23Z'), { page: Page.general });
      const resultB = getSortedPageRows(getState('2019-07-13T18:23:19Z'), { page: Page.general });
      const resultC = getSortedPageRows(getState('2019-07-13T23:59:46Z'), { page: Page.general });
      const resultD = getSortedPageRows(getState('2019-07-13T23:59:59.999Z'), {
        page: Page.general,
      });
      const resultE = getSortedPageRows(getState('2019-07-14T00:00:00.000'), {
        page: Page.general,
      });
      const resultF = getSortedPageRows(getState('2019-07-14T00:00:00.001'), {
        page: Page.general,
      });
      const resultG = getSortedPageRows(getState('2019-07-14T11:32:27Z'), { page: Page.general });

      expect(resultA).toBe(resultB);
      expect(resultB).toBe(resultC);
      expect(resultC).toBe(resultD);

      expect(resultD).not.toBe(resultE);

      expect(resultE).toBe(resultF);
      expect(resultF).toBe(resultG);
    });

    describe('for non-daily pages', () => {
      it('should get future / firstPresent information', () => {
        expect(PAGES[Page.income].daily).toBeFalsy();
        const result = getSortedPageRows(stateWithManyRows, { page: Page.income });

        expect(result).toEqual([
          expect.objectContaining({
            future: true,
            firstPresent: false,
          }),
          expect.objectContaining({
            future: true,
            firstPresent: false,
          }),
          expect.objectContaining({
            future: false,
            firstPresent: true,
          }),
          expect.objectContaining({
            future: false,
            firstPresent: false,
          }),
          expect.objectContaining({
            future: false,
            firstPresent: false,
          }),
          expect.objectContaining({
            future: false,
            firstPresent: false,
          }),
          expect.objectContaining({
            future: false,
            firstPresent: false,
          }),
          expect.objectContaining({
            future: false,
            firstPresent: false,
          }),
          expect.objectContaining({
            future: false,
            firstPresent: false,
          }),
          expect.objectContaining({
            future: false,
            firstPresent: false,
          }),
          expect.objectContaining({
            future: false,
            firstPresent: false,
          }),
          expect.objectContaining({
            future: false,
            firstPresent: false,
          }),
        ]);
      });

      it('should not get daily totals', () => {
        const result = getSortedPageRows(stateWithManyRows, { page: Page.income });

        expect(result.every(item => typeof item.daily === 'undefined')).toBe(true);
      });

      it('should memoize the result', () => {
        const result0 = getSortedPageRows(stateWithManyRows, { page: Page.income });
        const result1 = getSortedPageRows(stateWithManyRows, { page: Page.income });

        expect(result0).toBe(result1);
      });
    });
  });

  describe('getWeeklyAverages', () => {
    it('should return the data with a processed weekly value', () => {
      expect(getWeeklyAverages(state, { page: Page.food })).toBeCloseTo(
        Math.round((29 + 1139 + 876 + 498) / (10 + 4 / 7)),
      );
    });
  });

  describe('getTotalCost', () => {
    it('should return the total cost of a list page', () => {
      expect(getTotalCost(state, { page: Page.food })).toBe(8755601);
    });

    describe('on the funds page', () => {
      it('should return the fund cost value', () => {
        expect(getTotalCost(state, { page: Page.funds })).toBe(400000);
      });
    });
  });

  describe('getCrudRequests', () => {
    it('should map optimistically updated items to an HTTP request list', () => {
      const stateWithUpdates: State = {
        ...state,
        [Page.income]: { ...state[Page.income], items: [] },
        [Page.funds]: {
          ...state[Page.funds],
          items: [
            {
              id: 'some-fund-id',
              item: 'some-fund-name',
              transactions: getTransactionsList([{ date: '2019-05-03', units: 103, cost: 99231 }]),
              __optimistic: RequestType.update,
            },
          ],
        },
        [Page.bills]: { ...state[Page.bills], items: [] },
        [Page.food]: {
          ...state[Page.food],
          items: [
            {
              id: 'real-id-z',
              date: DateTime.fromISO('2020-04-29'),
              item: 'some-food-item',
              category: 'some-food-category',
              cost: 27,
              shop: 'some-food-shop',
              __optimistic: RequestType.update,
            },
          ],
        },
        [Page.general]: {
          ...state[Page.general],
          items: [
            {
              id: 'some-fake-id',
              date: DateTime.fromISO('2020-04-29'),
              item: 'some-general-item',
              category: 'some-general-category',
              cost: 913,
              shop: 'some-general-shop',
              __optimistic: RequestType.create,
            },
          ],
        },
        [Page.holiday]: {
          ...state[Page.holiday],
          items: [
            {
              id: 'real-id-x',
              date: DateTime.fromISO('2020-04-29'),
              item: 'some-holiday-item',
              holiday: 'some-holiday-holiday',
              cost: 103,
              shop: 'some-holiday-shop',
              __optimistic: RequestType.delete,
            },
          ],
        },
        [Page.social]: { ...state[Page.social], items: [] },
      };

      expect(getCrudRequests(stateWithUpdates)).toEqual([
        {
          type: RequestType.update,
          id: 'some-fund-id',
          method: 'put',
          route: 'funds',
          query: {},
          body: {
            id: 'some-fund-id',
            item: 'some-fund-name',
            transactions: [{ date: '2019-05-03', units: 103, cost: 99231 }],
          },
        },
        {
          type: RequestType.update,
          id: 'real-id-z',
          method: 'put',
          route: 'food',
          query: {},
          body: {
            id: 'real-id-z',
            date: '2020-04-29',
            item: 'some-food-item',
            category: 'some-food-category',
            cost: 27,
            shop: 'some-food-shop',
          },
        },
        {
          type: RequestType.create,
          fakeId: 'some-fake-id',
          method: 'post',
          route: 'general',
          query: {},
          body: {
            date: '2020-04-29',
            item: 'some-general-item',
            category: 'some-general-category',
            cost: 913,
            shop: 'some-general-shop',
          },
        },
        {
          type: RequestType.delete,
          id: 'real-id-x',
          method: 'delete',
          route: 'holiday',
          query: {},
          body: {
            id: 'real-id-x',
          },
        },
      ]);
    });
  });
});
