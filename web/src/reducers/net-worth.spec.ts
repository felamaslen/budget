/* eslint-disable max-lines */
import numericHash from 'string-hash';
import reducer, { State, initialState } from './net-worth';
import {
  dataRead,
  loggedOut,
  ActionTypeLogin,
  ActionTypeNetWorth,
  ActionTypeApi,
} from '~client/actions';
import {
  netWorthCategoryCreated,
  netWorthCategoryUpdated,
  netWorthCategoryDeleted,
  netWorthSubcategoryCreated,
  netWorthSubcategoryUpdated,
  netWorthSubcategoryDeleted,
  netWorthEntryCreated,
  netWorthEntryUpdated,
  netWorthEntryDeleted,
} from '~client/actions/net-worth';
import { testResponse, CURRENCY_CZK, SUBCATEGORY_WALLET } from '~client/test-data';
import {
  NetWorthCategory as Category,
  NetWorthCategoryType,
  NetWorthEntryNative as Entry,
  NetWorthSubcategory as Subcategory,
  NetWorthValueObject,
  NetWorthValueObjectRead,
} from '~client/types';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('Net worth reducer', () => {
  describe.each`
    description                  | action
    ${ActionTypeLogin.LoggedOut} | ${loggedOut()}
  `('$description', ({ action }) => {
    it('should return the initial state', () => {
      expect.assertions(1);
      expect(reducer(undefined, action)).toStrictEqual<State>(initialState);
    });
  });

  describe(ActionTypeNetWorth.CategoryCreated, () => {
    const action = netWorthCategoryCreated({
      id: numericHash('some-real-id'),
      type: NetWorthCategoryType.Asset,
      category: 'Cash (easy access)',
      color: '#00ff00',
      isOption: false,
    });

    it('should create a category', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.categories).toStrictEqual<State['categories']>([
        {
          id: numericHash('some-real-id'),
          type: NetWorthCategoryType.Asset,
          category: 'Cash (easy access)',
          color: '#00ff00',
          isOption: false,
        },
      ]);
    });
  });

  describe(ActionTypeNetWorth.CategoryUpdated, () => {
    const state: State = {
      ...initialState,
      categories: [
        {
          id: numericHash('some-real-id'),
          type: NetWorthCategoryType.Asset,
          category: 'Cash (easy access)',
          color: '#00ff00',
          isOption: false,
        },
      ],
    };

    const action = netWorthCategoryUpdated({
      id: numericHash('some-real-id'),
      type: NetWorthCategoryType.Liability,
      category: 'Mortgage',
      color: '#fa0000',
      isOption: false,
    });

    it('should update a category', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result.categories).toStrictEqual<State['categories']>([
        {
          id: numericHash('some-real-id'),
          type: NetWorthCategoryType.Liability,
          category: 'Mortgage',
          color: '#fa0000',
          isOption: false,
        },
      ]);
    });
  });

  describe(ActionTypeNetWorth.CategoryDeleted, () => {
    const state: State = {
      ...initialState,
      categories: [
        {
          id: numericHash('some-real-id'),
          type: NetWorthCategoryType.Asset,
          category: 'Cash (easy access)',
          color: '#00ff00',
          isOption: false,
        },
      ],
      subcategories: [],
      entries: [],
    };

    const action = netWorthCategoryDeleted(numericHash('some-real-id'));

    it('should delete a category', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result).toStrictEqual<State>(
        expect.objectContaining({
          categories: [],
          subcategories: [],
          entries: [],
        }),
      );
    });

    it('should delete a pending category and its dependencies', () => {
      expect.assertions(1);
      const otherCategory: Category = {
        id: numericHash('other-cat-id'),
        type: NetWorthCategoryType.Liability,
        category: 'Some liability',
        color: 'red',
        isOption: false,
      };
      const otherSubcategory: Subcategory = {
        id: numericHash('subcat-B'),
        subcategory: 'other-subcategory',
        categoryId: numericHash('other-cat-id'),
        hasCreditLimit: null,
        opacity: 1,
      };

      const statePendingChildren: State = {
        ...state,
        categories: [
          {
            id: numericHash('some-real-id'),
            type: NetWorthCategoryType.Asset,
            category: 'Cash (easy access)',
            color: '#00ff00',
            isOption: false,
          },
          otherCategory,
        ],
        subcategories: [
          {
            id: numericHash('subcat-A'),
            subcategory: 'some-subcategory',
            categoryId: numericHash('some-real-id'),
            hasCreditLimit: null,
            opacity: 1,
          },
          otherSubcategory,
        ],
        entries: [
          {
            id: numericHash('entry-A0'),
            date: new Date(),
            values: [
              { subcategory: numericHash('subcat-B'), simple: 3 },
              { subcategory: numericHash('subcat-A'), simple: 4 },
            ],
            currencies: [],
            creditLimit: [],
          },
        ],
      };

      const result = reducer(statePendingChildren, action);

      expect(result).toStrictEqual<State>(
        expect.objectContaining({
          categories: [otherCategory],
          subcategories: [otherSubcategory],
          entries: [
            expect.objectContaining<Partial<Entry>>({
              id: numericHash('entry-A0'),
              values: [
                {
                  subcategory: numericHash('subcat-B'),
                  simple: 3,
                },
              ],
            }),
          ],
        }),
      );
    });
  });

  describe(ActionTypeNetWorth.SubcategoryCreated, () => {
    const action = netWorthSubcategoryCreated({
      id: numericHash('some-subcategory-id'),
      categoryId: numericHash('some-category-id'),
      subcategory: 'My bank account',
      hasCreditLimit: null,
      opacity: 0.2,
    });

    it('should create a subcategory', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.subcategories).toStrictEqual<State['subcategories']>([
        {
          id: numericHash('some-subcategory-id'),
          categoryId: numericHash('some-category-id'),
          subcategory: 'My bank account',
          hasCreditLimit: null,
          opacity: 0.2,
        },
      ]);
    });
  });

  describe(ActionTypeNetWorth.SubcategoryUpdated, () => {
    const state: State = {
      ...initialState,
      subcategories: [
        {
          id: numericHash('some-subcategory-id'),
          categoryId: numericHash('some-category-id'),
          subcategory: 'My bank account',
          hasCreditLimit: null,
          opacity: 0.2,
        },
      ],
    };

    const action = netWorthSubcategoryUpdated({
      id: numericHash('some-subcategory-id'),
      categoryId: numericHash('other-category-id'),
      subcategory: 'My credit card',
      hasCreditLimit: true,
      opacity: 0.3,
    });

    it('should update a subcategory', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result.subcategories).toStrictEqual<State['subcategories']>([
        {
          id: numericHash('some-subcategory-id'),
          categoryId: numericHash('other-category-id'),
          subcategory: 'My credit card',
          hasCreditLimit: true,
          opacity: 0.3,
        },
      ]);
    });
  });

  describe(ActionTypeNetWorth.SubcategoryDeleted, () => {
    const state: State = {
      ...initialState,
      categories: [
        {
          id: numericHash('some-category-id'),
          category: 'some-category',
          type: NetWorthCategoryType.Asset,
          color: 'green',
          isOption: false,
        },
      ],
      subcategories: [
        {
          id: numericHash('some-subcategory-id'),
          categoryId: numericHash('some-category-id'),
          subcategory: 'My bank account',
          hasCreditLimit: null,
          opacity: 0.2,
        },
      ],
      entries: [],
    };

    const action = netWorthSubcategoryDeleted(numericHash('some-subcategory-id'));

    it('should delete a subcategory', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result.subcategories).toHaveLength(0);
    });

    it('should delete a pending subcategory and its dependencies', () => {
      expect.assertions(1);
      const statePendingChildren: State = {
        ...state,
        subcategories: [
          {
            id: numericHash('some-subcategory-id'),
            categoryId: numericHash('some-category-id'),
            subcategory: 'My bank account',
            hasCreditLimit: null,
            opacity: 0.2,
          },
          {
            ...SUBCATEGORY_WALLET,
            id: numericHash('subcat-A'),
            categoryId: numericHash('some-category-id'),
          },
        ],
        entries: [
          {
            id: numericHash('entry-A0'),
            date: new Date(),
            values: [
              {
                simple: 1,
                subcategory: numericHash('some-subcategory-id'),
              },
              { simple: 1, subcategory: numericHash('subcat-A') },
            ],
            currencies: [],
            creditLimit: [],
          },
        ],
      };

      const result = reducer(statePendingChildren, action);

      expect(result).toStrictEqual<State>(
        expect.objectContaining<Partial<State>>({
          categories: statePendingChildren.categories,
          subcategories: [
            {
              ...SUBCATEGORY_WALLET,
              id: numericHash('subcat-A'),
              categoryId: numericHash('some-category-id'),
            },
          ],
          entries: [
            expect.objectContaining<Partial<Entry>>({
              id: numericHash('entry-A0'),
              values: [{ simple: 1, subcategory: numericHash('subcat-A') }],
            }),
          ],
        }),
      );
    });
  });

  describe(ActionTypeNetWorth.EntryCreated, () => {
    const action = netWorthEntryCreated({
      __typename: 'NetWorthEntry',
      id: numericHash('some-entry-id'),
      date: '2019-07-12T12:36:03Z',
      values: [
        {
          __typename: 'NetWorthValueObject',
          subcategory: numericHash('some-subcategory-id'),
          skip: true,
          simple: -239,
          fx: null,
          option: null,
          mortgage: null,
        },
        {
          __typename: 'NetWorthValueObject',
          subcategory: numericHash('other-subcategory-id'),
          skip: null,
          simple: 10,
          fx: [{ __typename: 'FXValue', currency: 'CZK', value: 37.34 }],
          option: null,
          mortgage: null,
        },
      ],
      creditLimit: [
        { __typename: 'CreditLimit', subcategory: numericHash('some-subcategory-id'), value: 1000 },
      ],
      currencies: [{ ...CURRENCY_CZK, __typename: 'Currency' }],
    });

    it('should create an entry', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.entries).toStrictEqual<State['entries']>([
        {
          id: numericHash('some-entry-id'),
          date: new Date('2019-07-12T12:36:03Z'),
          values: [
            {
              subcategory: numericHash('some-subcategory-id'),
              skip: true,
              simple: -239,
              fx: null,
              option: null,
              mortgage: null,
            },
            {
              subcategory: numericHash('other-subcategory-id'),
              skip: null,
              simple: 10,
              fx: [{ currency: 'CZK', value: 37.34 }],
              option: null,
              mortgage: null,
            },
          ],
          creditLimit: [{ subcategory: numericHash('some-subcategory-id'), value: 1000 }],
          currencies: [CURRENCY_CZK],
        },
      ]);
    });
  });

  describe(ActionTypeNetWorth.EntryUpdated, () => {
    const state: State = {
      ...initialState,
      entries: [
        {
          id: numericHash('some-entry-id'),
          date: new Date('2019-07-12T12:36:03Z'),
          values: [
            {
              subcategory: numericHash('some-subcategory-id'),
              skip: true,
              simple: -239,
            },
            {
              subcategory: numericHash('other-subcategory-id'),
              skip: null,
              fx: [{ currency: 'CZK', value: 37.34 }],
            },
          ],
          creditLimit: [{ subcategory: numericHash('some-subcategory-id'), value: 1000 }],
          currencies: [CURRENCY_CZK],
        },
      ],
    };

    const action = netWorthEntryUpdated({
      __typename: 'NetWorthEntry',
      id: numericHash('some-entry-id'),
      date: '2019-07-31T23:54:00Z',
      values: [
        {
          __typename: 'NetWorthValueObject',
          subcategory: numericHash('some-subcategory-id'),
          skip: true,
          simple: -239,
          fx: null,
          option: null,
          mortgage: null,
        },
      ],
      creditLimit: [],
      currencies: [],
    });

    it('should update an entry', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result.entries).toStrictEqual<State['entries']>([
        {
          id: numericHash('some-entry-id'),
          date: new Date('2019-07-31T23:54:00Z'),
          values: [
            {
              subcategory: numericHash('some-subcategory-id'),
              skip: true,
              simple: -239,
              fx: null,
              option: null,
              mortgage: null,
            },
          ],
          creditLimit: [],
          currencies: [],
        },
      ]);
    });
  });

  describe(ActionTypeNetWorth.EntryDeleted, () => {
    const state: State = {
      ...initialState,
      entries: [
        {
          id: numericHash('some-entry-id'),
          date: new Date('2019-07-12T12:36:03Z'),
          values: [
            {
              subcategory: numericHash('some-subcategory-id'),
              skip: true,
              simple: -239,
            },
            {
              subcategory: numericHash('other-subcategory-id'),
              skip: null,
              simple: 10,
              fx: [{ currency: 'CZK', value: 37.34 }],
            },
          ],
          creditLimit: [{ subcategory: numericHash('some-subcategory-id'), value: 1000 }],
          currencies: [CURRENCY_CZK],
        },
      ],
    };

    const action = netWorthEntryDeleted(numericHash('some-entry-id'));

    it('should delete an entry', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result.entries).toHaveLength(0);
    });
  });

  describe(ActionTypeApi.DataRead, () => {
    const action = dataRead({
      ...testResponse,
      netWorthCategories: [
        {
          __typename: 'NetWorthCategory',
          id: numericHash('some-category-id'),
          type: NetWorthCategoryType.Asset,
          category: 'Cash (easy access)',
          color: '#00ff00',
          isOption: false,
        },
      ],
      netWorthSubcategories: [
        {
          __typename: 'NetWorthSubcategory',
          id: numericHash('some-subcategory-id'),
          categoryId: numericHash('some-category-id'),
          subcategory: 'My bank account',
          hasCreditLimit: null,
          opacity: 0.2,
        },
      ],
      netWorthEntries: {
        current: [
          {
            __typename: 'NetWorthEntry',
            id: numericHash('some-entry-id'),
            date: '2019-07-12',
            values: [
              {
                __typename: 'NetWorthValueObject',
                subcategory: numericHash('some-subcategory-id'),
                skip: true,
                simple: -239,
              },
              {
                __typename: 'NetWorthValueObject',
                subcategory: numericHash('other-subcategory-id'),
                skip: null,
                simple: 10,
                fx: [{ currency: 'CZK', value: 37.34 }],
              },
            ],
            creditLimit: [
              {
                __typename: 'CreditLimit',
                subcategory: numericHash('some-subcategory-id'),
                value: 1000,
              },
            ],
            currencies: [{ ...CURRENCY_CZK, __typename: 'Currency' }],
          },
        ],
        old: [145, 210],
        oldOptions: [1330, 19],
      },
    });

    it('should insert data into the state', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result).toStrictEqual<State>(
        expect.objectContaining<Partial<State>>({
          categories: [
            {
              id: numericHash('some-category-id'),
              type: NetWorthCategoryType.Asset,
              category: 'Cash (easy access)',
              color: '#00ff00',
              isOption: false,
            },
          ],
          subcategories: [
            {
              id: numericHash('some-subcategory-id'),
              categoryId: numericHash('some-category-id'),
              subcategory: 'My bank account',
              hasCreditLimit: null,
              opacity: 0.2,
            },
          ],
          entries: [
            {
              id: numericHash('some-entry-id'),
              date: new Date('2019-07-12'),
              values: expect.arrayContaining<NetWorthValueObjectRead>([
                {
                  subcategory: numericHash('some-subcategory-id'),
                  skip: true,
                  simple: -239,
                  fx: null,
                  option: null,
                  mortgage: null,
                },
                {
                  subcategory: numericHash('other-subcategory-id'),
                  skip: null,
                  simple: 10,
                  fx: [{ currency: 'CZK', value: 37.34 }],
                  option: null,
                  mortgage: null,
                },
              ]),
              creditLimit: [{ subcategory: numericHash('some-subcategory-id'), value: 1000 }],
              currencies: [CURRENCY_CZK],
            },
          ],
          old: [145, 210],
          oldOptions: [1330, 19],
        }),
      );
    });

    it('should set default empty arrays for missing items', () => {
      expect.assertions(1);
      const actionMissing = dataRead({
        ...testResponse,
        netWorthEntries: {
          current: [
            {
              id: numericHash('some-entry-id'),
              date: '2019-07-12',
              values: [
                {
                  subcategory: numericHash('some-subcategory-id'),
                  skip: true,
                  simple: -239,
                },
              ],
              creditLimit: [],
              currencies: [],
            },
          ],
          old: [],
          oldOptions: [],
        },
      });

      const result = reducer(initialState, actionMissing);

      expect(result).toStrictEqual<State>(
        expect.objectContaining<Partial<State>>({
          categories: [],
          subcategories: [],
          entries: [
            {
              id: numericHash('some-entry-id'),
              date: new Date('2019-07-12'),
              values: [
                {
                  subcategory: numericHash('some-subcategory-id'),
                  skip: true,
                  simple: -239,
                  fx: null,
                  option: null,
                  mortgage: null,
                },
              ],
              creditLimit: [],
              currencies: [],
            },
          ],
          old: [],
          oldOptions: [],
        }),
      );
    });

    it('should order the values by subcategory ID', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result).toStrictEqual<State>(
        expect.objectContaining<Partial<State>>({
          entries: expect.objectContaining<Partial<State['entries']>>([
            expect.objectContaining({
              id: numericHash('some-entry-id'),
              values: [
                expect.objectContaining<Partial<NetWorthValueObject>>({
                  subcategory: numericHash('some-subcategory-id'),
                }),
                expect.objectContaining<Partial<NetWorthValueObject>>({
                  subcategory: numericHash('other-subcategory-id'),
                }),
              ],
            }),
          ]),
        }),
      );
    });
  });
});
