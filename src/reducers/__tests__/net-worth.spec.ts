/* eslint-disable max-lines */
import { Category, Subcategory, Entry, NetWorth } from '~/types/net-worth';
import { SocketAction } from '~/types/actions';
import reducer, { State, initialState } from '~/reducers/net-worth';
import testState from '~/__tests__/state';
import {
  netWorthRead,
  netWorthCategoryCreated,
  netWorthCategoryUpdated,
  netWorthCategoryDeleted,
  netWorthSubcategoryCreated,
  netWorthSubcategoryUpdated,
  netWorthSubcategoryDeleted,
  netWorthEntryCreated,
  netWorthEntryUpdated,
  netWorthEntryDeleted,
} from '~/actions/net-worth';
import {
  NET_WORTH_READ,
  NET_WORTH_CATEGORY_CREATED,
  NET_WORTH_CATEGORY_UPDATED,
  NET_WORTH_CATEGORY_DELETED,
  NET_WORTH_SUBCATEGORY_CREATED,
  NET_WORTH_SUBCATEGORY_UPDATED,
  NET_WORTH_SUBCATEGORY_DELETED,
  NET_WORTH_ENTRY_CREATED,
  NET_WORTH_ENTRY_UPDATED,
  NET_WORTH_ENTRY_DELETED,
} from '~/constants/actions.rt';
import { loggedOut } from '~/actions/login';
import { CREATE, UPDATE, DELETE } from '~/constants/crud';

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
  categoryId: CATEGORY_CASH.id || '',
  subcategory: 'My wallet',
  hasCreditLimit: null,
  opacity: 0.2,
};

const SUBCATEGORY_HOUSE: Subcategory = {
  id: 'real-house-subcategory-id',
  categoryId: CATEGORY_MORTGAGE.id || '',
  subcategory: 'My house',
  hasCreditLimit: false,
  opacity: 0.1,
};

const SUBCATEGORY_CC: Subcategory = {
  id: 'real-credit-card-subcategory-id',
  categoryId: CATEGORY_CC.id || '',
  subcategory: 'My credit card',
  hasCreditLimit: true,
  opacity: 0.3,
};

test('LOGGED_OUT resets the state', () => {
  expect.assertions(1);
  expect(reducer(testState.netWorth, loggedOut())).toStrictEqual(initialState);
});

test('NET_WORTH_CATEGORY_CREATED optimistically creates a category', () => {
  expect.assertions(1);
  const action = netWorthCategoryCreated({
    type: 'asset',
    category: 'Cash (easy access)',
    color: '#00ff00',
  });

  const result = reducer(initialState, action);

  expect(result.categories.items).toStrictEqual([
    {
      id: action.payload?.fakeId,
      type: 'asset',
      category: 'Cash (easy access)',
      color: '#00ff00',
      __optimistic: CREATE,
    },
  ]);
});

test('NET_WORTH_CATEGORY_UPDATED optimistically updates a category', () => {
  expect.assertions(1);
  const state: State = {
    ...initialState,
    categories: {
      items: [
        {
          id: 'some-real-id',
          type: 'asset',
          category: 'Cash (easy access)',
          color: '#00ff00',
        },
      ],
    },
  };

  const action = netWorthCategoryUpdated('some-real-id', {
    type: 'liability',
    category: 'Mortgage',
    color: '#fa0000',
  });

  const result = reducer(state, action);

  expect(result.categories.items).toStrictEqual([
    {
      id: 'some-real-id',
      type: 'liability',
      category: 'Mortgage',
      color: '#fa0000',
      __optimistic: UPDATE,
    },
  ]);
});

test('NET_WORTH_CATEGORY_DELETED optimistically deletes a category', () => {
  expect.assertions(1);
  const state: State = {
    ...initialState,
    categories: {
      items: [
        {
          id: 'some-real-id',
          type: 'asset',
          category: 'Cash (easy access)',
          color: '#00ff00',
        },
      ],
    },
  };

  const action = netWorthCategoryDeleted('some-real-id');

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: {
      items: [
        {
          id: 'some-real-id',
          type: 'asset',
          category: 'Cash (easy access)',
          color: '#00ff00',
          __optimistic: DELETE,
        },
      ],
    },
    subcategories: { items: [] },
    entries: { items: [] },
  });
});

/*
test('NET_WORTH_CATEGORY_DELETED deletes a pending category and its dependencies', () => {
  expect.assertions(1);
  const state: State = {
    ...initialState,
    categories: [
      {
        id: 'some-real-id',
        type: 'asset',
        category: 'Cash (easy access)',
        color: '#00ff00',
        __optimistic: CREATE,
      },
      { id: 'other-cat-id', type: 'asset', category: 'Other category' },
    ],
    subcategories: [
      {
        categoryId: 'some-real-id',
        id: 'subcat-A',
        subcategory: 'Some real subcategory',
        hasCreditLimit: null,
        opacity: null,
        __optimistic: CREATE,
      },
      {
        categoryId: 'other-cat-id',
        id: 'subcat-B',
        subcategory: 'Other subcategory',
        hasCreditLimit: null,
        opacity: null,
      },
    ],
    entries: [
      {
        id: 'entry-A0',
        date: new Date('2019-04-03'),
        values: [
          { subcategory: 'subcat-B', skip: null, value: 3 },
          { subcategory: 'subcat-A', skip: false, value: 5 },
        ],
        creditLimit: [],
        currencies: [],
        __optimistic: CREATE,
      },
    ],
  };

  const action = netWorthCategoryDeleted('some-real-id');

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [{ id: 'other-cat-id' }],
    subcategories: [{ categoryId: 'other-cat-id', id: 'subcat-B' }],
    entries: [{ id: 'entry-A0', values: [{ subcategory: 'subcat-B' }], __optimistic: CREATE }],
  });
});

test('NET_WORTH_SUBCATEGORY_CREATED optimistically creates a subcategory', () => {
  expect.assertions(1);
  const state = {
    subcategories: [],
  };

  const action = netWorthSubcategoryCreated({
    categoryId: 'some-category-id',
    subcategory: 'My bank account',
    hasCreditLimit: null,
    opacity: 0.2,
  });

  const result = reducer(state, action);

  expect(result.subcategories).toStrictEqual([
    {
      id: action.payload?.fakeId,
      categoryId: 'some-category-id',
      subcategory: 'My bank account',
      hasCreditLimit: null,
      opacity: 0.2,
      __optimistic: CREATE,
    },
  ]);
});

test('NET_WORTH_SUBCATEGORY_UPDATED optimistically updates a subcategory', () => {
  expect.assertions(1);
  const state = {
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

  const result = reducer(state, action);

  expect(result.subcategories).toStrictEqual([
    {
      id: 'some-subcategory-id',
      categoryId: 'other-category-id',
      subcategory: 'My credit card',
      hasCreditLimit: true,
      opacity: 0.3,
      __optimistic: UPDATE,
    },
  ]);
});

test('NET_WORTH_SUBCATEGORY_DELETED optimistically deletes a subcategory', () => {
  expect.assertions(1);
  const state = {
    categories: [{ id: 'some-category-id' }],
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

  const result = reducer(state, action);

  expect(result.subcategories).toStrictEqual([
    {
      id: 'some-subcategory-id',
      categoryId: 'some-category-id',
      subcategory: 'My bank account',
      hasCreditLimit: null,
      opacity: 0.2,
      __optimistic: DELETE,
    },
  ]);
});

test('NET_WORTH_SUBCATEGORY_DELETED deletes a pending subcategory and its dependencies', () => {
  expect.assertions(1);
  const state = {
    categories: [{ id: 'some-category-id' }],
    subcategories: [
      {
        id: 'some-subcategory-id',
        categoryId: 'some-category-id',
        subcategory: 'My bank account',
        hasCreditLimit: null,
        opacity: 0.2,
        __optimistic: CREATE,
      },
      { id: 'subcat-A', categoryId: 'some-category-id' },
    ],
    entries: [
      {
        id: 'entry-A0',
        values: [{ subcategory: 'some-subcategory-id' }, { subcategory: 'subcat-A' }],
        __optimistic: CREATE,
      },
    ],
  };

  const action = netWorthSubcategoryDeleted('some-subcategory-id');

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [{ id: 'some-category-id' }],
    subcategories: [{ id: 'subcat-A', categoryId: 'some-category-id' }],
    entries: [
      {
        id: 'entry-A0',
        values: [{ subcategory: 'subcat-A' }],
        __optimistic: CREATE,
      },
    ],
  });
});

test('NET_WORTH_ENTRY_CREATED optimistically creates an entry', () => {
  expect.assertions(1);
  const state = {
    entries: [],
  };

  const action = netWorthEntryCreated({
    date: new Date('2019-07-12T12:36:03Z'),
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
    creditLimit: [{ subcategory: 'some-subcategory-id', limit: 1000 }],
    currencies: [{ currency: 'CZK', rate: 0.035 }],
  });

  const result = reducer(state, action);

  expect(result.entries).toStrictEqual([
    {
      id: action.payload?.fakeId,
      date: new Date('2019-07-12T12:36:03Z'),
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
      currencies: [{ currency: 'CZK', rate: 0.035 }],
      __optimistic: CREATE,
    },
  ]);
});

test('NET_WORTH_ENTRY_UPDATED optimistically updates an entry', () => {
  expect.assertions(1);
  const state = {
    entries: [
      {
        id: 'some-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
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
        currencies: [{ currency: 'CZK', rate: 0.035 }],
      },
    ],
  };

  const action = netWorthEntryUpdated('some-entry-id', {
    date: new Date('2019-07-31T23:54:00Z'),
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

  const result = reducer(state, action);

  expect(result.entries).toStrictEqual([
    {
      id: 'some-entry-id',
      date: new Date('2019-07-31T23:54:00Z'),
      values: [
        {
          subcategory: 'some-subcategory-id',
          skip: true,
          value: -239,
        },
      ],
      creditLimit: [],
      currencies: [],
      __optimistic: UPDATE,
    },
  ]);
});

test('NET_WORTH_ENTRY_DELETED optimistically deletes an entry', () => {
  expect.assertions(1);
  const state = {
    entries: [
      {
        id: 'some-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
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
        currencies: [{ currency: 'CZK', rate: 0.035 }],
      },
    ],
  };

  const action = netWorthEntryDeleted('some-entry-id');

  const result = reducer(state, action);

  expect(result.entries).toStrictEqual([
    {
      id: 'some-entry-id',
      date: new Date('2019-07-12T12:36:03Z'),
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
      currencies: [{ currency: 'CZK', rate: 0.035 }],
      __optimistic: DELETE,
    },
  ]);
});

test('NET_WORTH_READ sets loading to true', () => {
  expect.assertions(1);
  const action = netWorthRead();

  const result = reducer(initialState, action);

  expect(result.loading).toBe(true);
});

test('NET_WORTH_READ inserts data into the state', () => {
  expect.assertions(1);
  const state = {
    ...initialState,
    loading: true,
  };

  const action: SocketAction<NetWorth> = {
    type: NET_WORTH_READ,
    __FROM_SOCKET__: true,
    payload: {
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
          creditLimit: [{ subcategory: 'some-subcategory-id', limit: 1000 }],
          currencies: [{ currency: 'CZK', rate: 0.035 }],
        },
      ],
    },
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    ...state,
    loading: false,
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
        date: new Date('2019-07-12'),
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
        currencies: [{ currency: 'CZK', rate: 0.035 }],
      },
    ],
  });
});

test('NET_WORTH_CATEGORY_CREATED confirms category creates, updating any dependencies', () => {
  expect.assertions(1);
  const state: State = {
    ...initialState,
    categories: [
      CATEGORY_CASH,
      {
        ...CATEGORY_CC,
        id: 'some-fake-category-id',
        __optimistic: CREATE,
      },
    ],
    subcategories: [
      SUBCATEGORY_WALLET,
      {
        ...SUBCATEGORY_CC,
        id: 'some-fake-subcategory-id',
        categoryId: 'some-fake-category-id',
        __optimistic: CREATE,
      },
    ],
    entries: [
      {
        id: 'some-fake-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
        values: [
          {
            subcategory: 'some-fake-subcategory-id',
            skip: true,
            value: -239,
          },
          {
            subcategory: SUBCATEGORY_WALLET.id || '',
            skip: null,
            value: [10, { currency: 'CZK', value: 37.34 }],
          },
        ],
        creditLimit: [{ subcategory: 'some-fake-subcategory-id', limit: 1000 }],
        currencies: [{ currency: 'CZK', rate: 0.035 }],
        __optimistic: CREATE,
      },
    ],
  };

  const action: SocketAction<Category & { fakeId?: string }> = {
    type: NET_WORTH_CATEGORY_CREATED,
    __FROM_SOCKET__: true,
    payload: {
      ...CATEGORY_CC,
      fakeId: 'some-fake-category-id',
    },
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [CATEGORY_CASH, { ...CATEGORY_CC, __optimistic: null }],
    subcategories: [
      SUBCATEGORY_WALLET,
      {
        ...SUBCATEGORY_CC,
        // the subcategory can only be created after its category is confirmed
        id: 'some-fake-subcategory-id',
        __optimistic: CREATE,
      },
    ],
    entries: [
      {
        id: 'some-fake-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
        values: [
          {
            subcategory: 'some-fake-subcategory-id',
            skip: true,
            value: -239,
          },
          {
            subcategory: SUBCATEGORY_WALLET.id,
            skip: null,
            value: [10, { currency: 'CZK', value: 37.34 }],
          },
        ],
        creditLimit: [{ subcategory: 'some-fake-subcategory-id', value: 1000 }],
        currencies: [{ currency: 'CZK', rate: 0.035 }],
        // the entry can only be created after its subcategories are confirmed
        __optimistic: CREATE,
      },
    ],
  });
});

test('NET_WORTH_CATEGORY_UPDATED confirms category updates', () => {
  expect.assertions(1);
  const state = {
    categories: [
      {
        ...CATEGORY_CC,
        __optimistic: UPDATE,
      },
    ],
    subcategories: [],
    entries: [],
  };

  const action: SocketAction<Category & { fakeId?: string }> = {
    type: NET_WORTH_CATEGORY_UPDATED,
    __FROM_SOCKET__: true,
    payload: {
      id: CATEGORY_CC.id,
      type: 'asset',
      category: 'This is now an asset group',
      color: '#00aa00',
    },
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [
      {
        id: CATEGORY_CC.id,
        type: 'asset',
        category: 'This is now an asset group',
        color: '#00aa00',
        __optimistic: null,
      },
    ],
    subcategories: [],
    entries: [],
  });
});

test('NET_WORTH_CATEGORY_DELETED confirms category deletes, removing any dependencies', () => {
  expect.assertions(1);
  const state = {
    categories: [
      {
        ...CATEGORY_CC,
        __optimistic: DELETE,
      },
      CATEGORY_CASH,
    ],
    subcategories: [SUBCATEGORY_CC, SUBCATEGORY_WALLET],
    entries: [
      {
        id: 'some-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
        values: [
          {
            subcategory: SUBCATEGORY_CC.id,
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
        currencies: [{ currency: 'CZK', rate: 0.035 }],
      },
    ],
  };

  const action: SocketAction<string> = {
    type: NET_WORTH_CATEGORY_DELETED,
    __FROM_SOCKET__: true,
    payload: CATEGORY_CC.id,
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [CATEGORY_CASH],
    // The dependencies are deleted from the database through foreign key cascading,
    // but we have to update on the frontend to reflect that
    subcategories: [SUBCATEGORY_WALLET],
    entries: [
      {
        id: 'some-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
        values: [
          {
            subcategory: SUBCATEGORY_WALLET.id,
            skip: null,
            value: [10, { currency: 'CZK', value: 37.34 }],
          },
        ],
        creditLimit: [],
        currencies: [{ currency: 'CZK', rate: 0.035 }],
      },
    ],
  });
});

test('NET_WORTH_SUBCATEGORY_CREATED confirms subcategory creates, updating any dependencies', () => {
  expect.assertions(1);
  const state = {
    categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
    subcategories: [
      SUBCATEGORY_HOUSE,
      SUBCATEGORY_WALLET,
      {
        ...SUBCATEGORY_CC,
        id: 'some-fake-subcategory-id',
        __optimistic: CREATE,
      },
    ],
    entries: [
      {
        id: 'some-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
        values: [
          {
            subcategory: 'some-fake-subcategory-id',
            skip: true,
            value: -239,
          },
          {
            subcategory: SUBCATEGORY_WALLET.id,
            skip: null,
            value: [10, { currency: 'CZK', value: 37.34 }],
          },
        ],
        creditLimit: [{ subcategory: 'some-fake-subcategory-id', value: 1000 }],
        currencies: [{ currency: 'CZK', rate: 0.035 }],
        __optimistic: CREATE,
      },
    ],
  };

  const action: SocketAction<Subcategory & { fakeId?: string }> = {
    type: NET_WORTH_SUBCATEGORY_CREATED,
    __FROM_SOCKET__: true,
    payload: {
      fakeId: 'some-fake-subcategory-id',
      categoryId: CATEGORY_CC.id || '',
      subcategory: 'My credit card',
      hasCreditLimit: true,
      opacity: 0.2,
    },
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
    subcategories: [
      SUBCATEGORY_HOUSE,
      SUBCATEGORY_WALLET,
      {
        ...SUBCATEGORY_CC,
        __optimistic: null,
      },
    ],
    entries: [
      {
        id: 'some-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
        values: [
          {
            subcategory: SUBCATEGORY_CC.id,
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
        currencies: [{ currency: 'CZK', rate: 0.035 }],
        __optimistic: CREATE,
      },
    ],
  });
});

test('NET_WORTH_SUBCATEGORY_UPDATED confirms subcategory updates', () => {
  expect.assertions(1);
  const state = {
    categories: [CATEGORY_MORTGAGE],
    subcategories: [
      {
        ...SUBCATEGORY_HOUSE,
        __optimistic: UPDATE,
      },
    ],
    entries: [],
  };

  const action: SocketAction<Subcategory & { fakeId?: string }> = {
    type: NET_WORTH_SUBCATEGORY_UPDATED,
    __FROM_SOCKET__: true,
    payload: {
      categoryId: CATEGORY_MORTGAGE.id || '',
      subcategory: 'My house',
      hasCreditLimit: false,
      opacity: 0.2,
    },
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [CATEGORY_MORTGAGE],
    subcategories: [
      {
        ...SUBCATEGORY_HOUSE,
        __optimistic: null,
      },
    ],
    entries: [],
  });
});

test('NET_WORTH_SUBCATEGORY_DELETED confirms subcategory deletes, removing any dependencies', () => {
  expect.assertions(1);
  const state = {
    categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
    subcategories: [
      SUBCATEGORY_WALLET,
      SUBCATEGORY_HOUSE,
      {
        ...SUBCATEGORY_CC,
        __optimistic: DELETE,
      },
    ],
    entries: [
      {
        id: 'some-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
        values: [
          {
            subcategory: SUBCATEGORY_CC.id,
            skip: false,
            value: -239,
          },
          {
            subcategory: SUBCATEGORY_WALLET.id,
            skip: null,
            value: [10, { currency: 'CZK', value: 37.34 }],
          },
        ],
        creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
        currencies: [{ currency: 'CZK', rate: 0.035 }],
      },
    ],
  };

  const action: SocketAction<string> = {
    type: NET_WORTH_CATEGORY_DELETED,
    __FROM_SOCKET__: true,
    payload: SUBCATEGORY_CC.id,
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
    // The dependencies are deleted from the database through foreign key cascading,
    // but we have to update on the frontend to reflect that
    subcategories: [SUBCATEGORY_WALLET, SUBCATEGORY_HOUSE],
    entries: [
      {
        id: 'some-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
        values: [
          {
            subcategory: SUBCATEGORY_WALLET.id,
            skip: null,
            value: [10, { currency: 'CZK', value: 37.34 }],
          },
        ],
        creditLimit: [],
        currencies: [{ currency: 'CZK', rate: 0.035 }],
      },
    ],
  });
});

test('NET_WORTH_ENTRY_CREATED confirms entry creates', () => {
  expect.assertions(1);
  const state = {
    categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
    subcategories: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
    entries: [
      {
        id: 'some-fake-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
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
        currencies: [{ currency: 'CZK', rate: 0.035 }],
        __optimistic: CREATE,
      },
    ],
  };

  const action: SocketAction<Entry & { fakeId?: string }> = {
    type: NET_WORTH_ENTRY_CREATED,
    __FROM_SOCKET__: true,
    payload: {
      fakeId: 'some-fake-entry-id',
      id: 'some-real-entry-id',
      date: '2019-07-12',
      values: [
        {
          subcategory: SUBCATEGORY_HOUSE.id || '',
          skip: true,
          value: -239,
        },
        {
          subcategory: SUBCATEGORY_WALLET.id || '',
          skip: null,
          value: [10, { currency: 'CZK', value: 37.34 }],
        },
      ],
      creditLimit: [{ subcategory: SUBCATEGORY_CC.id || '', limit: 1000 }],
      currencies: [{ currency: 'CZK', rate: 0.035 }],
    },
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [CATEGORY_MORTGAGE, CATEGORY_CC, CATEGORY_CASH],
    subcategories: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
    entries: [
      {
        id: 'some-real-entry-id',
        date: new Date('2019-07-12'),
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
        currencies: [{ currency: 'CZK', rate: 0.035 }],
        __optimistic: null,
      },
    ],
  });
});

test('NET_WORTH_ENTRY_UPDATED confirms entry updates', () => {
  expect.assertions(1);
  const state = {
    categories: [CATEGORY_MORTGAGE, CATEGORY_CASH, CATEGORY_CC],
    subcategories: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
    entries: [
      {
        id: 'some-real-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
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
        currencies: [{ currency: 'CZK', rate: 0.035 }],
        __optimistic: UPDATE,
      },
    ],
  };

  const action: SocketAction<Entry & { fakeId?: string }> = {
    type: NET_WORTH_ENTRY_UPDATED,
    __FROM_SOCKET__: true,
    payload: {
      id: 'some-real-entry-id',
      date: '2019-07-12',
      values: [
        {
          subcategory: SUBCATEGORY_HOUSE.id || '',
          skip: true,
          value: -239,
        },
        {
          subcategory: SUBCATEGORY_WALLET.id || '',
          skip: null,
          value: [10, { currency: 'CZK', value: 37.34 }],
        },
      ],
      creditLimit: [{ subcategory: SUBCATEGORY_CC.id || '', limit: 1000 }],
      currencies: [{ currency: 'CZK', rate: 0.035 }],
    },
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [CATEGORY_MORTGAGE, CATEGORY_CASH, CATEGORY_CC],
    subcategories: [SUBCATEGORY_HOUSE, SUBCATEGORY_CC, SUBCATEGORY_WALLET],
    entries: [
      {
        id: 'some-real-entry-id',
        date: new Date('2019-07-12'),
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
        currencies: [{ currency: 'CZK', rate: 0.035 }],
        __optimistic: null,
      },
    ],
  });
});

test('NET_WORTH_ENTRY_DELETED confirms entry deletes', () => {
  expect.assertions(1);
  const state = {
    categories: [CATEGORY_CC, CATEGORY_CASH],
    subcategories: [SUBCATEGORY_CC, SUBCATEGORY_WALLET],
    entries: [
      {
        id: 'some-real-entry-id',
        date: new Date('2019-07-12T12:36:03Z'),
        values: [
          {
            subcategory: SUBCATEGORY_CC.id,
            skip: false,
            value: -239,
          },
          {
            subcategory: SUBCATEGORY_WALLET.id,
            skip: null,
            value: [10, { currency: 'CZK', value: 37.34 }],
          },
        ],
        creditLimit: [{ subcategory: SUBCATEGORY_CC.id, value: 1000 }],
        currencies: [{ currency: 'CZK', rate: 0.035 }],
        __optimistic: DELETE,
      },
    ],
  };

  const action: SocketAction<string> = {
    type: NET_WORTH_ENTRY_DELETED,
    __FROM_SOCKET__: true,
    payload: 'some-real-entry-id',
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    categories: [CATEGORY_CC, CATEGORY_CASH],
    subcategories: [SUBCATEGORY_CC, SUBCATEGORY_WALLET],
    entries: [],
  });
});
*/
