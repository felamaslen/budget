import { getTransactionsList } from '~client/modules/data';
import { State } from '~client/reducers';
import { getCrudRequests } from '~client/selectors/list';
import { testState as state } from '~client/test-data/state';
import { Page } from '~client/types/app';
import { RequestType } from '~client/types/crud';

describe('List selectors', () => {
  describe('getCrudRequests', () => {
    it('should map optimistically updated items to an HTTP request list', () => {
      expect.assertions(1);
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
            },
          ],
          __optimistic: [RequestType.update],
        },
        [Page.bills]: { ...state[Page.bills], items: [] },
        [Page.food]: {
          ...state[Page.food],
          items: [
            {
              id: 'real-id-z',
              date: new Date('2020-04-29'),
              item: 'some-food-item',
              category: 'some-food-category',
              cost: 27,
              shop: 'some-food-shop',
            },
          ],
          __optimistic: [RequestType.update],
        },
        [Page.general]: {
          ...state[Page.general],
          items: [
            {
              id: 'some-fake-id',
              date: new Date('2020-04-29'),
              item: 'some-general-item',
              category: 'some-general-category',
              cost: 913,
              shop: 'some-general-shop',
            },
          ],
          __optimistic: [RequestType.create],
        },
        [Page.holiday]: {
          ...state[Page.holiday],
          items: [
            {
              id: 'real-id-x',
              date: new Date('2020-04-29'),
              item: 'some-holiday-item',
              holiday: 'some-holiday-holiday',
              cost: 103,
              shop: 'some-holiday-shop',
            },
          ],
          __optimistic: [RequestType.delete],
        },
        [Page.social]: { ...state[Page.social], items: [] },
      };

      expect(getCrudRequests(stateWithUpdates)).toStrictEqual([
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
