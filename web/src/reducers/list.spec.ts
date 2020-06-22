import numericHash from 'string-hash';
import { makeListReducer, makeDailyListReducer, ListState, DailyState } from './list';
import {
  dataRead,
  syncReceived,
  listItemCreated,
  listItemUpdated,
  listItemDeleted,
  moreListDataRequested,
  moreListDataReceived,
  loggedOut,
} from '~client/actions';
import { DataKeyAbbr } from '~client/constants/api';
import { testResponse } from '~client/test-data';
import { Id, Page, PageListCalc, RequestType, Bill } from '~client/types';

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

  const page: PageListCalc = Page.income;
  type MyPage = Page.income;

  const initialState: State = {
    items: [],
    __optimistic: [],
    baz: 'initial baz',
  };

  const initialStateDaily: DailyState<Item> = {
    items: [],
    __optimistic: [],
    total: 0,
    weekly: 0,
    offset: 0,
    olderExists: null,
    loadingMore: false,
  };

  const myListReducer = makeListReducer<Item, MyPage, ExtraState>(page, initialState);

  const dailyReducer = makeDailyListReducer<Item, MyPage, Omit<State, 'baz'>>(page);

  const testDate = new Date('2020-04-20');

  describe.each`
    description     | action
    ${'LOGGED_OUT'} | ${loggedOut()}
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

  describe('DATA_READ', () => {
    const response = {
      data: [
        {
          [DataKeyAbbr.id]: numericHash('some-id'),
          [DataKeyAbbr.date]: '2020-04-20',
          [DataKeyAbbr.item]: 'yes',
          [DataKeyAbbr.cost]: 123,
        },
        {
          [DataKeyAbbr.id]: numericHash('other-id'),
          [DataKeyAbbr.date]: '2020-04-21',
          [DataKeyAbbr.item]: 'no',
          [DataKeyAbbr.cost]: 456,
        },
      ],
    };

    const action = dataRead({
      ...testResponse,
      [page]: response,
    });

    it('should insert rows into the state', () => {
      expect.assertions(2);
      const result = myListReducer(initialState, action);

      expect(result.items).toStrictEqual([
        expect.objectContaining({ id: numericHash('some-id'), item: 'yes' }),
        expect.objectContaining({ id: numericHash('other-id'), item: 'no' }),
      ]);
      expect(result.__optimistic).toStrictEqual([undefined, undefined]);
    });

    it('should handle the case when the response data contain no items', () => {
      expect.assertions(1);
      expect(
        myListReducer(
          initialState,
          dataRead({
            ...testResponse,
            [page]: {
              data: [],
            },
          }),
        ),
      ).toStrictEqual(initialState);
    });

    describe('for daily lists', () => {
      const actionRead = dataRead({
        ...testResponse,
        [page]: {
          total: 335,
          weekly: 122,
          olderExists: true,
          data: [
            {
              [DataKeyAbbr.id]: numericHash('some-id'),
              [DataKeyAbbr.date]: '2019-05-03',
              [DataKeyAbbr.item]: 'some-item',
              [DataKeyAbbr.cost]: 102,
            },
          ],
        },
      });

      it.each`
        description                | prop        | value
        ${'all-time total'}        | ${'total'}  | ${335}
        ${'weekly moving average'} | ${'weekly'} | ${122}
      `('should insert the $description value from the response', ({ prop, value }) => {
        expect.assertions(1);
        const result = dailyReducer(initialStateDaily, actionRead);

        expect(result).toStrictEqual(
          expect.objectContaining({
            [prop]: value,
          }),
        );
      });
    });
  });

  describe('ListAction.Create', () => {
    const action = listItemCreated<Item, Page.income>(page)({
      date: new Date('2019-07-10'),
      item: 'some item',
      cost: 3,
    });

    it('should optimistically create a list item', () => {
      expect.assertions(1);
      const result = myListReducer(initialState, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          items: [
            {
              id: action.fakeId,
              date: new Date('2019-07-10'),
              item: 'some item',
              cost: 3,
            },
          ],
          __optimistic: [RequestType.create],
        }),
      );
    });

    it('should ignore actions intended for other pages', () => {
      expect.assertions(1);
      const initialStateCreate: State = {
        ...initialState,
        items: [],
      };

      expect(
        myListReducer(
          initialStateCreate,
          listItemCreated<Bill, Page.bills>(Page.bills)({
            date: new Date('2020-04-20'),
            item: 'some item',
            cost: 1023,
          }),
        ),
      ).toBe(initialStateCreate);
    });

    describe('for daily lists', () => {
      const stateDaily = {
        ...initialStateDaily,
        total: 3,
      };

      const actionDaily = listItemCreated<Item, typeof page>(page)({
        date: new Date('2019-07-12'),
        item: 'some item',
        cost: 34,
      });

      it('should update the total', () => {
        expect.assertions(1);
        const result = dailyReducer(stateDaily, actionDaily);
        expect(result.total).toBe(3 + 34);
      });

      it('should ignore actions intended for other pages', () => {
        expect.assertions(1);
        expect(dailyReducer(stateDaily, { ...actionDaily, page: Page.bills })).toBe(stateDaily);
      });
    });
  });

  describe('ListAction.Update', () => {
    const state: State = {
      ...initialState,
      items: [{ id: numericHash('some-real-id'), date: testDate, item: 'some-item', cost: 23 }],
      __optimistic: [undefined],
    };

    const action = listItemUpdated<Item, typeof page>(page)(
      numericHash('some-real-id'),
      { item: 'other item' },
      {
        date: new Date('2020-04-20'),
        item: 'some item',
        cost: 20,
      },
    );

    it('should optimistically update a list item', () => {
      expect.assertions(1);
      const result = myListReducer(state, action);

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

      const actionAfterCreate = listItemUpdated<Item, typeof page>(page)(
        numericHash('some-fake-id'),
        { item: 'updated item' },
        {
          date: new Date('2020-04-20'),
          item: 'some item',
          cost: 20,
        },
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

    it('should ignore actions intended for other pages', () => {
      expect.assertions(1);
      const initialStateUpdate = {
        ...initialState,
        items: [{ id: numericHash('some-id'), date: testDate, item: 'some item', cost: 3 }],
        __optimistic: [undefined],
      };

      expect(
        myListReducer(
          initialStateUpdate,
          listItemUpdated<Bill, Page.bills>(Page.bills)(
            numericHash('some-id'),
            {
              date: new Date('2020-04-20'),
              item: 'old item',
              cost: 2931,
            },
            {
              date: new Date('2020-04-21'),
              item: 'new item',
              cost: 2934,
            },
          ),
        ),
      ).toBe(initialStateUpdate);
    });

    describe('for daily lists', () => {
      const stateDaily = {
        ...state,
        total: 5,
        weekly: 2,
        offset: 0,
        olderExists: null,
        loadingMore: false,
      };

      const actionDaily = listItemUpdated<Item, typeof page>(page)(
        numericHash('some-real-id'),
        {
          cost: 41,
          item: 'different item',
        },
        {
          date: new Date('2020-04-20'),
          item: 'some item',
          cost: 5,
        },
      );

      it('should update the total', () => {
        expect.assertions(1);
        const result = dailyReducer(stateDaily, actionDaily);

        expect(result.total).toBe(5 + 41 - 23);
      });

      it('should not update the total if it was not updated', () => {
        expect.assertions(1);
        const actionDailyNoCost = listItemUpdated<Item, typeof page>(page)(
          numericHash('some-real-id'),
          {
            item: 'different item',
          },
          {
            date: new Date('2020-04-20'),
            item: 'some item',
            cost: 5,
          },
        );

        const result = dailyReducer(stateDaily, actionDailyNoCost);

        expect(result.total).toBe(5);
      });

      it('should ignore actions intended for other pages', () => {
        expect.assertions(1);
        expect(dailyReducer(stateDaily, { ...actionDaily, page: Page.bills })).toBe(stateDaily);
      });
    });
  });

  describe('ListAction.Deleted', () => {
    const state: State = {
      ...initialState,
      items: [{ id: numericHash('some-real-id'), date: testDate, item: 'some item', cost: 29 }],
      __optimistic: [undefined],
    };

    const action = listItemDeleted<Item, typeof page>(page)(numericHash('some-real-id'), {
      date: new Date('2020-04-20'),
      item: 'some item',
      cost: 3,
    });

    it('should optimistically delete a list item', () => {
      expect.assertions(1);
      const result = myListReducer(state, action);

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

      const result = myListReducer(stateCreating, action);

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

      const result = myListReducer(stateUpdating, action);

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

    it('should ignore actions intended for other pages', () => {
      expect.assertions(1);
      const initialStateDelete = {
        ...initialState,
        items: [{ id: numericHash('some-id'), date: testDate, item: 'some item', cost: 3 }],
        __optimistic: [undefined],
      };

      expect(
        myListReducer(
          initialStateDelete,
          listItemDeleted<Item, Page.bills>(Page.bills)(numericHash('some-id'), {
            date: new Date('2020-04-20'),
            item: 'some item',
            cost: 3,
          }),
        ),
      ).toBe(initialStateDelete);
    });

    describe('for daily lists', () => {
      const stateDaily = {
        ...state,
        total: 51,
        weekly: 17,
        offset: 0,
        olderExists: null,
        loadingMore: false,
      };

      it('should update the total', () => {
        expect.assertions(1);
        const result = dailyReducer(stateDaily, action);

        expect(result.total).toBe(51 - 29);
      });

      it('should ignore actions intended for other pages', () => {
        expect.assertions(1);
        expect(dailyReducer(stateDaily, { ...action, page: Page.bills })).toBe(stateDaily);
      });
    });
  });

  describe('SYNC_RECEIVED', () => {
    const syncRequests = [
      {
        type: RequestType.create,
        method: 'post' as const,
        fakeId: numericHash('other-fake-id'),
        route: 'some-other-page',
        body: { some: 'data' },
      },
      {
        type: RequestType.update,
        method: 'put' as const,
        route: page,
        id: numericHash('real-id-z'),
        body: { other: 'something' },
      },
      {
        type: RequestType.delete,
        method: 'delete' as const,
        route: page,
        id: numericHash('real-id-x'),
      },
      {
        type: RequestType.create,
        method: 'post' as const,
        fakeId: numericHash('some-fake-id'),
        route: page,
        body: { thisItem: true },
      },
      {
        type: RequestType.create,
        method: 'post' as const,
        fakeId: numericHash('different-fake-id'),
        route: 'different-route',
        body: { some: 'data' },
      },
    ];

    const syncResponse = [
      {
        id: numericHash('real-id-a'),
        total: 516,
      },
      {
        total: 2354,
      },
      {
        total: 1976,
      },
      {
        id: numericHash('real-id-b'),
        total: 117,
      },
      {
        id: numericHash('real-id-different'),
        total: 1856,
      },
    ];

    const syncReceivedAction = syncReceived({
      list: syncRequests.map((request, index) => ({
        ...request,
        res: syncResponse[index],
      })),
      netWorth: [],
    });

    describe('when confirming an optimistically created item', () => {
      const state: State = {
        ...initialState,
        items: [
          {
            id: numericHash('some-fake-id'),
            date: testDate,
            item: 'some item',
            cost: 3,
          },
        ],
        __optimistic: [RequestType.create],
      };

      const stateDaily = {
        ...initialStateDaily,
        total: 100,
        items: [
          {
            id: numericHash('some-fake-id'),
            date: testDate,
            item: 'some item',
            cost: 3,
          },
        ],
        __optimistic: [RequestType.create],
      };

      it.each`
        reducer          | testState
        ${myListReducer} | ${state}
        ${dailyReducer}  | ${stateDaily}
      `(
        'should update with the real IDs and remove the optimistic status',
        ({ reducer, testState }) => {
          expect.assertions(1);
          const result = reducer(testState, syncReceivedAction);

          expect(result).toStrictEqual(
            expect.objectContaining({
              items: [
                expect.objectContaining({
                  id: numericHash('real-id-b'),
                  item: 'some item',
                  cost: 3,
                }),
              ],
              __optimistic: [undefined],
            }),
          );
        },
      );

      describe('for daily lists', () => {
        it('should update the list total from the last response', () => {
          expect.assertions(1);
          const result = dailyReducer(stateDaily, syncReceivedAction);

          expect(result.total).toBe(117);
        });

        describe("if there wasn't a relevant response", () => {
          const req = {
            type: RequestType.update,
            id: numericHash('some-real-id'),
            method: 'put' as const,
            route: `not-${page}`,
            query: {},
            body: { some: 'body' },
          };

          const res = [{ total: 8743 }];

          it("shouldn't update the list total", () => {
            expect.assertions(1);

            const action = syncReceived({ list: [{ ...req, res: res[0] }], netWorth: [] });
            const result = dailyReducer(stateDaily, action);
            expect(result.total).toBe(100); // not 8743
          });
        });
      });
    });

    describe('when confirming an optimistically updated item', () => {
      const state: State = {
        ...initialState,
        items: [
          {
            id: numericHash('real-id-z'),
            date: testDate,
            item: 'updated item',
            cost: 10,
          },
        ],
        __optimistic: [RequestType.update],
      };

      const stateDaily = {
        ...state,
        total: 105,
        weekly: 31,
        offset: 0,
        olderExists: null,
        loadingMore: false,
      };

      it.each`
        reducer          | testState
        ${myListReducer} | ${state}
        ${dailyReducer}  | ${stateDaily}
      `('should remove the optimistic status', ({ reducer, testState }) => {
        expect.assertions(1);
        const result = reducer(testState, syncReceivedAction);

        expect(result).toStrictEqual(
          expect.objectContaining({
            items: [
              expect.objectContaining({
                id: numericHash('real-id-z'),
                item: 'updated item',
                cost: 10,
              }),
            ],
            __optimistic: [undefined],
          }),
        );
      });

      describe('for daily lists', () => {
        it('should update the total from the response', () => {
          expect.assertions(1);
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
            id: numericHash('real-id-x'),
            date: testDate,
            item: 'some item',
            cost: 3,
          },
        ],
        __optimistic: [RequestType.delete],
      };

      const stateDaily = {
        ...state,
        total: 105,
        weekly: 15,
        offset: 0,
        olderExists: null,
        loadingMore: false,
      };

      it.each`
        reducer          | testState
        ${myListReducer} | ${state}
        ${dailyReducer}  | ${stateDaily}
      `('should remove the item from the state', ({ reducer, testState }) => {
        expect.assertions(1);
        const result = reducer(testState, syncReceivedAction);

        expect(result).toStrictEqual(
          expect.objectContaining({
            items: [],
            __optimistic: [],
          }),
        );
      });

      describe('for daily lists', () => {
        it('should update the total from the response', () => {
          expect.assertions(1);
          const resultDaily = dailyReducer(stateDaily, syncReceivedAction);

          expect(resultDaily.total).toBe(117);
        });
      });
    });
  });

  describe('ListActionType.MoreListDataRequested', () => {
    const action = moreListDataRequested(page);

    it('should set loadingMore to true', () => {
      expect.assertions(1);
      const result = dailyReducer(initialStateDaily, action);
      expect(result).toStrictEqual(
        expect.objectContaining({
          loadingMore: true,
        }),
      );
    });

    describe('if targeted at another page', () => {
      const actionOtherPage = moreListDataRequested(Page.social);

      it('should be ignored', () => {
        expect.assertions(1);
        expect(dailyReducer(initialStateDaily, actionOtherPage)).toBe(initialStateDaily);
      });
    });
  });

  describe('ListActionType.MoreListDataReceived', () => {
    const res = {
      data: [
        {
          I: numericHash('id-1'),
          d: '2020-04-20',
          i: 'some item',
          c: 123,
        },
      ],
      olderExists: true,
      total: 123456,
      weekly: 8765,
    };

    const action = moreListDataReceived(page, res);

    it('should append the data to state', () => {
      expect.assertions(1);

      const statePre = {
        ...initialStateDaily,
        items: [
          {
            id: numericHash('id-0'),
            date: new Date('2020-04-23'),
            item: 'existing item',
            cost: 156,
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
            },
            {
              id: numericHash('id-1'),
              date: new Date('2020-04-20'),
              item: 'some item',
              cost: 123,
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

    it('should set loadingMore to false', () => {
      expect.assertions(1);
      const result = dailyReducer({ ...initialStateDaily, loadingMore: true }, action);
      expect(result).toStrictEqual(
        expect.objectContaining({
          loadingMore: false,
        }),
      );
    });

    describe('if the olderExists value changed', () => {
      const resEnd = {
        ...res,
        olderExists: false,
      };

      const actionEnd = moreListDataReceived(page, resEnd);

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
      const actionOtherPage = moreListDataReceived(Page.bills, res);

      it('should be ignored', () => {
        expect.assertions(1);
        expect(dailyReducer(initialStateDaily, actionOtherPage)).toBe(initialStateDaily);
      });
    });
  });
});
