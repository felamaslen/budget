/* eslint-disable max-lines */
import reducer, { State, initialState } from './net-worth';
import { dataRead, syncReceived, loggedOut } from '~client/actions';
import {
  netWorthCategoryCreated,
  netWorthCategoryUpdated,
  netWorthCategoryDeleted,
  netWorthSubcategoryCreated,
  netWorthSubcategoryUpdated,
  netWorthSubcategoryDeleted,
  netWorthCreated,
  netWorthUpdated,
  netWorthDeleted,
} from '~client/actions/net-worth';
import {
  testResponse,
  testState,
  CATEGORY_CASH,
  CATEGORY_MORTGAGE,
  CATEGORY_CC,
  SUBCATEGORY_WALLET,
  SUBCATEGORY_HOUSE,
  SUBCATEGORY_CC,
  CURRENCY_CZK,
} from '~client/test-data';
import { RequestType, Category, Subcategory } from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('Net worth reducer', () => {
  describe.each`
    description     | action
    ${'LOGGED_OUT'} | ${loggedOut()}
  `('$description', ({ action }) => {
    it('should return the initial state', () => {
      expect.assertions(1);
      expect(reducer(undefined, action)).toStrictEqual(initialState);
    });
  });

  describe('NET_WORTH_CATEGORY_CREATED', () => {
    const action = netWorthCategoryCreated({
      type: 'asset',
      category: 'Cash (easy access)',
      color: '#00ff00',
      isOption: false,
    });

    it('should optimistically create a category', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.categories).toStrictEqual({
        items: [
          {
            id: action.fakeId,
            type: 'asset',
            category: 'Cash (easy access)',
            color: '#00ff00',
            isOption: false,
          },
        ],
        __optimistic: [RequestType.create],
      });
    });
  });

  describe('NET_WORTH_CATEGORY_UPDATED', () => {
    const state: State = {
      ...initialState,
      categories: {
        items: [
          {
            id: 'some-real-id',
            type: 'asset',
            category: 'Cash (easy access)',
            color: '#00ff00',
            isOption: false,
          },
        ],
        __optimistic: [undefined],
      },
    };

    const action = netWorthCategoryUpdated('some-real-id', {
      type: 'liability',
      category: 'Mortgage',
      color: '#fa0000',
      isOption: false,
    });

    it('should optimistically update a category', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result.categories).toStrictEqual({
        items: [
          {
            id: 'some-real-id',
            type: 'liability',
            category: 'Mortgage',
            color: '#fa0000',
            isOption: false,
          },
        ],
        __optimistic: [RequestType.update],
      });
    });
  });

  describe('NET_WORTH_CATEGORY_DELETED', () => {
    const state: State = {
      ...initialState,
      categories: {
        items: [
          {
            id: 'some-real-id',
            type: 'asset',
            category: 'Cash (easy access)',
            color: '#00ff00',
            isOption: false,
          },
        ],
        __optimistic: [undefined],
      },
      subcategories: { items: [], __optimistic: [] },
      entries: { items: [], __optimistic: [] },
    };

    const action = netWorthCategoryDeleted('some-real-id');

    it('should optimistically delete a category', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: {
            items: [
              {
                id: 'some-real-id',
                type: 'asset',
                category: 'Cash (easy access)',
                color: '#00ff00',
                isOption: false,
              },
            ],
            __optimistic: [RequestType.delete],
          },
          subcategories: { items: [], __optimistic: [] },
          entries: { items: [], __optimistic: [] },
        }),
      );
    });

    it('should delete a pending category and its dependencies', () => {
      expect.assertions(1);
      const otherCategory: Category = {
        id: 'other-cat-id',
        type: 'liability',
        category: 'Some liability',
        color: 'red',
        isOption: false,
      };
      const otherSubcategory: Subcategory = {
        id: 'subcat-B',
        subcategory: 'other-subcategory',
        categoryId: 'other-cat-id',
        hasCreditLimit: null,
        opacity: 1,
      };

      const statePendingChildren: State = {
        ...state,
        categories: {
          items: [
            {
              id: 'some-real-id',
              type: 'asset',
              category: 'Cash (easy access)',
              color: '#00ff00',
              isOption: false,
            },
            otherCategory,
          ],
          __optimistic: [RequestType.create, undefined],
        },
        subcategories: {
          items: [
            {
              id: 'subcat-A',
              subcategory: 'some-subcategory',
              categoryId: 'some-real-id',
              hasCreditLimit: null,
              opacity: 1,
            },
            otherSubcategory,
          ],
          __optimistic: [RequestType.create, undefined],
        },
        entries: {
          items: [
            {
              id: 'entry-A0',
              date: new Date(),
              values: [
                { id: 'value-id-1', subcategory: 'subcat-B', value: 3 },
                { id: 'value-id-2', subcategory: 'subcat-A', value: 4 },
              ],
              currencies: [],
              creditLimit: [],
            },
          ],
          __optimistic: [RequestType.create],
        },
      };

      const result = reducer(statePendingChildren, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: { items: [otherCategory], __optimistic: [undefined] },
          subcategories: { items: [otherSubcategory], __optimistic: [undefined] },
          entries: {
            items: [
              expect.objectContaining({
                id: 'entry-A0',
                values: [{ id: 'value-id-1', subcategory: 'subcat-B', value: 3 }],
              }),
            ],
            __optimistic: [RequestType.create],
          },
        }),
      );
    });
  });

  describe('NET_WORTH_SUBCATEGORY_CREATED', () => {
    const action = netWorthSubcategoryCreated({
      categoryId: 'some-category-id',
      subcategory: 'My bank account',
      hasCreditLimit: null,
      opacity: 0.2,
    });

    it('should optimistically create a subcategory', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.subcategories).toStrictEqual({
        items: [
          {
            id: action.fakeId,
            categoryId: 'some-category-id',
            subcategory: 'My bank account',
            hasCreditLimit: null,
            opacity: 0.2,
          },
        ],
        __optimistic: [RequestType.create],
      });
    });
  });

  describe('NET_WORTH_SUBCATEGORY_UPDATED', () => {
    const state: State = {
      ...initialState,
      subcategories: {
        items: [
          {
            id: 'some-subcategory-id',
            categoryId: 'some-category-id',
            subcategory: 'My bank account',
            hasCreditLimit: null,
            opacity: 0.2,
          },
        ],
        __optimistic: [undefined],
      },
    };

    const action = netWorthSubcategoryUpdated('some-subcategory-id', {
      categoryId: 'other-category-id',
      subcategory: 'My credit card',
      hasCreditLimit: true,
      opacity: 0.3,
    });

    it('should optimistically update a subcategory', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result.subcategories).toStrictEqual({
        items: [
          {
            id: 'some-subcategory-id',
            categoryId: 'other-category-id',
            subcategory: 'My credit card',
            hasCreditLimit: true,
            opacity: 0.3,
          },
        ],
        __optimistic: [RequestType.update],
      });
    });
  });

  describe('NET_WORTH_SUBCATEGORY_DELETED', () => {
    const state: State = {
      ...initialState,
      categories: {
        items: [
          {
            id: 'some-category-id',
            category: 'some-category',
            type: 'asset',
            color: 'green',
            isOption: false,
          },
        ],
        __optimistic: [undefined],
      },
      subcategories: {
        items: [
          {
            id: 'some-subcategory-id',
            categoryId: 'some-category-id',
            subcategory: 'My bank account',
            hasCreditLimit: null,
            opacity: 0.2,
          },
        ],
        __optimistic: [undefined],
      },
      entries: { items: [], __optimistic: [] },
    };

    const action = netWorthSubcategoryDeleted('some-subcategory-id');

    it('should optimistically delete a subcategory', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result.subcategories).toStrictEqual({
        items: [
          {
            id: 'some-subcategory-id',
            categoryId: 'some-category-id',
            subcategory: 'My bank account',
            hasCreditLimit: null,
            opacity: 0.2,
          },
        ],
        __optimistic: [RequestType.delete],
      });
    });

    it('should delete a pending subcategory and its dependencies', () => {
      expect.assertions(1);
      const statePendingChildren: State = {
        ...state,
        subcategories: {
          items: [
            {
              id: 'some-subcategory-id',
              categoryId: 'some-category-id',
              subcategory: 'My bank account',
              hasCreditLimit: null,
              opacity: 0.2,
            },
            { ...SUBCATEGORY_WALLET, id: 'subcat-A', categoryId: 'some-category-id' },
          ],
          __optimistic: [RequestType.create, undefined],
        },
        entries: {
          items: [
            {
              id: 'entry-A0',
              date: new Date(),
              values: [
                { id: 'value-id-a', value: 1, subcategory: 'some-subcategory-id' },
                { id: 'value-id-b', value: 1, subcategory: 'subcat-A' },
              ],
              currencies: [],
              creditLimit: [],
            },
          ],
          __optimistic: [RequestType.create],
        },
      };

      const result = reducer(statePendingChildren, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: statePendingChildren.categories,
          subcategories: {
            items: [{ ...SUBCATEGORY_WALLET, id: 'subcat-A', categoryId: 'some-category-id' }],
            __optimistic: [undefined],
          },
          entries: {
            items: [
              expect.objectContaining({
                id: 'entry-A0',
                values: [{ id: 'value-id-b', value: 1, subcategory: 'subcat-A' }],
              }),
            ],
            __optimistic: [RequestType.create],
          },
        }),
      );
    });
  });

  describe('NET_WORTH_CREATED', () => {
    const action = netWorthCreated({
      date: new Date('2019-07-12T12:36:03Z'),
      values: [
        {
          id: 'some-fake-value-id-1',
          subcategory: 'some-subcategory-id',
          skip: true,
          value: -239,
        },
        {
          id: 'some-fake-value-id-2',
          subcategory: 'other-subcategory-id',
          skip: null,
          value: [10, { currency: 'CZK', value: 37.34 }],
        },
      ],
      creditLimit: [{ subcategory: 'some-subcategory-id', value: 1000 }],
      currencies: [CURRENCY_CZK],
    });

    it('should optimistically create an entry', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.entries).toStrictEqual({
        items: [
          {
            id: action.fakeId,
            date: new Date('2019-07-12T12:36:03Z'),
            values: [
              expect.objectContaining({
                subcategory: 'some-subcategory-id',
                skip: true,
                value: -239,
              }),
              expect.objectContaining({
                subcategory: 'other-subcategory-id',
                skip: null,
                value: [10, { currency: 'CZK', value: 37.34 }],
              }),
            ],
            creditLimit: [{ subcategory: 'some-subcategory-id', value: 1000 }],
            currencies: [CURRENCY_CZK],
          },
        ],
        __optimistic: [RequestType.create],
      });
    });
  });

  describe('NET_WORTH_UPDATED', () => {
    const state: State = {
      ...initialState,
      entries: {
        items: [
          {
            id: 'some-entry-id',
            date: new Date('2019-07-12T12:36:03Z'),
            values: [
              {
                id: 'value-id-1',
                subcategory: 'some-subcategory-id',
                skip: true,
                value: -239,
              },
              {
                id: 'value-id-2',
                subcategory: 'other-subcategory-id',
                skip: null,
                value: [{ currency: 'CZK', value: 37.34 }],
              },
            ],
            creditLimit: [{ subcategory: 'some-subcategory-id', value: 1000 }],
            currencies: [CURRENCY_CZK],
          },
        ],
        __optimistic: [undefined],
      },
    };

    const action = netWorthUpdated('some-entry-id', {
      date: new Date('2019-07-31T23:54:00Z'),
      values: [
        {
          id: 'some-value-id',
          subcategory: 'some-subcategory-id',
          skip: true,
          value: -239,
        },
      ],
      creditLimit: [],
      currencies: [],
    });

    it('should optimistically update an entry', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result.entries).toStrictEqual({
        items: [
          {
            id: 'some-entry-id',
            date: new Date('2019-07-31T23:54:00Z'),
            values: [
              expect.objectContaining({
                subcategory: 'some-subcategory-id',
                skip: true,
                value: -239,
              }),
            ],
            creditLimit: [],
            currencies: [],
          },
        ],
        __optimistic: [RequestType.update],
      });
    });
  });

  describe('NET_WORTH_DELETED', () => {
    const state: State = {
      ...initialState,
      entries: {
        items: [
          {
            id: 'some-entry-id',
            date: new Date('2019-07-12T12:36:03Z'),
            values: [
              {
                id: 'value-id-1',
                subcategory: 'some-subcategory-id',
                skip: true,
                value: -239,
              },
              {
                id: 'value-id-2',
                subcategory: 'other-subcategory-id',
                skip: null,
                value: [10, { currency: 'CZK', value: 37.34 }],
              },
            ],
            creditLimit: [{ subcategory: 'some-subcategory-id', value: 1000 }],
            currencies: [CURRENCY_CZK],
          },
        ],
        __optimistic: [undefined],
      },
    };

    const action = netWorthDeleted('some-entry-id');

    it('should optimistically delete an entry', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result.entries).toStrictEqual({
        items: [
          {
            id: 'some-entry-id',
            date: new Date('2019-07-12T12:36:03Z'),
            values: [
              {
                id: 'value-id-1',
                subcategory: 'some-subcategory-id',
                skip: true,
                value: -239,
              },
              {
                id: 'value-id-2',
                subcategory: 'other-subcategory-id',
                skip: null,
                value: [10, { currency: 'CZK', value: 37.34 }],
              },
            ],
            creditLimit: [{ subcategory: 'some-subcategory-id', value: 1000 }],
            currencies: [CURRENCY_CZK],
          },
        ],
        __optimistic: [RequestType.delete],
      });
    });
  });

  describe('DATA_READ', () => {
    const action = dataRead({
      ...testResponse,
      netWorth: {
        categories: {
          data: [
            {
              id: 'some-category-id',
              type: 'asset',
              category: 'Cash (easy access)',
              color: '#00ff00',
              isOption: false,
            },
          ],
        },
        subcategories: {
          data: [
            {
              id: 'some-subcategory-id',
              categoryId: 'some-category-id',
              subcategory: 'My bank account',
              hasCreditLimit: null,
              opacity: 0.2,
            },
          ],
        },
        entries: {
          data: {
            items: [
              {
                id: 'some-entry-id',
                date: '2019-07-12',
                values: [
                  {
                    id: 'some-value-id-a',
                    subcategory: 'some-subcategory-id',
                    skip: true,
                    value: -239,
                  },
                  {
                    id: 'some-value-id-b',
                    subcategory: 'other-subcategory-id',
                    skip: null,
                    value: [10, { currency: 'CZK', value: 37.34 }],
                  },
                ],
                creditLimit: [{ subcategory: 'some-subcategory-id', value: 1000 }],
                currencies: [CURRENCY_CZK],
              },
            ],
            old: [145, 210],
            oldOptions: [1330, 19],
          },
        },
      },
    });

    it('should insert data into the state', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: {
            items: [
              {
                id: 'some-category-id',
                type: 'asset',
                category: 'Cash (easy access)',
                color: '#00ff00',
                isOption: false,
              },
            ],
            __optimistic: [undefined],
          },
          subcategories: {
            items: [
              {
                id: 'some-subcategory-id',
                categoryId: 'some-category-id',
                subcategory: 'My bank account',
                hasCreditLimit: null,
                opacity: 0.2,
              },
            ],
            __optimistic: [undefined],
          },
          entries: {
            items: [
              {
                id: 'some-entry-id',
                date: new Date('2019-07-12'),
                values: expect.arrayContaining([
                  {
                    id: expect.any(String),
                    subcategory: 'some-subcategory-id',
                    skip: true,
                    value: -239,
                  },
                  {
                    id: expect.any(String),
                    subcategory: 'other-subcategory-id',
                    skip: null,
                    value: [10, { currency: 'CZK', value: 37.34 }],
                  },
                ]),
                creditLimit: [{ subcategory: 'some-subcategory-id', value: 1000 }],
                currencies: [CURRENCY_CZK],
              },
            ],
            __optimistic: [undefined],
          },
          old: [145, 210],
          oldOptions: [1330, 19],
        }),
      );
    });

    it('should set default empty arrays for missing items', () => {
      expect.assertions(1);
      const actionMissing = dataRead({
        ...testResponse,
        netWorth: {
          categories: {
            data: [],
          },
          subcategories: {
            data: [],
          },
          entries: {
            data: {
              items: [
                {
                  id: 'some-entry-id',
                  date: '2019-07-12',
                  values: [
                    {
                      id: 'some-value-id-a',
                      subcategory: 'some-subcategory-id',
                      skip: true,
                      value: -239,
                    },
                  ],
                  creditLimit: [],
                  currencies: [],
                },
              ],
            },
          },
        },
      });

      const result = reducer(initialState, actionMissing);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: { items: [], __optimistic: [] },
          subcategories: { items: [], __optimistic: [] },
          entries: {
            items: [
              {
                id: 'some-entry-id',
                date: new Date('2019-07-12'),
                values: [
                  {
                    id: expect.any(String),
                    subcategory: 'some-subcategory-id',
                    skip: true,
                    value: -239,
                  },
                ],
                creditLimit: [],
                currencies: [],
              },
            ],
            __optimistic: [undefined],
          },
          old: [],
          oldOptions: [],
        }),
      );
    });

    it('should order the values by subcategory ID', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          entries: expect.objectContaining({
            items: [
              expect.objectContaining({
                id: 'some-entry-id',
                values: [
                  expect.objectContaining({
                    id: 'some-value-id-b',
                    subcategory: 'other-subcategory-id',
                  }),
                  expect.objectContaining({
                    id: 'some-value-id-a',
                    subcategory: 'some-subcategory-id',
                  }),
                ],
              }),
            ],
          }),
        }),
      );
    });
  });

  describe('SYNC_RECEIVED', () => {
    it('should confirm category creates, updating any dependencies', () => {
      expect.assertions(1);
      const state: State = {
        ...initialState,
        categories: {
          items: [
            CATEGORY_CASH,
            {
              ...CATEGORY_CC,
              id: 'some-fake-category-id',
            },
          ],
          __optimistic: [undefined, RequestType.create],
        },
        subcategories: {
          items: [
            SUBCATEGORY_WALLET,
            {
              ...SUBCATEGORY_CC,
              id: 'some-fake-subcategory-id',
              categoryId: 'some-fake-category-id',
            },
          ],
          __optimistic: [undefined, RequestType.create],
        },
        entries: {
          items: [
            {
              id: 'some-fake-entry-id',
              date: new Date('2019-07-12T12:36:03Z'),
              values: [
                {
                  id: 'value-id-1',
                  subcategory: 'some-fake-subcategory-id',
                  skip: true,
                  value: -239,
                },
                {
                  id: 'value-id-2',
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
              ],
              creditLimit: [{ subcategory: 'some-fake-subcategory-id', value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
          ],
          __optimistic: [RequestType.create],
        },
      };

      const action = syncReceived({
        list: [],
        netWorth: [
          {
            type: RequestType.create,
            fakeId: 'some-fake-category-id',
            method: 'post',
            route: 'net-worth/categories',
            body: {
              type: 'liability',
              category: 'Mortgage',
              color: '#fa0000',
            },
            res: CATEGORY_CC,
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: { items: [CATEGORY_CASH, CATEGORY_CC], __optimistic: [undefined, undefined] },
          subcategories: {
            items: [
              SUBCATEGORY_WALLET,
              {
                ...SUBCATEGORY_CC,
                // the subcategory can only be created after its category is confirmed
                id: 'some-fake-subcategory-id',
              },
            ],
            __optimistic: [undefined, RequestType.create],
          },
          entries: {
            items: [
              {
                id: 'some-fake-entry-id',
                date: new Date('2019-07-12T12:36:03Z'),
                values: expect.arrayContaining([
                  {
                    id: 'value-id-1',
                    subcategory: 'some-fake-subcategory-id',
                    skip: true,
                    value: -239,
                  },
                  {
                    id: 'value-id-2',
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [10, { currency: 'CZK', value: 37.34 }],
                  },
                ]),
                creditLimit: [{ subcategory: 'some-fake-subcategory-id', value: 1000 }],
                currencies: [CURRENCY_CZK],
              },
            ],
            __optimistic: [
              // the entry can only be created after its subcategories are confirmed
              RequestType.create,
            ],
          },
        }),
      );
    });

    it('should confirm category updates', () => {
      expect.assertions(1);
      const updatedCategory: Category = {
        id: CATEGORY_CC.id,
        type: 'asset',
        category: 'This is now an asset group',
        color: '#00aa00',
        isOption: false,
      };

      const state: State = {
        ...initialState,
        categories: { items: [updatedCategory], __optimistic: [RequestType.update] },
        subcategories: { items: [], __optimistic: [] },
        entries: { items: [], __optimistic: [] },
      };

      const action = syncReceived({
        list: [],
        netWorth: [
          {
            type: RequestType.update,
            id: CATEGORY_CC.id,
            method: 'put' as const,
            route: 'net-worth/categories',
            body: {
              type: 'asset',
              category: 'This is now an asset group',
              color: '#00aa00',
            },
            res: {
              id: CATEGORY_CC.id,
              type: 'asset' as const,
              category: 'This is now an asset group',
              color: '#00aa00',
              isOption: false,
            },
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: {
            items: [updatedCategory],
            __optimistic: [undefined],
          },
          subcategories: { items: [], __optimistic: [] },
          entries: { items: [], __optimistic: [] },
        }),
      );
    });

    it('should confirm category deletes, removing any dependencies', () => {
      expect.assertions(1);
      const state: State = {
        ...initialState,
        categories: {
          items: [CATEGORY_CC, CATEGORY_CASH],
          __optimistic: [RequestType.delete, undefined],
        },
        subcategories: {
          items: [SUBCATEGORY_CC, SUBCATEGORY_WALLET],
          __optimistic: [undefined, undefined],
        },
        entries: {
          items: [
            {
              id: 'some-entry-id',
              date: new Date('2019-07-12T12:36:03Z'),
              values: [
                {
                  id: 'value-id-1',
                  subcategory: SUBCATEGORY_CC.id,
                  skip: true,
                  value: -239,
                },
                {
                  id: 'value-id-2',
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
              ],
              creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
          ],
          __optimistic: [undefined],
        },
      };

      const action = syncReceived({
        list: [],
        netWorth: [
          {
            type: RequestType.delete,
            id: CATEGORY_CC.id,
            method: RequestType.delete,
            route: 'net-worth/categories',
            res: undefined,
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: { items: [CATEGORY_CASH], __optimistic: [undefined] },
          // The dependencies are deleted from the database through foreign key cascading,
          // but we have to update on the frontend to reflect that
          subcategories: { items: [SUBCATEGORY_WALLET], __optimistic: [undefined] },
          entries: {
            items: [
              {
                id: 'some-entry-id',
                date: new Date('2019-07-12T12:36:03Z'),
                values: [
                  {
                    id: 'value-id-2',
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [10, { currency: 'CZK', value: 37.34 }],
                  },
                ],
                creditLimit: [],
                currencies: [CURRENCY_CZK],
              },
            ],
            __optimistic: [undefined],
          },
        }),
      );
    });

    it('should confirm subcategory creates, updating any dependencies', () => {
      expect.assertions(1);
      const state: State = {
        ...initialState,
        categories: {
          items: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
          __optimistic: [undefined, undefined, undefined],
        },
        subcategories: {
          items: [
            SUBCATEGORY_HOUSE,
            SUBCATEGORY_WALLET,
            {
              ...SUBCATEGORY_CC,
              id: 'some-fake-subcategory-id',
            },
          ],
          __optimistic: [undefined, undefined, RequestType.create],
        },
        entries: {
          items: [
            {
              id: 'some-entry-id',
              date: new Date('2019-07-12T12:36:03Z'),
              values: [
                {
                  id: 'value-id-1',
                  subcategory: 'some-fake-subcategory-id',
                  skip: true,
                  value: -239,
                },
                {
                  id: 'value-id-2',
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
              ],
              creditLimit: [{ subcategory: 'some-fake-subcategory-id', value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
          ],
          __optimistic: [RequestType.create],
        },
      };

      const action = syncReceived({
        list: [],
        netWorth: [
          {
            type: RequestType.create,
            fakeId: 'some-fake-subcategory-id',
            method: 'post',
            route: 'net-worth/subcategories',
            body: {
              categoryId: CATEGORY_CC.id,
              subcategory: 'My credit card',
              hasCreditLimit: true,
              opacity: 0.2,
            },
            res: SUBCATEGORY_CC,
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: {
            items: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
            __optimistic: [undefined, undefined, undefined],
          },
          subcategories: {
            items: [SUBCATEGORY_HOUSE, SUBCATEGORY_WALLET, SUBCATEGORY_CC],
            __optimistic: [undefined, undefined, undefined],
          },
          entries: {
            items: [
              {
                id: 'some-entry-id',
                date: new Date('2019-07-12T12:36:03Z'),
                values: [
                  {
                    id: 'value-id-1',
                    subcategory: SUBCATEGORY_CC.id,
                    skip: true,
                    value: -239,
                  },
                  {
                    id: 'value-id-2',
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [10, { currency: 'CZK', value: 37.34 }],
                  },
                ],
                creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
                currencies: [CURRENCY_CZK],
              },
            ],
            __optimistic: [RequestType.create],
          },
        }),
      );
    });

    it('should confirm subcategory updates', () => {
      expect.assertions(1);
      const state: State = {
        ...initialState,
        categories: { items: [CATEGORY_MORTGAGE], __optimistic: [undefined] },
        subcategories: { items: [SUBCATEGORY_HOUSE], __optimistic: [RequestType.update] },
        entries: { items: [], __optimistic: [] },
      };

      const action = syncReceived({
        list: [],
        netWorth: [
          {
            type: RequestType.update,
            id: SUBCATEGORY_HOUSE.id,
            method: 'put',
            route: 'net-worth/subcategories',
            body: {
              categoryId: CATEGORY_MORTGAGE.id,
              subcategory: 'My house',
              hasCreditLimit: false,
              opacity: 0.2,
            },
            res: SUBCATEGORY_HOUSE,
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: { items: [CATEGORY_MORTGAGE], __optimistic: [undefined] },
          subcategories: { items: [SUBCATEGORY_HOUSE], __optimistic: [undefined] },
          entries: { items: [], __optimistic: [] },
        }),
      );
    });

    it('should confirm subcategory deletes, removing any dependencies', () => {
      expect.assertions(1);
      const state: State = {
        ...initialState,
        categories: {
          items: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
          __optimistic: [undefined, undefined, undefined],
        },
        subcategories: {
          items: [SUBCATEGORY_WALLET, SUBCATEGORY_HOUSE, SUBCATEGORY_CC],
          __optimistic: [undefined, undefined, RequestType.delete],
        },
        entries: {
          items: [
            {
              id: 'some-entry-id',
              date: new Date('2019-07-12T12:36:03Z'),
              values: [
                {
                  id: 'value-id-1',
                  subcategory: SUBCATEGORY_CC.id,
                  skip: false,
                  value: -239,
                },
                {
                  id: 'value-id-2',
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
              ],
              creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
          ],
          __optimistic: [undefined],
        },
      };

      const action = syncReceived({
        list: [],
        netWorth: [
          {
            type: RequestType.delete,
            id: SUBCATEGORY_CC.id,
            method: 'delete',
            route: 'net-worth/subcategories',
            res: undefined,
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: {
            items: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
            __optimistic: [undefined, undefined, undefined],
          },
          // The dependencies are deleted from the database through foreign key cascading,
          // but we have to update on the frontend to reflect that
          subcategories: {
            items: [SUBCATEGORY_WALLET, SUBCATEGORY_HOUSE],
            __optimistic: [undefined, undefined],
          },
          entries: {
            items: [
              {
                id: 'some-entry-id',
                date: new Date('2019-07-12T12:36:03Z'),
                values: [
                  {
                    id: 'value-id-2',
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [10, { currency: 'CZK', value: 37.34 }],
                  },
                ],
                creditLimit: [],
                currencies: [CURRENCY_CZK],
              },
            ],
            __optimistic: [undefined],
          },
        }),
      );
    });

    it('should confirm entry creates', () => {
      expect.assertions(1);
      const state: State = {
        ...initialState,
        categories: {
          items: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
          __optimistic: [undefined, undefined, undefined],
        },
        subcategories: {
          items: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
          __optimistic: [undefined, undefined, undefined],
        },
        entries: {
          items: [
            {
              id: 'some-fake-entry-id',
              date: new Date('2019-07-12T12:36:03Z'),
              values: [
                {
                  id: 'value-id-1',
                  subcategory: SUBCATEGORY_HOUSE.id,
                  skip: true,
                  value: -239,
                },
                {
                  id: 'value-id-2',
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
              ],
              creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
          ],
          __optimistic: [RequestType.create],
        },
      };

      const action = syncReceived({
        list: [],
        netWorth: [
          {
            type: RequestType.create,
            fakeId: 'some-fake-entry-id',
            method: 'post' as const,
            route: 'net-worth',
            body: {
              date: '2019-07-12',
              values: [
                {
                  subcategory: SUBCATEGORY_HOUSE.id,
                  skip: true,
                  value: -239,
                },
                {
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
              ],
              creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
            res: {
              id: 'some-real-entry-id',
              date: '2019-07-12',
              values: [
                {
                  id: 'value-id-1',
                  subcategory: SUBCATEGORY_HOUSE.id,
                  skip: true,
                  value: -239,
                },
                {
                  id: 'value-id-2',
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
              ],
              creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: {
            items: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
            __optimistic: [undefined, undefined, undefined],
          },
          subcategories: {
            items: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
            __optimistic: [undefined, undefined, undefined],
          },
          entries: expect.objectContaining({
            items: [
              expect.objectContaining({
                id: 'some-real-entry-id',
                date: new Date('2019-07-12T12:36:03Z'),
                values: [
                  {
                    id: 'value-id-1',
                    subcategory: SUBCATEGORY_HOUSE.id,
                    skip: true,
                    value: -239,
                  },
                  {
                    id: 'value-id-2',
                    subcategory: SUBCATEGORY_WALLET.id,
                    skip: null,
                    value: [10, { currency: 'CZK', value: 37.34 }],
                  },
                ],
                creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
                currencies: [CURRENCY_CZK],
              }),
            ],
            __optimistic: [undefined],
          }),
        }),
      );
    });

    describe('when confirming entry updates', () => {
      const state: State = {
        ...initialState,
        categories: {
          items: [CATEGORY_MORTGAGE, CATEGORY_CASH, CATEGORY_CC],
          __optimistic: [undefined, undefined, undefined],
        },
        subcategories: {
          items: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
          __optimistic: [undefined, undefined, undefined],
        },
        entries: {
          items: [
            {
              id: 'some-real-entry-id',
              date: new Date('2019-07-12T12:36:03Z'),
              values: [
                {
                  id: 'value-id-1',
                  subcategory: SUBCATEGORY_HOUSE.id,
                  skip: true,
                  value: -239,
                },
                {
                  id: 'value-id-2',
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
              ],
              creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
          ],
          __optimistic: [RequestType.update],
        },
      };

      const action = syncReceived({
        list: [],
        netWorth: [
          {
            type: RequestType.update,
            id: 'some-real-entry-id',
            method: 'put' as const,
            route: 'net-worth',
            body: {
              date: '2019-07-12',
              values: [
                {
                  id: 'value-id-1',
                  subcategory: SUBCATEGORY_HOUSE.id,
                  skip: true,
                  value: -239,
                },
                {
                  id: 'value-id-2',
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
              ],
              creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
            res: {
              id: 'some-real-entry-id',
              date: '2019-07-12',
              values: [
                {
                  id: 'value-id-2',
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
                {
                  id: 'value-id-1',
                  subcategory: SUBCATEGORY_HOUSE.id,
                  skip: true,
                  value: -239,
                },
              ],
              creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
          },
        ],
      });

      it('should update the optimistic status', () => {
        expect.assertions(1);

        const result = reducer(state, action);

        expect(result).toStrictEqual(
          expect.objectContaining({
            categories: {
              items: [CATEGORY_MORTGAGE, CATEGORY_CASH, CATEGORY_CC],
              __optimistic: [undefined, undefined, undefined],
            },
            subcategories: {
              items: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
              __optimistic: [undefined, undefined, undefined],
            },
            entries: {
              items: [
                expect.objectContaining({
                  id: 'some-real-entry-id',
                  date: new Date('2019-07-12T12:36:03Z'),
                  values: expect.arrayContaining([
                    {
                      id: 'value-id-1',
                      subcategory: SUBCATEGORY_HOUSE.id,
                      skip: true,
                      value: -239,
                    },
                    {
                      id: 'value-id-2',
                      subcategory: SUBCATEGORY_WALLET.id,
                      skip: null,
                      value: [10, { currency: 'CZK', value: 37.34 }],
                    },
                  ]),
                  creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
                  currencies: [CURRENCY_CZK],
                }),
              ],
              __optimistic: [undefined],
            },
          }),
        );
      });

      it('should preserve the order of entry value subcategory IDs', () => {
        expect.assertions(1);

        const result = reducer(state, action);

        expect(result).toStrictEqual(
          expect.objectContaining({
            entries: expect.objectContaining({
              items: [
                expect.objectContaining({
                  values: [
                    expect.objectContaining({ id: 'value-id-1' }),
                    expect.objectContaining({ id: 'value-id-2' }),
                  ],
                }),
              ],
            }),
          }),
        );
      });
    });

    it('should confirm entry deletes', () => {
      expect.assertions(1);
      const state: State = {
        ...initialState,
        categories: { items: [CATEGORY_CC, CATEGORY_CASH], __optimistic: [undefined, undefined] },
        subcategories: {
          items: [SUBCATEGORY_CC, SUBCATEGORY_WALLET],
          __optimistic: [undefined, undefined],
        },
        entries: {
          items: [
            {
              id: 'some-real-entry-id',
              date: new Date('2019-07-12T12:36:03Z'),
              values: [
                {
                  id: 'subcategory-id-1',
                  subcategory: SUBCATEGORY_CC.id,
                  skip: false,
                  value: -239,
                },
                {
                  id: 'subcategory-id-2',
                  subcategory: SUBCATEGORY_WALLET.id,
                  skip: null,
                  value: [10, { currency: 'CZK', value: 37.34 }],
                },
              ],
              creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
          ],
          __optimistic: [RequestType.delete],
        },
      };

      const action = syncReceived({
        list: [],
        netWorth: [
          {
            type: RequestType.delete,
            id: 'some-real-entry-id',
            method: 'delete',
            route: 'net-worth',
            res: undefined,
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          categories: { items: [CATEGORY_CC, CATEGORY_CASH], __optimistic: [undefined, undefined] },
          subcategories: {
            items: [SUBCATEGORY_CC, SUBCATEGORY_WALLET],
            __optimistic: [undefined, undefined],
          },
          entries: { items: [], __optimistic: [] },
        }),
      );
    });

    describe('if there are no net worth requests', () => {
      const actionDoNothing = syncReceived({ netWorth: [], list: [] });

      it('should not modify the state', () => {
        expect.assertions(1);
        const state = testState.netWorth;
        expect(reducer(state, actionDoNothing)).toBe(state);
      });
    });
  });
});
