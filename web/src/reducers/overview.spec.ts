import reducer, { initialState, State } from '~client/reducers/overview';

import { dataRead } from '~client/actions/api';
import { listItemCreated, listItemUpdated, listItemDeleted } from '~client/actions/list';
import { loggedOut } from '~client/actions/login';
import { Page } from '~client/types/app';
import { Food, Holiday } from '~client/types/list';

describe('Overview reducer', () => {
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

  describe('DATA_READ', () => {
    const action = dataRead({
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

  describe('LIST_ITEM_CREATED', () => {
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
        listItemCreated(Page.general, {
          date: new Date('2019-06-02T00:00:00.000Z'),
          cost: 34,
        }),
      );

      expect(withGeneral.cost?.general?.[2]).toBe(28335 + 34);
    });

    it('should be ignored if the item has insufficient data', () => {
      expect.assertions(2);
      const withMissingDate = reducer(
        state,
        listItemCreated(Page.general, {
          cost: 34,
        }),
      );

      expect(withMissingDate).toStrictEqual(state);

      const withMissingCost = reducer(
        state,
        listItemCreated(Page.general, {
          date: new Date('2019-06-02T00:00:00.000Z'),
        }),
      );

      expect(withMissingCost).toStrictEqual(state);
    });
  });

  describe('LIST_ITEM_UPDATED', () => {
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

    it('should handle an updated date', () => {
      expect.assertions(2);
      const withDate = reducer(
        state,
        listItemUpdated(
          Page.food,
          'some-id',
          {
            date: new Date('2019-06-02T00:00Z'),
            cost: 34,
          },
          {
            date: new Date('2019-05-10T00:00Z'),
            cost: 34,
          },
        ),
      );

      expect(withDate.cost?.food?.[1]).toBe(24108 - 34);
      expect(withDate.cost?.food?.[2]).toBe(28123 + 34);
    });

    it('should handle an updated cost', () => {
      expect.assertions(1);
      const withCost = reducer(
        state,
        listItemUpdated(
          Page.food,
          'some-id',
          {
            date: new Date('2019-06-02T00:00Z'),
            cost: 98,
          },
          {
            date: new Date('2019-06-02T00:00Z'),
            cost: 34,
          },
        ),
      );

      expect(withCost.cost?.food?.[2]).toBe(28123 + 98 - 34);
    });

    it('should handle a simultaneous update', () => {
      expect.assertions(2);
      const withBoth = reducer(
        state,
        listItemUpdated<Food>(
          Page.food,
          'some-id',
          {
            date: new Date('2019-06-02T00:00Z'),
            item: 'some item',
            category: 'some caetgory',
            cost: 98,
            shop: 'some shop',
          },
          {
            date: new Date('2019-04-24T00:00Z'),
            item: 'some item',
            category: 'some caetgory',
            cost: 34,
            shop: 'some shop',
          },
        ),
      );

      expect(withBoth.cost?.food?.[0]).toBe(11907 - 34);
      expect(withBoth.cost?.food?.[2]).toBe(28123 + 98);
    });
  });

  describe('LIST_ITEM_DELETED', () => {
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
        listItemDeleted<Holiday>(
          'some-id',
          { page: Page.holiday },
          {
            date: new Date('2019-07-12T00:00Z'),
            item: 'some item',
            holiday: 'some holiday',
            cost: 1235,
            shop: 'some shop',
          },
        ),
      );

      expect(withHoliday.cost?.holiday?.[3]).toBe(55597 - 1235);
    });
  });
});
