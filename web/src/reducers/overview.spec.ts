import { AxiosResponse } from 'axios';
import numericHash from 'string-hash';

import {
  dataRead,
  loggedOut,
  listItemCreated,
  listItemUpdated,
  listItemDeleted,
  ActionTypeFunds,
  fundsReceived,
} from '~client/actions';
import { Period } from '~client/constants';
import reducer, { initialState, State } from '~client/reducers/overview';
import { testResponse } from '~client/test-data';
import { Page, Food, General, Holiday, ReadResponseFunds } from '~client/types';

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
        annualisedFundReturns: 0.087,
        homeEquityOld: [6375000, 7255000],
        cost: {
          [Page.funds]: [0, 0, 510000, 2160465],
          [Page.income]: [0, 30040, 229838, 196429],
          [Page.bills]: [99778, 101073, 118057, 212450],
          [Page.food]: [11907, 24108, 28123, 38352],
          [Page.general]: [12192, 9515, 28335, 160600],
          [Page.holiday]: [46352, 0, 47398, 55597],
          [Page.social]: [13275, 12593, 12400, 8115],
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

    it('should set the annualised fund returns', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result).toHaveProperty('annualisedFundReturns', 0.087);
    });

    it('should set the old home equity values', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result).toHaveProperty('homeEquityOld', [6375000, 7255000]);
    });

    it('should set the cost data', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.cost).toStrictEqual(
        expect.objectContaining({
          [Page.funds]: [0, 0, 510000, 2160465],
          [Page.income]: [0, 30040, 229838, 196429],
          [Page.bills]: [99778, 101073, 118057, 212450],
          [Page.food]: [11907, 24108, 28123, 38352],
          [Page.general]: [12192, 9515, 28335, 160600],
          [Page.holiday]: [46352, 0, 47398, 55597],
          [Page.social]: [13275, 12593, 12400, 8115],
        }),
      );
    });
  });

  describe('ListAction.create', () => {
    const state: State = {
      ...initialState,
      startDate: new Date('2019-04-30T23:59:59.999Z'),
      endDate: new Date('2019-07-31T23:59:59.999Z'),
      annualisedFundReturns: 0.1,
      cost: {
        ...initialState.cost,
        [Page.funds]: [0, 0, 510000, 2160465],
        [Page.income]: [0, 30040, 229838, 196429],
        [Page.bills]: [99778, 101073, 118057, 212450],
        [Page.food]: [11907, 24108, 28123, 38352],
        [Page.general]: [12192, 9515, 28335, 160600],
        [Page.holiday]: [46352, 0, 47398, 55597],
        [Page.social]: [13275, 12593, 12400, 8115],
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

    it('should omit expenses which are for a house purchase', () => {
      expect.assertions(1);

      const withGeneral = reducer(
        state,
        listItemCreated<General, Page.general>(Page.general)({
          date: new Date('2019-06-02T00:00:00.000Z'),
          item: 'Balancing payment',
          category: 'House purchase',
          cost: 5950000,
          shop: 'Some conveyancers',
        }),
      );

      expect(withGeneral.cost?.general?.[2]).toBe(28335);
    });
  });

  describe('ListAction.update', () => {
    const state: State = {
      startDate: new Date('2019-04-30T23:59:59.999Z'),
      endDate: new Date('2019-07-31T23:59:59.999Z'),
      annualisedFundReturns: 0.1,
      homeEquityOld: [],
      cost: {
        funds: [0, 0, 510000, 2160465],
        income: [0, 30040, 229838, 196429],
        bills: [99778, 101073, 118057, 212450],
        food: [11907, 24108, 28123, 38352],
        general: [12192, 9515, 28335, 160600],
        holiday: [46352, 0, 47398, 55597],
        social: [13275, 12593, 12400, 8115],
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
        listItemUpdated<Food, Page.food>(Page.food)(numericHash('some-id'), delta, {
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

    describe("when the old item was for a house purchase but the new one isn't", () => {
      it('should add the new cost', () => {
        expect.assertions(1);

        const result = reducer(
          state,
          listItemUpdated<General, Page.general>(Page.general)(
            numericHash('some-id'),
            { category: 'Something else', cost: 567 },
            {
              date: new Date('2019-05-10'),
              item: 'some item',
              category: 'House purchase',
              cost: 5955500,
              shop: 'some shop',
            },
          ),
        );

        expect(result.cost[Page.general][1]).toBe(9515 + 567);
      });
    });

    describe("when the new item is for a house purchase but the old one wasn't", () => {
      it('should remove the old cost', () => {
        expect.assertions(1);

        const result = reducer(
          state,
          listItemUpdated<General, Page.general>(Page.general)(
            numericHash('some-id'),
            { category: 'House purchase', cost: 5955500 },
            {
              date: new Date('2019-05-10'),
              item: 'some item',
              category: 'some category',
              cost: 34,
              shop: 'some shop',
            },
          ),
        );

        expect(result.cost[Page.general][1]).toBe(9515 - 34);
      });
    });
  });

  describe('ListAction.delete', () => {
    const state: State = {
      startDate: new Date('2019-04-30T23:59:59.999Z'),
      endDate: new Date('2019-07-31T23:59:59.999Z'),
      annualisedFundReturns: 0.1,
      homeEquityOld: [],
      cost: {
        [Page.funds]: [0, 0, 510000, 2160465],
        [Page.income]: [0, 30040, 229838, 196429],
        [Page.bills]: [99778, 101073, 118057, 212450],
        [Page.food]: [11907, 24108, 28123, 38352],
        [Page.general]: [12192, 9515, 28335, 160600],
        [Page.holiday]: [46352, 0, 47398, 55597],
        [Page.social]: [13275, 12593, 12400, 8115],
      },
    };

    it('should remove from the relevant month and category', () => {
      expect.assertions(1);
      const withHoliday = reducer(
        state,
        listItemDeleted<Holiday, Page.holiday>(Page.holiday)(numericHash('some-id'), {
          date: new Date('2019-07-12T00:00Z'),
          item: 'some item',
          category: 'some holiday',
          cost: 1235,
          shop: 'some shop',
        }),
      );

      expect(withHoliday.cost?.holiday?.[3]).toBe(55597 - 1235);
    });

    it('should omit expenses which are for a house purchase', () => {
      expect.assertions(1);

      const withGeneral = reducer(
        state,
        listItemDeleted<General, Page.general>(Page.general)(numericHash('some-id'), {
          date: new Date('2019-07-12T00:00Z'),
          item: 'some item',
          category: 'House purchase',
          cost: 5920000,
          shop: 'some shop',
        }),
      );

      expect(withGeneral.cost?.general?.[3]).toBe(160600);
    });
  });

  describe(ActionTypeFunds.Received, () => {
    const res = {
      data: {
        annualisedFundReturns: 0.674,
      },
    } as AxiosResponse<ReadResponseFunds>;

    const action = fundsReceived(Period.month3, res);

    it('should set the annualised fund returns value', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result.annualisedFundReturns).toBe(0.674);
    });
  });
});
