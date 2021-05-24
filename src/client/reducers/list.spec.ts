import numericHash from 'string-hash';
import { makeListReducer, makeDailyListReducer, ListState, DailyState } from './list';
import {
  ActionTypeLogin,
  ListActionType,
  listItemCreated,
  listItemUpdated,
  listItemDeleted,
  listOverviewUpdated,
  loggedOut,
  moreListDataReceived,
  receiptCreated,
} from '~client/actions';
import type { Id, StandardInput, WithIds } from '~client/types';
import { PageListStandard, ReceiptPage, RequestType } from '~client/types/enum';
import type { ListItemStandardInput, ListReadResponse } from '~client/types/gql';
import type { NativeDate, RequiredNotNull } from '~shared/types';

describe('List reducer', () => {
  type ExtraState = {
    baz: string;
  };

  type Item = {
    id: Id;
    date: Date;
    item: string;
    cost: number;
  };

  type State = ListState<Item, ExtraState>;

  const page = PageListStandard.Income;

  const initialState: State = {
    items: [],
    __optimistic: [],
    baz: 'initial baz',
  };

  const initialStateDaily: DailyState = {
    items: [],
    __optimistic: [],
    total: 0,
    weekly: 0,
    offset: 0,
    olderExists: true,
  };

  const myListReducer = makeListReducer<Item, WithIds<Item>, typeof page, ExtraState>(
    page,
    initialState,
  );

  const pageDaily = PageListStandard.Food;

  const dailyReducer = makeDailyListReducer<typeof pageDaily, Omit<State, 'baz'>>(pageDaily);

  const testDate = new Date('2020-04-20');

  describe.each`
    description                  | action
    ${ActionTypeLogin.LoggedOut} | ${loggedOut()}
  `('$description', ({ action }) => {
    it('should return the initial state', () => {
      expect.assertions(1);
      expect(myListReducer(undefined, action)).toStrictEqual(initialState);
    });

    it('should return the initial (daily) state', () => {
      expect.assertions(1);
      expect(dailyReducer(undefined, action)).toStrictEqual(initialStateDaily);
    });
  });

  describe(ListActionType.Created, () => {
    const actionFromLocal = listItemCreated<StandardInput, PageListStandard.Income>(
      page,
      {
        date: new Date('2019-07-10'),
        item: 'some item',
        category: 'category one',
        cost: 3,
        shop: 'shop one',
      },
      false,
      numericHash('some-fake-id'),
    );

    const actionFromServer = listItemCreated<StandardInput, PageListStandard.Income>(
      page,
      {
        date: new Date('2019-07-10'),
        item: 'some item',
        category: 'category one',
        cost: 3,
        shop: 'shop one',
      },
      true,
      numericHash('some-real-id'),
      actionFromLocal.id,
    );

    describe('when the action was initiated locally', () => {
      it('should optimistically create a list item', () => {
        expect.assertions(1);
        const result = myListReducer(initialState, actionFromLocal);

        expect(result).toStrictEqual(
          expect.objectContaining({
            items: [
              {
                id: actionFromLocal.id,
                date: new Date('2019-07-10'),
                item: 'some item',
                cost: 3,
                category: 'category one',
                shop: 'shop one',
              },
            ],
            __optimistic: [RequestType.create],
          }),
        );
      });
    });

    describe('when the action came from the server', () => {
      describe('when the item was not present in the state', () => {
        it('should create the list item (non-optimistically)', () => {
          expect.assertions(1);
          const result = myListReducer(initialState, actionFromServer);

          expect(result).toStrictEqual(
            expect.objectContaining({
              items: [
                {
                  id: actionFromServer.id,
                  date: new Date('2019-07-10'),
                  item: 'some item',
                  cost: 3,
                  category: 'category one',
                  shop: 'shop one',
                },
              ],
              __optimistic: [undefined],
            }),
          );
        });
      });

      describe('when the original fake ID was optimistically created', () => {
        const stateWithOptimisticCreate = myListReducer(initialState, actionFromLocal);

        it('should update with the real ID and remove the optimistic status', () => {
          expect.assertions(1);

          const result = myListReducer(stateWithOptimisticCreate, actionFromServer);

          expect(result).toStrictEqual(
            expect.objectContaining({
              items: [
                {
                  id: actionFromServer.id,
                  date: new Date('2019-07-10'),
                  item: 'some item',
                  cost: 3,
                  category: 'category one',
                  shop: 'shop one',
                },
              ],
              __optimistic: [undefined],
            }),
          );
        });
      });
    });

    describe('when the action is for another page', () => {
      it('should do nothing', () => {
        expect.assertions(1);
        const initialStateCreate: State = {
          ...initialState,
          items: [],
        };

        expect(
          myListReducer(
            initialStateCreate,
            listItemCreated<StandardInput, PageListStandard.Bills>(
              PageListStandard.Bills,
              {
                date: new Date('2020-04-20'),
                item: 'some item',
                cost: 1023,
                category: 'category one',
                shop: 'shop one',
              },
              false,
            ),
          ),
        ).toBe(initialStateCreate);
      });
    });

    describe('for daily lists', () => {
      const stateDaily = {
        ...initialStateDaily,
        total: 3,
      };

      const actionDailyFromLocal = listItemCreated<StandardInput, typeof pageDaily>(
        pageDaily,
        {
          date: new Date('2019-07-12'),
          item: 'some item',
          cost: 34,
          category: 'category one',
          shop: 'shop one',
        },
        false,
        numericHash('some-fake-id'),
      );

      it('should update the total', () => {
        expect.assertions(1);
        const result = dailyReducer(stateDaily, actionDailyFromLocal);
        expect(result.total).toBe(3 + 34);
      });

      it('should ignore actions intended for other pages', () => {
        expect.assertions(1);
        expect(
          dailyReducer(stateDaily, { ...actionDailyFromLocal, page: PageListStandard.Bills }),
        ).toBe(stateDaily);
      });

      describe('when the action was from the server', () => {
        const actionDailyFromServer = listItemCreated<StandardInput, typeof pageDaily>(
          pageDaily,
          {
            date: new Date('2019-07-12'),
            item: 'some item',
            cost: 34,
            category: 'category one',
            shop: 'shop one',
          },
          true,
          numericHash('some-real-id'),
          numericHash('some-fake-id'),
        );

        describe('and the item was optimistically created', () => {
          const stateDailyWithOptimisticCreate = dailyReducer(stateDaily, actionDailyFromLocal);

          it('should not update the total', () => {
            expect.assertions(1);
            const result = dailyReducer(stateDailyWithOptimisticCreate, actionDailyFromServer);
            expect(result.total).toBe(stateDailyWithOptimisticCreate.total);
          });
        });

        describe('and the item was not already in the state', () => {
          it('should update the total', () => {
            expect.assertions(1);
            const result = dailyReducer(stateDaily, actionDailyFromServer);
            expect(result.total).toBe(3 + 34);
          });
        });
      });
    });
  });

  describe(ListActionType.Updated, () => {
    const state: State = {
      ...initialState,
      items: [{ id: numericHash('some-real-id'), date: testDate, item: 'some-item', cost: 23 }],
      __optimistic: [undefined],
    };

    const actionFromLocal = listItemUpdated<StandardInput, typeof page>(
      page,
      numericHash('some-real-id'),
      { item: 'other item' },
      {
        id: 1234,
        date: new Date('2020-04-20'),
        item: 'some item',
        cost: 20,
        category: 'category one',
        shop: 'shop one',
      },
      false,
    );

    const actionFromServer = listItemUpdated<StandardInput, typeof page>(
      page,
      numericHash('some-real-id'),
      { item: 'other item' },
      {
        id: 1235,
        date: new Date('2020-04-20'),
        item: 'some item',
        cost: 20,
        category: 'category one',
        shop: 'shop one',
      },
      true,
    );

    describe('when the action was initiated locally', () => {
      it('should optimistically update a list item', () => {
        expect.assertions(1);
        const result = myListReducer(state, actionFromLocal);

        expect(result).toStrictEqual(
          expect.objectContaining({
            items: [
              {
                id: numericHash('some-real-id'),
                date: testDate,
                item: 'other item',
                cost: 23,
              },
            ],
            __optimistic: [RequestType.update],
          }),
        );
      });

      it('should not alter the status of optimistically created items', () => {
        expect.assertions(1);
        const stateCreate = {
          ...state,
          items: [
            {
              ...state.items[0],
              id: numericHash('some-fake-id'),
            },
          ],
          __optimistic: [RequestType.create],
        };

        const actionAfterCreate = listItemUpdated<StandardInput, typeof page>(
          page,
          numericHash('some-fake-id'),
          { item: 'updated item' },
          {
            id: 1236,
            date: new Date('2020-04-20'),
            item: 'some item',
            cost: 20,
            category: 'category one',
            shop: 'shop one',
          },
          false,
        );

        const result = myListReducer(stateCreate, actionAfterCreate);

        expect(result).toStrictEqual(
          expect.objectContaining({
            items: [
              expect.objectContaining({
                id: numericHash('some-fake-id'),
                item: 'updated item',
                cost: 23,
              }),
            ],
            __optimistic: [RequestType.create],
          }),
        );
      });
    });

    describe('when the action came from the server', () => {
      describe('when the item was not updated in the state', () => {
        it('should create the list item (non-optimistically)', () => {
          expect.assertions(1);
          const result = myListReducer(
            {
              ...initialState,
              items: [
                {
                  id: numericHash('some-real-id'),
                  date: new Date('2020-04-20'),
                  item: 'some item',
                  cost: 20,
                },
              ],
              __optimistic: [undefined],
            },
            actionFromServer,
          );

          expect(result).toStrictEqual(
            expect.objectContaining({
              items: [
                {
                  id: actionFromServer.id,
                  date: new Date('2020-04-20'),
                  item: 'other item',
                  cost: 20,
                },
              ],
              __optimistic: [undefined],
            }),
          );
        });
      });

      describe('when the item was optimistically updated', () => {
        const stateWithOptimisticUpdate = myListReducer(
          {
            ...initialState,
            items: [
              {
                id: numericHash('some-real-id'),
                date: new Date('2020-04-20'),
                item: 'some item',
                cost: 20,
              },
            ],
            __optimistic: [undefined],
          },
          actionFromLocal,
        );

        it('should remove the optimistic status', () => {
          expect.assertions(1);

          const result = myListReducer(stateWithOptimisticUpdate, actionFromServer);

          expect(result).toStrictEqual(
            expect.objectContaining({
              items: [
                {
                  id: numericHash('some-real-id'),
                  date: new Date('2020-04-20'),
                  item: 'other item',
                  cost: 20,
                },
              ],
              __optimistic: [undefined],
            }),
          );
        });
      });
    });

    describe('when the action was for another page', () => {
      it('should do nothing', () => {
        expect.assertions(1);
        const initialStateUpdate = {
          ...initialState,
          items: [{ id: numericHash('some-id'), date: testDate, item: 'some item', cost: 3 }],
          __optimistic: [undefined],
        };

        expect(
          myListReducer(
            initialStateUpdate,
            listItemUpdated<StandardInput, PageListStandard.Bills>(
              PageListStandard.Bills,
              numericHash('some-id'),
              {
                date: new Date('2020-04-20'),
                item: 'old item',
                cost: 2931,
              },
              {
                id: 1237,
                date: new Date('2020-04-21'),
                item: 'new item',
                cost: 2934,
                category: 'category one',
                shop: 'shop one',
              },
              false,
            ),
          ),
        ).toBe(initialStateUpdate);
      });
    });

    describe('for daily lists', () => {
      const stateDaily: DailyState<ExtraState> = {
        ...state,
        items: [{ ...state.items[0], category: 'category one', shop: 'shop one' }],
        total: 5,
        weekly: 2,
        offset: 0,
        olderExists: null,
      };

      const actionDaily = listItemUpdated<StandardInput, typeof pageDaily>(
        pageDaily,
        numericHash('some-real-id'),
        {
          cost: 41,
          item: 'different item',
        },
        {
          id: 1238,
          date: new Date('2020-04-20'),
          item: 'some item',
          cost: 5,
          category: 'category one',
          shop: 'shop one',
        },
        false,
      );

      it('should update the total', () => {
        expect.assertions(1);
        const result = dailyReducer(stateDaily, actionDaily);

        expect(result.total).toBe(5 + 41 - 23);
      });

      it('should not update the total if it was not updated', () => {
        expect.assertions(1);
        const actionDailyNoCost = listItemUpdated<StandardInput, typeof page>(
          page,
          numericHash('some-real-id'),
          {
            item: 'different item',
          },
          {
            id: 1239,
            date: new Date('2020-04-20'),
            item: 'some item',
            cost: 5,
            category: 'category one',
            shop: 'shop one',
          },
          false,
        );

        const result = dailyReducer(stateDaily, actionDailyNoCost);

        expect(result.total).toBe(5);
      });

      it('should ignore actions intended for other pages', () => {
        expect.assertions(1);
        expect(dailyReducer(stateDaily, { ...actionDaily, page: PageListStandard.Bills })).toBe(
          stateDaily,
        );
      });
    });
  });

  describe(ListActionType.Deleted, () => {
    const state: State = {
      ...initialState,
      items: [{ id: numericHash('some-real-id'), date: testDate, item: 'some item', cost: 29 }],
      __optimistic: [undefined],
    };

    const deletedItem: NativeDate<ListItemStandardInput, 'date'> = {
      date: new Date('2020-04-20'),
      item: 'some item',
      cost: 3,
      category: 'category one',
      shop: 'shop one',
    };

    const actionFromLocal = listItemDeleted<StandardInput, typeof page>(
      page,
      numericHash('some-real-id'),
      deletedItem,
      false,
    );

    const actionFromServer = listItemDeleted<StandardInput, typeof page>(
      page,
      numericHash('some-real-id'),
      {} as StandardInput,
      true,
    );

    const actionDaily = listItemDeleted<StandardInput, typeof pageDaily>(
      pageDaily,
      numericHash('some-real-id'),
      deletedItem,
      false,
    );

    describe('when the action was initiated locally', () => {
      it('should optimistically delete a list item', () => {
        expect.assertions(1);
        const result = myListReducer(state, actionFromLocal);

        expect(result).toStrictEqual(
          expect.objectContaining({
            items: [
              expect.objectContaining({
                id: numericHash('some-real-id'),
                item: 'some item',
                cost: 29,
              }),
            ],
            __optimistic: [RequestType.delete],
          }),
        );
      });

      it('should simply remove the item from state, if it was already in an optimistic creation state', () => {
        expect.assertions(1);
        const stateCreating = {
          ...state,
          items: [state.items[0]],
          __optimistic: [RequestType.create],
        };

        const result = myListReducer(stateCreating, actionFromLocal);

        expect(result).toStrictEqual(
          expect.objectContaining({
            items: [],
            __optimistic: [],
          }),
        );
      });

      it('should update the optimistic state to delete, if it was in an optimistic update status', () => {
        expect.assertions(1);
        const stateUpdating = {
          ...state,
          items: [state.items[0]],
          __optimistic: [RequestType.update],
        };

        const result = myListReducer(stateUpdating, actionFromLocal);

        expect(result).toStrictEqual(
          expect.objectContaining({
            items: [
              expect.objectContaining({
                id: numericHash('some-real-id'),
                item: 'some item',
                cost: 29,
              }),
            ],
            __optimistic: [RequestType.delete],
          }),
        );
      });
    });

    describe('when the action came from the server', () => {
      describe('when the item was not deleted in the state', () => {
        it('should delete the list item (non-optimistically)', () => {
          expect.assertions(1);
          const result = myListReducer(
            {
              ...initialState,
              items: [
                {
                  id: numericHash('some-real-id'),
                  date: new Date('2020-04-20'),
                  item: 'some item',
                  cost: 3,
                },
              ],
              __optimistic: [undefined],
            },
            actionFromServer,
          );

          expect(result).toStrictEqual(
            expect.objectContaining({
              items: [],
              __optimistic: [],
            }),
          );
        });
      });

      describe('when the item was optimistically deleted', () => {
        const stateWithOptimisticDelete = myListReducer(initialState, actionFromLocal);

        it('should remove the item and optimistic status', () => {
          expect.assertions(1);

          const result = myListReducer(stateWithOptimisticDelete, actionFromServer);

          expect(result).toStrictEqual(
            expect.objectContaining({
              items: [],
              __optimistic: [],
            }),
          );
        });
      });
    });

    describe('when the action was for another page', () => {
      it('should do nothing', () => {
        expect.assertions(1);
        const initialStateDelete = {
          ...initialState,
          items: [{ id: numericHash('some-id'), date: testDate, item: 'some item', cost: 3 }],
          __optimistic: [undefined],
        };

        expect(
          myListReducer(
            initialStateDelete,
            listItemDeleted<StandardInput, PageListStandard.Bills>(
              PageListStandard.Bills,
              numericHash('some-id'),
              {
                date: new Date('2020-04-20'),
                item: 'some item',
                cost: 3,
                category: 'category one',
                shop: 'shop one',
              },
              false,
            ),
          ),
        ).toBe(initialStateDelete);
      });
    });

    describe('for daily lists', () => {
      const stateDaily: DailyState = {
        ...state,
        items: [{ ...state.items[0], category: 'category one', shop: 'shop one' }],
        total: 51,
        weekly: 17,
        offset: 0,
        olderExists: null,
      };

      it('should update the total', () => {
        expect.assertions(1);
        const result = dailyReducer(stateDaily, actionDaily);

        expect(result.total).toBe(51 - 29);
      });

      it('should ignore actions intended for other pages', () => {
        expect.assertions(1);
        expect(dailyReducer(stateDaily, { ...actionDaily, page: PageListStandard.Bills })).toBe(
          stateDaily,
        );
      });
    });
  });

  describe(ListActionType.OverviewUpdated, () => {
    describe('for daily lists', () => {
      it.each`
        prop        | newValue
        ${'total'}  | ${123876112}
        ${'weekly'} | ${7691}
      `('should update the $prop value', ({ prop, newValue }) => {
        expect.assertions(1);

        const action = listOverviewUpdated(pageDaily, [], 123876112, 7691);
        const result = dailyReducer(initialStateDaily, action);

        expect(result[prop as 'total' | 'weekly']).toBe(newValue);
      });
    });
  });

  describe(ListActionType.MoreReceived, () => {
    const res: RequiredNotNull<Omit<ListReadResponse, 'error'>> = {
      items: [
        {
          id: numericHash('id-1'),
          date: '2020-04-20',
          item: 'some item',
          cost: 123,
          category: 'category one',
          shop: 'shop one',
        },
      ],
      olderExists: true,
      total: 123456,
      weekly: 8765,
      __typename: 'ListReadResponse',
    };

    const action = moreListDataReceived(pageDaily, res);

    it('should append the data to state', () => {
      expect.assertions(1);

      const statePre: DailyState = {
        ...initialStateDaily,
        items: [
          {
            id: numericHash('id-0'),
            date: new Date('2020-04-23'),
            item: 'existing item',
            cost: 156,
            category: 'category one',
            shop: 'shop one',
          },
        ],
        __optimistic: [RequestType.create],
      };

      const result = dailyReducer(statePre, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          items: [
            {
              id: numericHash('id-0'),
              date: new Date('2020-04-23'),
              item: 'existing item',
              cost: 156,
              category: 'category one',
              shop: 'shop one',
            },
            {
              id: numericHash('id-1'),
              date: new Date('2020-04-20'),
              item: 'some item',
              cost: 123,
              category: 'category one',
              shop: 'shop one',
            },
          ],
          __optimistic: [RequestType.create, undefined],
        }),
      );
    });

    it('should update the total', () => {
      expect.assertions(1);
      const result = dailyReducer(initialStateDaily, action);
      expect(result).toStrictEqual(expect.objectContaining({ total: 123456 }));
    });

    it('should update the weekly value', () => {
      expect.assertions(1);
      const result = dailyReducer(initialStateDaily, action);
      expect(result).toStrictEqual(expect.objectContaining({ weekly: 8765 }));
    });

    it('should increment the offset value', () => {
      expect.assertions(2);

      expect(dailyReducer(initialStateDaily, action)).toStrictEqual(
        expect.objectContaining({
          offset: 1,
        }),
      );

      expect(
        dailyReducer(
          {
            ...initialStateDaily,
            offset: 37,
          },
          action,
        ),
      ).toStrictEqual(
        expect.objectContaining({
          offset: 38,
        }),
      );
    });

    describe('if the olderExists value changed', () => {
      const resEnd: ListReadResponse = {
        ...res,
        olderExists: false,
      };

      const actionEnd = moreListDataReceived(pageDaily, resEnd);

      it('should update the olderExists state value', () => {
        expect.assertions(1);
        const result = dailyReducer(initialStateDaily, actionEnd);
        expect(result).toStrictEqual(
          expect.objectContaining({
            olderExists: false,
          }),
        );
      });
    });

    describe('if targeted at another page', () => {
      const actionOtherPage = moreListDataReceived(PageListStandard.Bills, res);

      it('should be ignored', () => {
        expect.assertions(1);
        expect(dailyReducer(initialStateDaily, actionOtherPage)).toBe(initialStateDaily);
      });
    });

    describe('if one or more of the items already exists in the state', () => {
      const statePre: DailyState = {
        ...initialStateDaily,
        items: [
          {
            id: numericHash('id-0'),
            date: new Date('2020-04-20'),
            item: 'item 0',
            cost: 1,
            category: 'category one',
            shop: 'shop one',
          },
          {
            id: numericHash('id-1'),
            date: new Date('2020-04-21'),
            item: 'item 1',
            cost: 2,
            category: 'category one',
            shop: 'shop one',
          },
          {
            id: numericHash('id-2'),
            date: new Date('2020-04-22'),
            item: 'item 2',
            cost: 3,
            category: 'category one',
            shop: 'shop one',
          },
        ],
        __optimistic: [RequestType.update, undefined, undefined],
      };

      const actionWithDuplicates = moreListDataReceived(pageDaily, {
        items: [
          {
            id: numericHash('id-1'),
            date: '2020-04-28',
            item: 'item 1 from API',
            cost: 24,
            category: 'category one',
            shop: 'shop one',
          },
          {
            id: numericHash('id-2'),
            date: '2020-04-22',
            item: 'item 2 from API',
            cost: 25,
            category: 'category one',
            shop: 'shop one',
          },
          {
            id: numericHash('id-3'),
            date: '2020-04-23',
            item: 'item 3 from API',
            cost: 26,
            category: 'category one',
            shop: 'shop one',
          },
        ],
      });

      it('should not duplicate items', () => {
        expect.assertions(1);
        const result = dailyReducer(statePre, actionWithDuplicates);
        expect(result).toStrictEqual(
          expect.objectContaining({
            items: [
              expect.objectContaining({
                id: numericHash('id-0'),
              }),
              expect.objectContaining({
                id: numericHash('id-1'),
              }),
              expect.objectContaining({
                id: numericHash('id-2'),
              }),
              expect.objectContaining({
                id: numericHash('id-3'),
              }),
            ],
            __optimistic: [RequestType.update, undefined, undefined, undefined],
          }),
        );
      });

      it('should override the current items with the results from the API', () => {
        expect.assertions(1);
        const result = dailyReducer(statePre, actionWithDuplicates);
        expect(result).toStrictEqual(
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                date: new Date('2020-04-28'),
                item: 'item 1 from API',
                cost: 24,
              }),
              expect.objectContaining({
                item: 'item 2 from API',
                cost: 25,
              }),
            ]),
          }),
        );
      });
    });
  });

  describe(ListActionType.ReceiptCreated, () => {
    it('should add those receipt items belonging to the page to the state', () => {
      expect.assertions(2);
      expect(pageDaily).toBe(ReceiptPage.Food);

      const action = receiptCreated([
        {
          page: ReceiptPage.Food,
          id: 123,
          date: '2020-04-20',
          item: 'Some food item',
          category: 'Some food category',
          cost: 776,
          shop: 'Some shop',
        },
        {
          page: ReceiptPage.General,
          id: 124,
          date: '2020-04-20',
          item: 'Some general item',
          category: 'Some general category',
          cost: 913,
          shop: 'Some shop',
        },
        {
          page: ReceiptPage.Food,
          id: 125,
          date: '2020-04-20',
          item: 'Other food item',
          category: 'Other food category',
          cost: 729,
          shop: 'Some shop',
        },
      ]);

      const result = dailyReducer(
        {
          ...initialStateDaily,
          items: [
            {
              id: 184,
              date: new Date('2020-04-13'),
              item: 'Existing food item',
              category: 'Existing food category',
              cost: 710,
              shop: 'Other shop',
            },
          ],
          __optimistic: [RequestType.create],
        },
        action,
      );

      expect(result).toStrictEqual(
        expect.objectContaining({
          items: [
            {
              id: 184,
              date: new Date('2020-04-13'),
              item: 'Existing food item',
              category: 'Existing food category',
              cost: 710,
              shop: 'Other shop',
            },
            {
              id: 123,
              date: new Date('2020-04-20'),
              item: 'Some food item',
              category: 'Some food category',
              cost: 776,
              shop: 'Some shop',
            },
            {
              id: 125,
              date: new Date('2020-04-20'),
              item: 'Other food item',
              category: 'Other food category',
              cost: 729,
              shop: 'Some shop',
            },
          ],
          __optimistic: [RequestType.create, undefined, undefined],
        }),
      );
    });
  });
});
