import state from '~/__tests__/state';

import {
  getCategories,
  getSubcategories,
  getNetWorthSummary,
  getNetWorthSummaryOld,
  getAggregates,
  getSpendingColumn,
  getNetWorthTable,
} from '~/selectors/overview/net-worth';

import { Entry } from '~/types/net-worth';
import { getNumMonths } from '~/selectors/overview/common';
import { replaceAtIndex } from '~/modules/array';
import { DELETE } from '~/constants/crud';

test('getCategories excludes optimistically deleted items', () => {
  expect.assertions(1);
  expect(
    getCategories({
      ...state,
      netWorth: {
        ...state.netWorth,
        categories: {
          items: [
            {
              id: 'id-a',
              type: 'asset',
              category: 'Some category',
              __optimistic: DELETE,
            },
            {
              id: 'id-b',
              type: 'liability',
              category: 'Other category',
            },
          ],
        },
      },
    }),
  ).toStrictEqual([
    {
      id: 'id-b',
      type: 'liability',
      category: 'Other category',
    },
  ]);
});

test('getCategories sorts by type, then category', () => {
  expect.assertions(1);
  expect(
    getCategories({
      ...state,
      netWorth: {
        ...state.netWorth,
        categories: {
          items: [
            { id: 'id-a', type: 'asset', category: 'foo' },
            { id: 'id-b', type: 'liability', category: 'bar' },
            { id: 'id-c', type: 'asset', category: 'baz' },
            { id: 'id-d', type: 'asset', category: 'bak' },
          ],
        },
      },
    }),
  ).toStrictEqual([
    { id: 'id-d', type: 'asset', category: 'bak' },
    { id: 'id-c', type: 'asset', category: 'baz' },
    { id: 'id-a', type: 'asset', category: 'foo' },
    { id: 'id-b', type: 'liability', category: 'bar' },
  ]);
});

test('getSubcategories excludes optimistically deleted items', () => {
  expect.assertions(1);
  expect(
    getSubcategories({
      ...state,
      netWorth: {
        categories: { items: [{ id: 'cid-a', type: 'asset', category: 'foo' }] },
        subcategories: {
          items: [
            {
              id: 'id-a',
              categoryId: 'cid-a',
              subcategory: 'Some subcategory',
              hasCreditLimit: null,
              opacity: 1,
              __optimistic: DELETE,
            },
            {
              id: 'id-b',
              categoryId: 'cid-a',
              subcategory: 'Other subcategory',
              hasCreditLimit: null,
              opacity: 0.7,
            },
          ],
        },
        entries: { items: [] },
      },
    }),
  ).toStrictEqual([
    {
      id: 'id-b',
      categoryId: 'cid-a',
      subcategory: 'Other subcategory',
      hasCreditLimit: null,
      opacity: 0.7,
    },
  ]);
});

test('getSubcategories sorts by category ID and subcategory', () => {
  expect.assertions(1);
  expect(
    getSubcategories({
      ...state,
      netWorth: {
        categories: {
          items: [
            { id: 'cat-id-1', type: 'asset', category: 'Cfoo' },
            { id: 'cat-id-2', type: 'liability', category: 'Cbar' },
          ],
        },
        subcategories: {
          items: [
            {
              id: 'id-a',
              categoryId: 'cat-id-2',
              subcategory: 'foo',
              hasCreditLimit: false,
              opacity: 1,
            },
            {
              id: 'id-b',
              categoryId: 'cat-id-1',
              subcategory: 'bar',
              hasCreditLimit: null,
              opacity: 1,
            },
            {
              id: 'id-c',
              categoryId: 'cat-id-2',
              subcategory: 'baz',
              hasCreditLimit: true,
              opacity: 1,
            },
          ],
        },
        entries: { items: [] },
      },
    }),
  ).toStrictEqual([
    { id: 'id-b', categoryId: 'cat-id-1', subcategory: 'bar', hasCreditLimit: null, opacity: 1 },
    { id: 'id-c', categoryId: 'cat-id-2', subcategory: 'baz', hasCreditLimit: true, opacity: 1 },
    { id: 'id-a', categoryId: 'cat-id-2', subcategory: 'foo', hasCreditLimit: false, opacity: 1 },
  ]);
});

test('getNetWorthSummary gets a list of net worth values by month', () => {
  expect.assertions(7);
  const result = getNetWorthSummary(state);

  expect(result).toHaveLength(getNumMonths(state));

  expect(result[0]).toBe(10324 + 0.035 * 3750 + 1296523 - 8751);
  expect(result[1]).toBe(9752 + 1051343 - 21939);
  expect(result[2]).toBe(0); // March 2018 doesn't have any entries
  expect(result[3]).toBe(0); // April 2018 "
  expect(result[4]).toBe(0); // May 2018 "
  expect(result[5]).toBe(0); // June 2018 "
});

test('getNetWorthSummary excludes optimistically deleted entries', () => {
  expect.assertions(7);
  const result = getNetWorthSummary({
    ...state,
    netWorth: {
      ...state.netWorth,
      entries: {
        items: replaceAtIndex<Entry>(state.netWorth.entries.items, 1, (entry: Entry): Entry & {
          __optimistic: string;
        } => ({ ...entry, __optimistic: DELETE })),
      },
    },
  });

  expect(result).toHaveLength(getNumMonths(state));

  expect(result[0]).toBe(10324 + 0.035 * 3750 + 1296523 - 8751);
  expect(result[1]).toBe(0); // Feb 2018 doesn't have any entries
  expect(result[2]).toBe(0); // Mar 2018 "
  expect(result[3]).toBe(0); // April 2018 "
  expect(result[4]).toBe(0); // May 2018 "
  expect(result[5]).toBe(0); // June 2018 "
});

test('getNetWorthSummary returns the overview data if net worth entries have not been retrieved yet', () => {
  expect.assertions(4);
  const result = getNetWorthSummary({
    ...state,
    netWorth: {
      ...state.netWorth,
      entries: { items: [] },
    },
  });

  expect(result).toHaveLength(3);

  expect(result[0]).toBe(89137);
  expect(result[1]).toBe(93128);
  expect(result[2]).toBe(10913);
});

test('getNetWorthSummaryOld returns the obsolete net worth summary data', () => {
  expect.assertions(5);
  const result = getNetWorthSummaryOld(state);

  expect(result).toHaveLength(4);

  expect(result[0]).toBe(193);
  expect(result[1]).toBe(9913);
  expect(result[2]).toBe(-2123);
  expect(result[3]).toBe(10312);
});

test('getSpendingColumn calculates the spend for each month', () => {
  expect.assertions(1);
  expect(getSpendingColumn(state)).toStrictEqual([
    1000 + 50 + 150 + 10 + 50,
    900 + 13 + 90 + 1000 + 65,
    400 + 20 + 10 + 95 + 134,
    1300,
    2700,
    0,
  ]);
});

test('getNetWorthTable returns a list of rows for the view', () => {
  expect.assertions(1);
  expect(getNetWorthTable(state)).toStrictEqual([
    {
      id: 'real-entry-id-a',
      date: new Date('2018-01-31'),
      assets: 10324 + 3750 * 0.035 + 1296523,
      liabilities: 8751,
      expenses: 1000 + 50 + 150 + 10 + 50,
      fti:
        (10324 + 3750 * 0.035 + 1296523 - 8751) *
        ((28 + 0 / 12) / ((1000 + 50 + 150 + 10 + 50) * 12)),
    },
    {
      id: 'real-entry-id-b',
      date: new Date('2018-02-28'),
      assets: 9752 + 1051343,
      liabilities: 21939,
      expenses: 900 + 13 + 90 + 1000 + 65,
      fti:
        (9752 + 1051343 - 21939) *
        ((28 + 1 / 12) / ((900 + 13 + 90 + 1000 + 65 + (1000 + 50 + 150 + 10 + 50)) * (12 / 2))),
    },
  ]);
});

test('getAggregates returns the latest summed value of a group of categories', () => {
  expect.assertions(1);
  expect(getAggregates(state)).toStrictEqual({
    'cash-easy-access': 9752 + 1051343,
    'cash-other': -18420900,
    stocks: -21939,
    pension: 0,
  });
});
