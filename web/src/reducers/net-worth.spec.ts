/* eslint-disable max-lines */
import { DateTime } from 'luxon';

import { RequestType } from '~client/types/crud';
import { Category, Subcategory, Currency } from '~client/types/net-worth';
import reducer, { State, initialState } from '~client/reducers/net-worth';
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
import { dataRead, syncReceived } from '~client/actions/api';
import { loggedOut } from '~client/actions/login';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('Net worth reducer', () => {
  const CATEGORY_CASH: Category = {
    id: 'real-cash-category-id',
    type: 'asset',
    category: 'Cash (easy access)',
    color: '#00ff00',
  };

  const CATEGORY_MORTGAGE: Category = {
    id: 'real-mortgage-category-id',
    type: 'liability',
    category: 'Mortgage',
    color: '#fa0000',
  };

  const CATEGORY_CC: Category = {
    id: 'real-credit-card-category-id',
    type: 'liability',
    category: 'Credit cards',
    color: '#fc0000',
  };

  const SUBCATEGORY_WALLET: Subcategory = {
    id: 'real-wallet-subcategory-id',
    categoryId: CATEGORY_CASH.id,
    subcategory: 'My wallet',
    hasCreditLimit: null,
    opacity: 0.2,
  };

  const SUBCATEGORY_HOUSE: Subcategory = {
    id: 'real-house-subcategory-id',
    categoryId: CATEGORY_MORTGAGE.id,
    subcategory: 'My house',
    hasCreditLimit: false,
    opacity: 0.1,
  };

  const SUBCATEGORY_CC: Subcategory = {
    id: 'real-credit-card-subcategory-id',
    categoryId: CATEGORY_CC.id,
    subcategory: 'My credit card',
    hasCreditLimit: true,
    opacity: 0.3,
  };

  const CURRENCY_CZK: Currency = {
    id: 'real-currency-czk-id',
    currency: 'CZK',
    rate: 0.035,
  };

  describe.each([
    ['Null action', null],
    ['LOGGED_OUT', loggedOut()],
  ])('%s', (_, action) => {
    it('should return the initial state', () => {
      expect(reducer(undefined, action)).toEqual(initialState);
    });
  });

  describe('NET_WORTH_CATEGORY_CREATED', () => {
    const action = netWorthCategoryCreated({
      type: 'asset',
      category: 'Cash (easy access)',
      color: '#00ff00',
    });

    it('should optimistically create a category', () => {
      const result = reducer(initialState, action);

      expect(result.categories).toEqual([
        {
          id: action.fakeId,
          type: 'asset',
          category: 'Cash (easy access)',
          color: '#00ff00',
          __optimistic: RequestType.create,
        },
      ]);
    });
  });

  describe('NET_WORTH_CATEGORY_UPDATED', () => {
    const state: State = {
      ...initialState,
      categories: [
        {
          id: 'some-real-id',
          type: 'asset',
          category: 'Cash (easy access)',
          color: '#00ff00',
        },
      ],
    };

    const action = netWorthCategoryUpdated('some-real-id', {
      type: 'liability',
      category: 'Mortgage',
      color: '#fa0000',
    });

    it('should optimistically update a category', () => {
      const result = reducer(state, action);

      expect(result.categories).toEqual([
        {
          id: 'some-real-id',
          type: 'liability',
          category: 'Mortgage',
          color: '#fa0000',
          __optimistic: RequestType.update,
        },
      ]);
    });
  });

  describe('NET_WORTH_CATEGORY_DELETED', () => {
    const state: State = {
      ...initialState,
      categories: [
        {
          id: 'some-real-id',
          type: 'asset',
          category: 'Cash (easy access)',
          color: '#00ff00',
        },
      ],
      subcategories: [],
      entries: [],
    };

    const action = netWorthCategoryDeleted('some-real-id');

    it('should optimistically delete a category', () => {
      const result = reducer(state, action);

      expect(result).toEqual(
        expect.objectContaining({
          categories: [
            {
              id: 'some-real-id',
              type: 'asset',
              category: 'Cash (easy access)',
              color: '#00ff00',
              __optimistic: RequestType.delete,
            },
          ],
          subcategories: [],
          entries: [],
        }),
      );
    });

    it('should delete a pending category and its dependencies', () => {
      const otherCategory: Category = {
        id: 'other-cat-id',
        type: 'liability',
        category: 'Some liability',
        color: 'red',
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
        categories: [
          {
            id: 'some-real-id',
            type: 'asset',
            category: 'Cash (easy access)',
            color: '#00ff00',
            __optimistic: RequestType.create,
          },
          otherCategory,
        ],
        subcategories: [
          {
            id: 'subcat-A',
            subcategory: 'some-subcategory',
            categoryId: 'some-real-id',
            hasCreditLimit: null,
            opacity: 1,
            __optimistic: RequestType.create,
          },
          otherSubcategory,
        ],
        entries: [
          {
            id: 'entry-A0',
            date: DateTime.local(),
            values: [
              { id: 'value-id-1', subcategory: 'subcat-B', value: 3 },
              { id: 'value-id-2', subcategory: 'subcat-A', value: 4 },
            ],
            currencies: [],
            creditLimit: [],
            __optimistic: RequestType.create,
          },
        ],
      };

      const result = reducer(statePendingChildren, action);

      expect(result).toEqual(
        expect.objectContaining({
          categories: [otherCategory],
          subcategories: [otherSubcategory],
          entries: [
            expect.objectContaining({
              id: 'entry-A0',
              values: [{ id: 'value-id-1', subcategory: 'subcat-B', value: 3 }],
              __optimistic: RequestType.create,
            }),
          ],
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
      const result = reducer(initialState, action);

      expect(result.subcategories).toEqual([
        {
          id: action.fakeId,
          categoryId: 'some-category-id',
          subcategory: 'My bank account',
          hasCreditLimit: null,
          opacity: 0.2,
          __optimistic: RequestType.create,
        },
      ]);
    });
  });

  describe('NET_WORTH_SUBCATEGORY_UPDATED', () => {
    const state: State = {
      ...initialState,
      subcategories: [
        {
          id: 'some-subcategory-id',
          categoryId: 'some-category-id',
          subcategory: 'My bank account',
          hasCreditLimit: null,
          opacity: 0.2,
        },
      ],
    };

    const action = netWorthSubcategoryUpdated('some-subcategory-id', {
      categoryId: 'other-category-id',
      subcategory: 'My credit card',
      hasCreditLimit: true,
      opacity: 0.3,
    });

    it('should optimistically update a subcategory', () => {
      const result = reducer(state, action);

      expect(result.subcategories).toEqual([
        {
          id: 'some-subcategory-id',
          categoryId: 'other-category-id',
          subcategory: 'My credit card',
          hasCreditLimit: true,
          opacity: 0.3,
          __optimistic: RequestType.update,
        },
      ]);
    });
  });

  describe('NET_WORTH_SUBCATEGORY_DELETED', () => {
    const state: State = {
      ...initialState,
      categories: [
        {
          id: 'some-category-id',
          category: 'some-category',
          type: 'asset',
          color: 'green',
        },
      ],
      subcategories: [
        {
          id: 'some-subcategory-id',
          categoryId: 'some-category-id',
          subcategory: 'My bank account',
          hasCreditLimit: null,
          opacity: 0.2,
        },
      ],
      entries: [],
    };

    const action = netWorthSubcategoryDeleted('some-subcategory-id');

    it('should optimistically delete a subcategory', () => {
      const result = reducer(state, action);

      expect(result.subcategories).toEqual([
        {
          id: 'some-subcategory-id',
          categoryId: 'some-category-id',
          subcategory: 'My bank account',
          hasCreditLimit: null,
          opacity: 0.2,
          __optimistic: RequestType.delete,
        },
      ]);
    });

    it('should delete a pending subcategory and its dependencies', () => {
      const statePendingChildren: State = {
        ...state,
        subcategories: [
          {
            id: 'some-subcategory-id',
            categoryId: 'some-category-id',
            subcategory: 'My bank account',
            hasCreditLimit: null,
            opacity: 0.2,
            __optimistic: RequestType.create,
          },
          { ...SUBCATEGORY_WALLET, id: 'subcat-A', categoryId: 'some-category-id' },
        ],
        entries: [
          {
            id: 'entry-A0',
            date: DateTime.local(),
            values: [
              { id: 'value-id-a', value: 1, subcategory: 'some-subcategory-id' },
              { id: 'value-id-b', value: 1, subcategory: 'subcat-A' },
            ],
            currencies: [],
            creditLimit: [],
            __optimistic: RequestType.create,
          },
        ],
      };

      const result = reducer(statePendingChildren, action);

      expect(result).toEqual(
        expect.objectContaining({
          categories: statePendingChildren.categories,
          subcategories: [
            { ...SUBCATEGORY_WALLET, id: 'subcat-A', categoryId: 'some-category-id' },
          ],
          entries: [
            expect.objectContaining({
              id: 'entry-A0',
              values: [{ id: 'value-id-b', value: 1, subcategory: 'subcat-A' }],
              __optimistic: RequestType.create,
            }),
          ],
        }),
      );
    });
  });

  describe('NET_WORTH_CREATED', () => {
    const action = netWorthCreated({
      date: DateTime.fromISO('2019-07-12T12:36:03Z'),
      values: [
        {
          subcategory: 'some-subcategory-id',
          skip: true,
          value: -239,
        },
        {
          subcategory: 'other-subcategory-id',
          skip: null,
          value: [10, { currency: 'CZK', value: 37.34 }],
        },
      ],
      creditLimit: [{ subcategory: 'some-subcategory-id', value: 1000 }],
      currencies: [CURRENCY_CZK],
    });

    it('should optimistically create an entry', () => {
      const result = reducer(initialState, action);

      expect(result.entries).toEqual([
        {
          id: action.fakeId,
          date: DateTime.fromISO('2019-07-12T12:36:03Z'),
          values: [
            {
              subcategory: 'some-subcategory-id',
              skip: true,
              value: -239,
            },
            {
              subcategory: 'other-subcategory-id',
              skip: null,
              value: [10, { currency: 'CZK', value: 37.34 }],
            },
          ],
          creditLimit: [{ subcategory: 'some-subcategory-id', value: 1000 }],
          currencies: [CURRENCY_CZK],
          __optimistic: RequestType.create,
        },
      ]);
    });
  });

  describe('NET_WORTH_UPDATED', () => {
    const state: State = {
      ...initialState,
      entries: [
        {
          id: 'some-entry-id',
          date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
    };

    const action = netWorthUpdated('some-entry-id', {
      date: DateTime.fromISO('2019-07-31T23:54:00Z'),
      values: [
        {
          subcategory: 'some-subcategory-id',
          skip: true,
          value: -239,
        },
      ],
      creditLimit: [],
      currencies: [],
    });

    it('should optimistically update an entry', () => {
      const result = reducer(state, action);

      expect(result.entries).toEqual([
        {
          id: 'some-entry-id',
          date: DateTime.fromISO('2019-07-31T23:54:00Z'),
          values: [
            expect.objectContaining({
              subcategory: 'some-subcategory-id',
              skip: true,
              value: -239,
            }),
          ],
          creditLimit: [],
          currencies: [],
          __optimistic: RequestType.update,
        },
      ]);
    });
  });

  describe('NET_WORTH_DELETED', () => {
    const state: State = {
      ...initialState,
      entries: [
        {
          id: 'some-entry-id',
          date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
    };

    const action = netWorthDeleted('some-entry-id');

    it('should optimistically delete an entry', () => {
      const result = reducer(state, action);

      expect(result.entries).toEqual([
        {
          id: 'some-entry-id',
          date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
          __optimistic: RequestType.delete,
        },
      ]);
    });
  });

  describe('DATA_READ', () => {
    const action = dataRead({
      netWorth: {
        categories: {
          data: [
            {
              id: 'some-category-id',
              type: 'asset',
              category: 'Cash (easy access)',
              color: '#00ff00',
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
                    subcategory: 'some-subcategory-id',
                    skip: true,
                    value: -239,
                  },
                  {
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
          },
        },
      },
    });

    it('should insert data into the state', () => {
      const result = reducer(initialState, action);

      expect(result).toEqual(
        expect.objectContaining({
          categories: [
            {
              id: 'some-category-id',
              type: 'asset',
              category: 'Cash (easy access)',
              color: '#00ff00',
            },
          ],
          subcategories: [
            {
              id: 'some-subcategory-id',
              categoryId: 'some-category-id',
              subcategory: 'My bank account',
              hasCreditLimit: null,
              opacity: 0.2,
            },
          ],
          entries: [
            {
              id: 'some-entry-id',
              date: DateTime.fromISO('2019-07-12'),
              values: [
                {
                  subcategory: 'some-subcategory-id',
                  skip: true,
                  value: -239,
                },
                {
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
        }),
      );
    });

    it('should set default empty arrays for missing items', () => {
      const actionMissing = dataRead({
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
                      subcategory: 'some-subcategory-id',
                      skip: true,
                      value: -239,
                    },
                  ],
                },
              ],
            },
          },
        },
      });

      const result = reducer(initialState, actionMissing);

      expect(result).toEqual(
        expect.objectContaining({
          categories: [],
          subcategories: [],
          entries: [
            {
              id: 'some-entry-id',
              date: DateTime.fromISO('2019-07-12'),
              values: [
                {
                  subcategory: 'some-subcategory-id',
                  skip: true,
                  value: -239,
                },
              ],
              creditLimit: [],
              currencies: [],
            },
          ],
          old: [],
        }),
      );
    });
  });

  describe('SYNC_RECEIVED', () => {
    it('should confirm category creates, updating any dependencies', () => {
      const state: State = {
        ...initialState,
        categories: [
          CATEGORY_CASH,
          {
            ...CATEGORY_CC,
            id: 'some-fake-category-id',
            __optimistic: RequestType.create,
          },
        ],
        subcategories: [
          SUBCATEGORY_WALLET,
          {
            ...SUBCATEGORY_CC,
            id: 'some-fake-subcategory-id',
            categoryId: 'some-fake-category-id',
            __optimistic: RequestType.create,
          },
        ],
        entries: [
          {
            id: 'some-fake-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
            __optimistic: RequestType.create,
          },
        ],
      };

      const action = syncReceived({
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

      expect(result).toEqual(
        expect.objectContaining({
          categories: [CATEGORY_CASH, { ...CATEGORY_CC, __optimistic: undefined }],
          subcategories: [
            SUBCATEGORY_WALLET,
            {
              ...SUBCATEGORY_CC,
              // the subcategory can only be created after its category is confirmed
              id: 'some-fake-subcategory-id',
              __optimistic: RequestType.create,
            },
          ],
          entries: [
            {
              id: 'some-fake-entry-id',
              date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
              // // the entry can only be created after its subcategories are confirmed
              __optimistic: RequestType.create,
            },
          ],
        }),
      );
    });

    it('should confirm category updates', () => {
      const state: State = {
        ...initialState,
        categories: [
          {
            ...CATEGORY_CC,
            __optimistic: RequestType.update,
          },
        ],
        subcategories: [],
        entries: [],
      };

      const action = syncReceived({
        netWorth: [
          {
            type: RequestType.update,
            id: CATEGORY_CC.id,
            method: 'put',
            route: 'net-worth/categories',
            body: {
              type: 'asset',
              category: 'This is now an asset group',
              color: '#00aa00',
            },
            res: {
              id: CATEGORY_CC.id,
              type: 'asset',
              category: 'This is now an asset group',
              color: '#00aa00',
            },
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toEqual(
        expect.objectContaining({
          categories: [
            {
              id: CATEGORY_CC.id,
              type: 'asset',
              category: 'This is now an asset group',
              color: '#00aa00',
              __optimistic: undefined,
            },
          ],
          subcategories: [],
          entries: [],
        }),
      );
    });

    it('should confirm category deletes, removing any dependencies', () => {
      const state: State = {
        ...initialState,
        categories: [
          {
            ...CATEGORY_CC,
            __optimistic: RequestType.delete,
          },
          CATEGORY_CASH,
        ],
        subcategories: [SUBCATEGORY_CC, SUBCATEGORY_WALLET],
        entries: [
          {
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
      };

      const action = syncReceived({
        netWorth: [
          {
            type: RequestType.delete,
            id: CATEGORY_CC.id,
            method: 'delete',
            route: 'net-worth/categories',
            res: null,
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toEqual(
        expect.objectContaining({
          categories: [CATEGORY_CASH],
          // The dependencies are deleted from the database through foreign key cascading,
          // but we have to update on the frontend to reflect that
          subcategories: [SUBCATEGORY_WALLET],
          entries: [
            {
              id: 'some-entry-id',
              date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
        }),
      );
    });

    it('should confirm subcategory creates, updating any dependencies', () => {
      const state: State = {
        ...initialState,
        categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
        subcategories: [
          SUBCATEGORY_HOUSE,
          SUBCATEGORY_WALLET,
          {
            ...SUBCATEGORY_CC,
            id: 'some-fake-subcategory-id',
            __optimistic: RequestType.create,
          },
        ],
        entries: [
          {
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
            __optimistic: RequestType.create,
          },
        ],
      };

      const action = syncReceived({
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

      expect(result).toEqual(
        expect.objectContaining({
          categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
          subcategories: [
            SUBCATEGORY_HOUSE,
            SUBCATEGORY_WALLET,
            {
              ...SUBCATEGORY_CC,
              __optimistic: undefined,
            },
          ],
          entries: [
            {
              id: 'some-entry-id',
              date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
              __optimistic: RequestType.create,
            },
          ],
        }),
      );
    });

    it('should confirm subcategory updates', () => {
      const state: State = {
        ...initialState,
        categories: [CATEGORY_MORTGAGE],
        subcategories: [
          {
            ...SUBCATEGORY_HOUSE,
            __optimistic: RequestType.update,
          },
        ],
        entries: [],
      };

      const action = syncReceived({
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

      expect(result).toEqual(
        expect.objectContaining({
          categories: [CATEGORY_MORTGAGE],
          subcategories: [
            {
              ...SUBCATEGORY_HOUSE,
              __optimistic: undefined,
            },
          ],
          entries: [],
        }),
      );
    });

    it('should confirm subcategory deletes, removing any dependencies', () => {
      const state: State = {
        ...initialState,
        categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
        subcategories: [
          SUBCATEGORY_WALLET,
          SUBCATEGORY_HOUSE,
          {
            ...SUBCATEGORY_CC,
            __optimistic: RequestType.delete,
          },
        ],
        entries: [
          {
            id: 'some-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
      };

      const action = syncReceived({
        netWorth: [
          {
            type: RequestType.delete,
            id: SUBCATEGORY_CC.id,
            method: 'delete',
            route: 'net-worth/subcategories',
            res: null,
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toEqual(
        expect.objectContaining({
          categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
          // The dependencies are deleted from the database through foreign key cascading,
          // but we have to update on the frontend to reflect that
          subcategories: [SUBCATEGORY_WALLET, SUBCATEGORY_HOUSE],
          entries: [
            {
              id: 'some-entry-id',
              date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
        }),
      );
    });

    it('should confirm entry creates', () => {
      const state: State = {
        ...initialState,
        categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
        subcategories: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
        entries: [
          {
            id: 'some-fake-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
            __optimistic: RequestType.create,
          },
        ],
      };

      const action = syncReceived({
        netWorth: [
          {
            type: RequestType.create,
            fakeId: 'some-fake-entry-id',
            method: 'post',
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

      expect(result).toEqual(
        expect.objectContaining({
          categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
          subcategories: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
          entries: [
            expect.objectContaining({
              id: 'some-real-entry-id',
              date: DateTime.fromISO('2019-07-12'),
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
              __optimistic: undefined,
            }),
          ],
        }),
      );
    });

    it('should confirm entry updates', () => {
      const state: State = {
        ...initialState,
        categories: [CATEGORY_MORTGAGE, CATEGORY_CASH, CATEGORY_CC],
        subcategories: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
        entries: [
          {
            id: 'some-real-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
            __optimistic: RequestType.update,
          },
        ],
      };

      const action = syncReceived({
        netWorth: [
          {
            type: RequestType.update,
            id: 'some-real-entry-id',
            method: 'put',
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

      expect(result).toEqual(
        expect.objectContaining({
          categories: [CATEGORY_MORTGAGE, CATEGORY_CASH, CATEGORY_CC],
          subcategories: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
          entries: [
            expect.objectContaining({
              id: 'some-real-entry-id',
              date: DateTime.fromISO('2019-07-12'),
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
              __optimistic: undefined,
            }),
          ],
        }),
      );
    });

    it('should confirm entry deletes', () => {
      const state: State = {
        ...initialState,
        categories: [CATEGORY_CC, CATEGORY_CASH],
        subcategories: [SUBCATEGORY_CC, SUBCATEGORY_WALLET],
        entries: [
          {
            id: 'some-real-entry-id',
            date: DateTime.fromISO('2019-07-12T12:36:03Z'),
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
            __optimistic: RequestType.delete,
          },
        ],
      };

      const action = syncReceived({
        netWorth: [
          {
            type: RequestType.delete,
            id: 'some-real-entry-id',
            method: 'delete',
            route: 'net-worth',
            res: null,
          },
        ],
      });

      const result = reducer(state, action);

      expect(result).toEqual(
        expect.objectContaining({
          categories: [CATEGORY_CC, CATEGORY_CASH],
          subcategories: [SUBCATEGORY_CC, SUBCATEGORY_WALLET],
          entries: [],
        }),
      );
    });
  });
});
