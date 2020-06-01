import {
  dataRead,
  loggedOut,
  listItemCreated,
  listItemUpdated,
  listItemDeleted,
} from '~client/actions';
import reducer, { initialState, State } from '~client/reducers/overview';
import { testResponse } from '~client/test-data';
import { Page, Food, General, Holiday } from '~client/types';

describe('Overview reducer', () => {
  describe.each`
    description     | action
    ${'LOGGED_OUT'} | ${loggedOut()}
  `('$description', ({ action }) => {
    it('should return the initial state', () => {
      expect.assertions(1);
      expect(reducer(undefined, action)).toStrictEqual(initialState);
    });
  });

  describe('DATA_READ', () => {
    const action = dataRead({
      ...testResponse,
      [Page.overview]: {
        startYearMonth: [2019, 4],
        endYearMonth: [2019, 7],
        currentYear: 2019,
        currentMonth: 7,
        futureMonths: 12,
        cost: {
          funds: [0, 0, 510000, 2160465],
          fundChanges: [1, 1, 0, 1],
          income: [0, 30040, 229838, 196429],
          bills: [99778, 101073, 118057, 212450],
          food: [11907, 24108, 28123, 38352],
          general: [12192, 9515, 28335, 160600],
          holiday: [46352, 0, 47398, 55597],
          social: [13275, 12593, 12400, 8115],
          balance: [1672664, 7532442, 8120445, 0],
          old: [488973, 434353, 1234689],
        },
      },
    });

    it('should set the start date to the end of the month', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result).toHaveProperty('startDate', new Date('2019-04-30T23:59:59.999Z'));
    });

    it('should set the end date to the end of the month', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result).toHaveProperty('endDate', new Date('2019-07-31T23:59:59.999Z'));
    });

    it('should set the cost data', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.cost).toStrictEqual(
        expect.objectContaining({
          [Page.funds]: [0, 0, 510000, 2160465],
          fundChanges: [1, 1, 0, 1],
          [Page.income]: [0, 30040, 229838, 196429],
          [Page.bills]: [99778, 101073, 118057, 212450],
          [Page.food]: [11907, 24108, 28123, 38352],
          [Page.general]: [12192, 9515, 28335, 160600],
          [Page.holiday]: [46352, 0, 47398, 55597],
          [Page.social]: [13275, 12593, 12400, 8115],
          old: [488973, 434353, 1234689],
        }),
      );
    });
  });

  describe('ListAction.create', () => {
    const state: State = {
      ...initialState,
      startDate: new Date('2019-04-30T23:59:59.999Z'),
      endDate: new Date('2019-07-31T23:59:59.999Z'),
      cost: {
        ...initialState.cost,
        [Page.funds]: [0, 0, 510000, 2160465],
        fundChanges: [1, 1, 0, 1],
        income: [0, 30040, 229838, 196429],
        bills: [99778, 101073, 118057, 212450],
        food: [11907, 24108, 28123, 38352],
        general: [12192, 9515, 28335, 160600],
        holiday: [46352, 0, 47398, 55597],
        social: [13275, 12593, 12400, 8115],
        old: [488973, 434353, 1234689],
      },
    };

    it('should add to the relevant month and category', () => {
      expect.assertions(1);
      const withGeneral = reducer(
        state,
        listItemCreated<General, Page.general>(Page.general)({
          date: new Date('2019-06-02T00:00:00.000Z'),
          item: 'some item',
          category: 'some category',
          cost: 34,
          shop: 'some shop',
        }),
      );

      expect(withGeneral.cost?.general?.[2]).toBe(28335 + 34);
    });
  });

  describe('ListAction.update', () => {
    const state = {
      startDate: new Date('2019-04-30T23:59:59.999Z'),
      endDate: new Date('2019-07-31T23:59:59.999Z'),
      cost: {
        funds: [0, 0, 510000, 2160465],
        fundChanges: [1, 1, 0, 1],
        income: [0, 30040, 229838, 196429],
        bills: [99778, 101073, 118057, 212450],
        food: [11907, 24108, 28123, 38352],
        general: [12192, 9515, 28335, 160600],
        holiday: [46352, 0, 47398, 55597],
        social: [13275, 12593, 12400, 8115],
        old: [488973, 434353, 1234689],
      },
    };

    const multiUpdateDelta = { date: new Date('2019-06-02'), cost: 98 };

    it.each`
      prop       | delta                               | firstCost          | secondCost
      ${'date'}  | ${{ date: new Date('2019-06-02') }} | ${24108 - 34}      | ${28123 + 34}
      ${'item'}  | ${{ item: 'updated item' }}         | ${24108}           | ${28123}
      ${'cost'}  | ${{ cost: 98 }}                     | ${24108 + 98 - 34} | ${28123}
      ${'multi'} | ${multiUpdateDelta}                 | ${24108 - 34}      | ${28123 + 98}
    `('should handle $prop updates', ({ delta, firstCost, secondCost }) => {
      expect.assertions(2);

      const result = reducer(
        state,
        listItemUpdated<Food, Page.food>(Page.food)('some-id', delta, {
          date: new Date('2019-05-10'),
          item: 'some item',
          category: 'some category',
          cost: 34,
          shop: 'some shop',
        }),
      );

      expect(result.cost[Page.food][1]).toBe(firstCost);
      expect(result.cost[Page.food][2]).toBe(secondCost);
    });
  });

  describe('ListAction.delete', () => {
    const state: State = {
      startDate: new Date('2019-04-30T23:59:59.999Z'),
      endDate: new Date('2019-07-31T23:59:59.999Z'),
      cost: {
        funds: [0, 0, 510000, 2160465],
        fundChanges: [1, 1, 0, 1],
        income: [0, 30040, 229838, 196429],
        bills: [99778, 101073, 118057, 212450],
        food: [11907, 24108, 28123, 38352],
        general: [12192, 9515, 28335, 160600],
        holiday: [46352, 0, 47398, 55597],
        social: [13275, 12593, 12400, 8115],
        old: [488973, 434353, 1234689],
      },
    };

    it('should remove from the relevant month and category', () => {
      expect.assertions(1);
      const withHoliday = reducer(
        state,
        listItemDeleted<Holiday, Page.holiday>(Page.holiday)('some-id', {
          date: new Date('2019-07-12T00:00Z'),
          item: 'some item',
          holiday: 'some holiday',
          cost: 1235,
          shop: 'some shop',
        }),
      );

      expect(withHoliday.cost?.holiday?.[3]).toBe(55597 - 1235);
    });
  });
});
