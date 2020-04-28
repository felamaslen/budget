import { DateTime } from 'luxon';

import { Action } from 'create-reducer-object';
import { makeListReducer, makeDailyListReducer, ListState, DailyState } from './list';
import { listItemCreated, listItemUpdated, listItemDeleted } from '~client/actions/list';
import { dataRead, syncReceived } from '~client/actions/api';
import { loggedOut } from '~client/actions/login';
import { RequestType } from '~client/types/crud';
import { DATA_KEY_ABBR } from '~client/constants/data';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('List reducer', () => {
  type ExtraState = {
    baz: string;
  };

  type Item = {
    id: string;
    item: string;
    cost: number;
  };

  type State = ListState<Item, ExtraState>;

  const page = 'food';

  const customHandlers = {
    CUSTOM_HANDLER_101: (_: State, action: Action): Partial<State> => ({
      baz: action.foo,
    }),
  };

  const initialState: State = {
    items: [],
    baz: 'initial baz',
  };

  const initialStateDaily: DailyState<Item> = {
    items: [],
    total: 0,
    olderExists: null,
  };

  type RawItem = {
    I: string;
    i: string;
    c: number;
  };

  const myListReducer = makeListReducer<Item, RawItem, ExtraState>(
    page,
    customHandlers,
    initialState,
  );

  const dailyReducer = makeDailyListReducer<Item, RawItem, Omit<State, 'baz'>>(page);

  describe.each([
    ['Null action', null],
    ['LOGGED_OUT', loggedOut()],
  ])('%s', (_, action) => {
    it('should return the initial state', () => {
      expect(myListReducer(undefined, action)).toEqual(initialState);
    });

    it('should return the initial (daily) state', () => {
      expect(dailyReducer(undefined, action)).toEqual(initialStateDaily);
    });
  });

  describe('DATA_READ', () => {
    const action = dataRead({
      [page]: {
        data: [
          { [DATA_KEY_ABBR.id]: 'some-id', [DATA_KEY_ABBR.item]: 'yes' },
          { [DATA_KEY_ABBR.id]: 'other-id', [DATA_KEY_ABBR.item]: 'no' },
        ],
      },
    });

    it('should insert rows into the state', () => {
      const result = myListReducer(initialState, action);

      expect(result.items).toEqual([
        { id: 'some-id', item: 'yes' },
        { id: 'other-id', item: 'no' },
      ]);
    });

    describe('for daily lists', () => {
      const actionRead = dataRead({
        [page]: {
          total: 335,
          olderExists: true,
          data: [
            {
              [DATA_KEY_ABBR.id]: 'some-id',
              [DATA_KEY_ABBR.date]: '2019-05-03',
              [DATA_KEY_ABBR.item]: 'some-item',
              [DATA_KEY_ABBR.cost]: 102,
            },
          ],
        },
      });

      it('should insert the all-time total value from the response', () => {
        const result = dailyReducer(initialStateDaily, actionRead);

        expect(result).toEqual(
          expect.objectContaining({
            total: 335,
            olderExists: true,
            items: [
              {
                id: 'some-id',
                date: DateTime.fromISO('2019-05-03'),
                item: 'some-item',
                cost: 102,
              },
            ],
          }),
        );
      });
    });
  });

  describe('LIST_ITEM_CREATED', () => {
    const action = listItemCreated(page, {
      date: DateTime.fromISO('2019-07-10'),
      item: 'some item',
      category: 'some category',
      cost: 3,
      shop: 'some shop',
    });

    it('should optimistically create a list item', () => {
      const result = myListReducer(initialState, action);

      expect(result).toEqual(
        expect.objectContaining({
          items: [
            {
              id: action.fakeId,
              date: DateTime.fromISO('2019-07-10'),
              item: 'some item',
              category: 'some category',
              cost: 3,
              shop: 'some shop',
              __optimistic: RequestType.create,
            },
          ],
        }),
      );
    });

    it('should not do anything if not all the data exist', () => {
      const actionNone = listItemCreated(page, {
        shop: 'prop',
        cost: 3,
      });

      const result = myListReducer(initialState, actionNone);

      expect(result.items).toEqual([]);
    });

    it("should omit properties which are not in the page's column definition", () => {
      const actionExtra = listItemCreated(page, {
        date: DateTime.fromISO('2019-07-14'),
        item: 'some item',
        category: 'some category',
        cost: 21,
        shop: 'some shop',
        foo: 'bar',
      });

      const result = myListReducer(initialState, actionExtra);

      expect(result.items).toEqual([
        {
          id: actionExtra.fakeId,
          date: DateTime.fromISO('2019-07-14'),
          item: 'some item',
          category: 'some category',
          cost: 21,
          shop: 'some shop',
          __optimistic: RequestType.create,
        },
      ]);
    });

    it('should ignore actions intended for other pages', () => {
      const initialStateCreate: State = {
        ...initialState,
        items: [],
      };

      expect(
        myListReducer(
          initialStateCreate,
          listItemCreated('other-page', {
            some: 'prop',
            is: true,
          }),
        ),
      ).toBe(initialStateCreate);
    });

    describe('for daily lists', () => {
      const actionDaily = listItemCreated(page, {
        date: DateTime.fromISO('2019-07-12'),
        item: 'some item',
        category: 'some category',
        cost: 34,
        shop: 'some shop',
      });

      it('should update the total', () => {
        const result = dailyReducer(
          {
            ...initialStateDaily,
            total: 3,
          },
          actionDaily,
        );

        expect(result.total).toBe(3 + 34);
      });
    });
  });

  describe('LIST_ITEM_UPDATED', () => {
    const state: State = {
      ...initialState,
      items: [{ id: 'some-real-id', item: 'some-item', cost: 23 }],
    };

    const action = listItemUpdated(page, 'some-real-id', { item: 'other item' });

    it('should optimistically update a list item', () => {
      const result = myListReducer(state, action);

      expect(result.items).toEqual([
        {
          id: 'some-real-id',
          item: 'other item',
          cost: 23,
          __optimistic: RequestType.update,
        },
      ]);
    });

    it('should omit properties which are not present on the item', () => {
      const actionNull = listItemUpdated(page, 'some-real-id', { other: 'should not exist' });

      const resultNull = myListReducer(state, actionNull);

      expect(resultNull.items).toEqual([{ id: 'some-real-id', item: 'some-item', cost: 23 }]);

      const actionSome = listItemUpdated(page, 'some-real-id', {
        other: 'should not exist',
        item: 'next item',
      });

      const resultSome = myListReducer(state, actionSome);

      expect(resultSome.items).toEqual([
        {
          id: 'some-real-id',
          item: 'next item',
          cost: 23,
          __optimistic: RequestType.update,
        },
      ]);
    });

    it('should not alter the status of optimistically created items', () => {
      const stateCreate = {
        ...state,
        items: [
          {
            ...state.items[0],
            id: 'some-fake-id',
            __optimistic: RequestType.create,
          },
        ],
      };

      const actionAfterCreate = listItemUpdated(page, 'some-fake-id', { item: 'updated item' });

      const result = myListReducer(stateCreate, actionAfterCreate);

      expect(result.items).toEqual([
        {
          id: 'some-fake-id',
          item: 'updated item',
          cost: 23,
          __optimistic: RequestType.create,
        },
      ]);
    });

    it('should ignore actions intended for other pages', () => {
      const initialStateUpdate = {
        ...initialState,
        items: [{ id: 'some-id', item: 'some item', cost: 3 }],
      };

      expect(
        myListReducer(
          initialStateUpdate,
          listItemUpdated('other-page', 'some-id', {
            some: 'prop',
            is: true,
          }),
        ),
      ).toBe(initialStateUpdate);
    });

    describe('for daily lists', () => {
      const stateDaily = {
        ...state,
        total: 5,
        olderExists: null,
      };

      const actionDaily = listItemUpdated(page, 'some-real-id', {
        cost: 41,
        item: 'different item',
      });

      it('should update the total', () => {
        const result = dailyReducer(stateDaily, actionDaily);

        expect(result.total).toBe(5 + 41 - 23);
      });
    });
  });

  describe('LIST_ITEM_DELETED', () => {
    const state: State = {
      ...initialState,
      items: [{ id: 'some-real-id', item: 'some item', cost: 29 }],
    };

    const action = listItemDeleted('some-real-id', { page });

    it('should optimistically delete a list item', () => {
      const result = myListReducer(state, action);

      expect(result.items).toEqual([
        {
          id: 'some-real-id',
          item: 'some item',
          cost: 29,
          __optimistic: RequestType.delete,
        },
      ]);
    });

    it('should simply remove the item from state, if it was already in an optimistic creation state', () => {
      const stateCreating = {
        ...state,
        items: [
          {
            ...state.items[0],
            __optimistic: RequestType.create,
          },
        ],
      };

      const result = myListReducer(stateCreating, action);

      expect(result.items).toEqual([]);
    });

    it('should update the optimistic state to delete, if it was in an optimistic update status', () => {
      const stateUpdating = {
        ...state,
        items: [
          {
            ...state.items[0],
            __optimistic: RequestType.update,
          },
        ],
      };

      const result = myListReducer(stateUpdating, action);

      expect(result.items).toEqual([
        {
          id: 'some-real-id',
          item: 'some item',
          cost: 29,
          __optimistic: RequestType.delete,
        },
      ]);
    });

    it('should ignore actions intended for other pages', () => {
      const initialStateDelete = {
        ...initialState,
        items: [{ id: 'some-id', item: 'some item', cost: 3 }],
      };

      expect(
        myListReducer(
          initialStateDelete,
          listItemDeleted('some-id', {
            page: 'other-page',
          }),
        ),
      ).toBe(initialStateDelete);
    });

    describe('for daily lists', () => {
      const stateDaily = {
        ...state,
        total: 51,
        olderExists: null,
      };

      it('should update the total', () => {
        const result = dailyReducer(stateDaily, action);

        expect(result.total).toBe(51 - 29);
      });
    });
  });

  describe('SYNC_RECEIVED', () => {
    const syncRequests = [
      {
        type: RequestType.create,
        fakeId: 'other-fake-id',
        route: 'some-other-page',
        body: { some: 'data' },
      },
      {
        type: RequestType.update,
        route: page,
        id: 'real-id-z',
        body: { other: 'something' },
      },
      {
        type: RequestType.delete,
        route: page,
        id: 'real-id-x',
      },
      {
        type: RequestType.create,
        fakeId: 'some-fake-id',
        route: page,
        body: { thisItem: true },
      },
      {
        type: RequestType.create,
        fakeId: 'different-fake-id',
        route: 'different-route',
        body: { some: 'data' },
      },
    ];

    const syncResponse = [
      {
        id: 'real-id-a',
        total: 516,
      },
      {
        total: 2354,
      },
      {
        total: 1976,
      },
      {
        id: 'real-id-b',
        total: 117,
      },
      {
        id: 'real-id-different',
        total: 1856,
      },
    ];

    const syncReceivedAction = syncReceived({
      list: syncRequests.map((request, index) => ({
        ...request,
        res: syncResponse[index],
      })),
    });

    describe('when confirming an optimistically created item', () => {
      const state: State = {
        ...initialState,
        items: [
          {
            id: 'some-fake-id',
            item: 'some item',
            cost: 3,
            __optimistic: RequestType.create,
          },
        ],
      };

      it('should update with the real IDs and remove the optimistic status', () => {
        const result = myListReducer(state, syncReceivedAction);

        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toEqual({
          id: 'real-id-b',
          item: 'some item',
          cost: 3,
          __optimistic: undefined,
        });
      });

      describe('for daily lists', () => {
        const stateDaily = {
          ...initialStateDaily,
          total: 100,
          items: [
            {
              id: 'some-fake-id',
              item: 'some item',
              cost: 3,
              __optimistic: RequestType.create,
            },
          ],
        };

        it('should update the list total from the last response', () => {
          const result = dailyReducer(stateDaily, syncReceivedAction);

          expect(result.total).toBe(117);
        });

        describe("if there wasn't a relevant response", () => {
          const req = [
            {
              type: RequestType.update,
              id: 'some-real-id',
              method: 'put',
              route: `not-${page}`,
              query: {},
              body: { some: 'body' },
            },
          ];

          const res = [{ total: 8743 }];

          const action = syncReceived({ list: [{ ...req, res: res[0] }] });

          const result = dailyReducer(stateDaily, action);

          expect(result.total).toBe(100); // not 8743
        });
      });
    });

    describe('when confirming an optimistically updated item', () => {
      const state: State = {
        ...initialState,
        items: [
          {
            id: 'real-id-z',
            item: 'updated item',
            cost: 10,
            __optimistic: RequestType.update,
          },
        ],
      };

      it('should remove the optimistic status', () => {
        const result = myListReducer(state, syncReceivedAction);

        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toEqual({
          id: 'real-id-z',
          item: 'updated item',
          cost: 10,
          __optimistic: undefined,
        });
      });

      describe('for daily lists', () => {
        const stateDaily = {
          ...state,
          total: 105,
          olderExists: null,
        };

        it('should update the total from the response', () => {
          const resultDaily = dailyReducer(stateDaily, syncReceivedAction);

          expect(resultDaily.total).toBe(117);
        });
      });
    });

    describe('when confirming optimistically deleted items', () => {
      const state: State = {
        ...initialState,
        items: [
          {
            id: 'real-id-x',
            item: 'some item',
            cost: 3,
            __optimistic: RequestType.delete,
          },
        ],
      };

      it('should remove the item from the state', () => {
        const result = myListReducer(state, syncReceivedAction);

        expect(result.items).toHaveLength(0);
      });

      describe('for daily lists', () => {
        const stateDaily = {
          ...state,
          total: 105,
          olderExists: null,
        };

        it('should update the total from the response', () => {
          const resultDaily = dailyReducer(stateDaily, syncReceivedAction);

          expect(resultDaily.total).toBe(117);
        });
      });
    });
  });

  describe('custom handlers', () => {
    const action = { type: 'CUSTOM_HANDLER_101', foo: 'something else' };

    it('should produce custom results', () => {
      const result = myListReducer(initialState, action);

      expect(result.baz).toBe('something else');
    });
  });
});
