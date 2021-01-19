import sinon from 'sinon';
import numericHash from 'string-hash';

import {
  ActionTypeFunds,
  ActionTypeLogin,
  ActionTypeApi,
  dataRead,
  fundPricesUpdated,
  ListActionType,
  listItemCreated,
  listItemDeleted,
  listItemUpdated,
  listOverviewUpdated,
  loggedOut,
  receiptCreated,
} from '~client/actions';
import reducer, { initialState, State } from '~client/reducers/overview';
import { testResponse } from '~client/test-data';
import type { PageListCost, StandardInput } from '~client/types';
import { PageListStandard, ReceiptPage } from '~client/types/enum';
import type { FundHistory } from '~client/types/gql';

describe('Overview reducer', () => {
  const now = new Date('2019-07-13T11:43:10+0100');
  let clock: sinon.SinonFakeTimers;
  beforeAll(() => {
    clock = sinon.useFakeTimers(now);
  });
  afterAll(() => {
    clock.restore();
  });

  const state: State = {
    ...initialState,
    startDate: new Date('2019-04-30T23:59:59.999Z'),
    endDate: new Date('2019-07-31T23:59:59.999Z'),
    annualisedFundReturns: 0.1,
    monthly: {
      ...initialState.monthly,
      stocks: [0, 0, 510000, 2160465],
      [PageListStandard.Income]: [0, 30040, 229838, 196429],
      [PageListStandard.Bills]: [99778, 101073, 118057, 212450],
      [PageListStandard.Food]: [11907, 24108, 28123, 38352],
      [PageListStandard.General]: [12192, 9515, 28335, 160600],
      [PageListStandard.Holiday]: [46352, 0, 47398, 55597],
      [PageListStandard.Social]: [13275, 12593, 12400, 8115],
    },
  };

  describe.each`
    description                  | action
    ${ActionTypeLogin.LoggedOut} | ${loggedOut()}
  `('$description', ({ action }) => {
    it('should return the initial state', () => {
      expect.assertions(1);
      expect(reducer(undefined, action)).toStrictEqual(initialState);
    });
  });

  describe(ActionTypeApi.DataRead, () => {
    const action = dataRead({
      ...testResponse,
      overview: {
        startDate: '2019-04-30T23:59:59.999Z',
        endDate: '2019-07-31T22:59:59.999Z',
        annualisedFundReturns: 0.087,
        monthly: {
          stocks: [0, 0, 510000, 2160465],
          [PageListStandard.Income]: [0, 30040, 229838, 196429],
          [PageListStandard.Bills]: [99778, 101073, 118057, 212450],
          [PageListStandard.Food]: [11907, 24108, 28123, 38352],
          [PageListStandard.General]: [12192, 9515, 28335, 160600],
          [PageListStandard.Holiday]: [46352, 0, 47398, 55597],
          [PageListStandard.Social]: [13275, 12593, 12400, 8115],
        },
      },
    });

    it('should set the start date', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result).toHaveProperty('startDate', new Date('2019-04-30T23:59:59.999Z'));
    });

    it('should set the end date', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result).toHaveProperty('endDate', new Date('2019-07-31T22:59:59.999Z'));
    });

    it('should set the annualised fund returns', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result).toHaveProperty('annualisedFundReturns', 0.087);
    });

    it('should set the cost data', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.monthly).toStrictEqual(
        expect.objectContaining<State['monthly']>({
          stocks: [0, 0, 510000, 2160465],
          [PageListStandard.Income]: [0, 30040, 229838, 196429],
          [PageListStandard.Bills]: [99778, 101073, 118057, 212450],
          [PageListStandard.Food]: [11907, 24108, 28123, 38352],
          [PageListStandard.General]: [12192, 9515, 28335, 160600],
          [PageListStandard.Holiday]: [46352, 0, 47398, 55597],
          [PageListStandard.Social]: [13275, 12593, 12400, 8115],
        }),
      );
    });
  });

  describe(ListActionType.Created, () => {
    it('should add to the relevant month and category', () => {
      expect.assertions(1);
      const withGeneral = reducer(
        state,
        listItemCreated<StandardInput, PageListStandard>(
          PageListStandard.General,
          {
            date: new Date('2019-06-02T00:00:00.000Z'),
            item: 'some item',
            category: 'some category',
            cost: 34,
            shop: 'some shop',
          },
          false,
        ),
      );

      expect(withGeneral.monthly?.general?.[2]).toBe(28335 + 34);
    });

    it('should omit expenses which are for a house purchase', () => {
      expect.assertions(1);

      const withGeneral = reducer(
        state,
        listItemCreated<StandardInput, PageListStandard>(
          PageListStandard.General,
          {
            date: new Date('2019-06-02T00:00:00.000Z'),
            item: 'Balancing payment',
            category: 'House purchase',
            cost: 5950000,
            shop: 'Some conveyancers',
          },
          false,
        ),
      );

      expect(withGeneral.monthly?.general?.[2]).toBe(28335);
    });

    describe('when the action came from the server', () => {
      const actionFromServer = listItemCreated<StandardInput, PageListStandard>(
        PageListStandard.General,
        {
          date: new Date('2019-06-02T00:00:00.000Z'),
          item: 'some item',
          category: 'some category',
          cost: 34,
          shop: 'some shop',
        },
        true,
        numericHash('some-real-id'),
        numericHash('some-fake-id'),
      );

      it('should not update the state', () => {
        expect.assertions(1);
        expect(reducer(state, actionFromServer)).toBe(state);
      });
    });
  });

  describe(ListActionType.Updated, () => {
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
        listItemUpdated<StandardInput, PageListStandard>(
          PageListStandard.Food,
          numericHash('some-id'),
          delta,
          {
            id: 1234,
            date: new Date('2019-05-10'),
            item: 'some item',
            category: 'some category',
            cost: 34,
            shop: 'some shop',
          },
          false,
        ),
      );

      expect(result.monthly[PageListStandard.Food][1]).toBe(firstCost);
      expect(result.monthly[PageListStandard.Food][2]).toBe(secondCost);
    });

    describe('when the action came from the server', () => {
      const actionFromServer = listItemUpdated<StandardInput, PageListStandard>(
        PageListStandard.Food,
        numericHash('some-id'),
        { cost: 98 },
        {
          id: 1235,
          date: new Date('2019-05-10'),
          item: 'some item',
          category: 'some category',
          cost: 34,
          shop: 'some shop',
        },
        true,
      );

      it('should not update the state', () => {
        expect.assertions(1);
        expect(reducer(state, actionFromServer)).toBe(state);
      });
    });

    describe("when the old item was for a house purchase but the new one isn't", () => {
      it('should add the new cost', () => {
        expect.assertions(1);

        const result = reducer(
          state,
          listItemUpdated<StandardInput, PageListStandard>(
            PageListStandard.General,
            numericHash('some-id'),
            { category: 'Something else', cost: 567 },
            {
              id: 1237,
              date: new Date('2019-05-10'),
              item: 'some item',
              category: 'House purchase',
              cost: 5955500,
              shop: 'some shop',
            },
            false,
          ),
        );

        expect(result.monthly[PageListStandard.General][1]).toBe(9515 + 567);
      });
    });

    describe("when the new item is for a house purchase but the old one wasn't", () => {
      it('should remove the old cost', () => {
        expect.assertions(1);

        const result = reducer(
          state,
          listItemUpdated<StandardInput, PageListStandard>(
            PageListStandard.General,
            numericHash('some-id'),
            { category: 'House purchase', cost: 5955500 },
            {
              id: 1238,
              date: new Date('2019-05-10'),
              item: 'some item',
              category: 'some category',
              cost: 34,
              shop: 'some shop',
            },
            false,
          ),
        );

        expect(result.monthly[PageListStandard.General][1]).toBe(9515 - 34);
      });
    });
  });

  describe(ListActionType.Deleted, () => {
    it('should remove from the relevant month and category', () => {
      expect.assertions(1);
      const withHoliday = reducer(
        state,
        listItemDeleted<StandardInput, PageListStandard>(
          PageListStandard.Holiday,
          numericHash('some-id'),
          {
            date: new Date('2019-07-12T00:00Z'),
            item: 'some item',
            category: 'some holiday',
            cost: 1235,
            shop: 'some shop',
          },
          false,
        ),
      );

      expect(withHoliday.monthly?.holiday?.[3]).toBe(55597 - 1235);
    });

    describe('when the action came from the server', () => {
      const actionFromServer = listItemDeleted<StandardInput, PageListStandard>(
        PageListStandard.Food,
        numericHash('some-id'),
        {
          date: new Date('2019-07-12T00:00Z'),
          item: 'some item',
          category: 'some holiday',
          cost: 1235,
          shop: 'some shop',
        },
        true,
      );

      it('should not update the state', () => {
        expect.assertions(1);
        expect(reducer(state, actionFromServer)).toBe(state);
      });
    });

    it('should omit expenses which are for a house purchase', () => {
      expect.assertions(1);

      const withGeneral = reducer(
        state,
        listItemDeleted<StandardInput, PageListStandard>(
          PageListStandard.General,
          numericHash('some-id'),
          {
            date: new Date('2019-07-12T00:00Z'),
            item: 'some item',
            category: 'House purchase',
            cost: 5920000,
            shop: 'some shop',
          },
          false,
        ),
      );

      expect(withGeneral.monthly?.general?.[3]).toBe(160600);
    });
  });

  describe(ListActionType.OverviewUpdated, () => {
    it.each`
      page                       | overviewCost
      ${PageListStandard.Income} | ${[320000, 155663]}
      ${PageListStandard.Food}   | ${[16734, 29867]}
    `('should update the $page state with the given values', ({ page, overviewCost }) => {
      expect.assertions(1);
      const action = listOverviewUpdated(page, overviewCost);
      const result = reducer(initialState, action);

      expect(result.monthly[page as PageListCost]).toStrictEqual(overviewCost);
    });
  });

  describe(ActionTypeFunds.PricesUpdated, () => {
    const res = {
      annualisedFundReturns: 0.674,
      overviewCost: [1, 2, 303],
    } as FundHistory;

    const action = fundPricesUpdated(res);

    it('should set the annualised fund returns value', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result.annualisedFundReturns).toBe(0.674);
    });

    it('should set the overview funds cost', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);
      expect(result.monthly.stocks).toStrictEqual([1, 2, 303]);
    });
  });

  describe(ListActionType.ReceiptCreated, () => {
    const action = receiptCreated([
      {
        page: ReceiptPage.Food,
        id: 123,
        date: '2019-06-02', // index 2
        item: 'Some food item',
        category: 'Some food category',
        cost: 776,
        shop: 'Some shop',
      },
      {
        page: ReceiptPage.General,
        id: 124,
        date: '2019-07-20', // index 3
        item: 'Some general item',
        category: 'Some general category',
        cost: 913,
        shop: 'Some shop',
      },
      {
        page: ReceiptPage.Social,
        id: 125,
        date: '2019-04-13', // index 0
        item: 'Some social item',
        category: 'Some social category',
        cost: 729,
        shop: 'Some shop',
      },
    ]);

    it('should add the costs for each item in the receipt, to the correct page', () => {
      expect.assertions(3);

      const result = reducer(state, action);

      expect(result.monthly.food[2]).toBe(28123 + 776);
      expect(result.monthly.general[3]).toBe(160600 + 913);
      expect(result.monthly.social[0]).toBe(13275 + 729);
    });
  });
});
