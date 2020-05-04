import { replaceAtIndex } from 'replace-array';

import state from '~client/test-data/state';

import {
  getCategories,
  getSubcategories,
  getNetWorthSummary,
  getNetWorthSummaryOld,
  getAggregates,
  getNetWorthTable,
  getNetWorthRequests,
} from './net-worth';

import { getNumMonths } from './common';
import { RequestType } from '~client/types/crud';
import { Category, Subcategory } from '~client/types/net-worth';
import { State } from '~client/reducers';

describe('Overview selectors (net worth)', () => {
  const testCategory: Category = {
    id: 'category-id-a',
    type: 'asset',
    category: 'Some category',
    color: 'green',
  };

  const testSubcategory: Subcategory = {
    id: 'subcategory-id-a',
    categoryId: 'category-id-a',
    subcategory: 'Some subcategory',
    hasCreditLimit: null,
    opacity: 0.8,
  };

  describe('getCategories', () => {
    it('should exclude optimistically deleted items', () => {
      expect.assertions(1);
      expect(
        getCategories({
          ...state,
          netWorth: {
            ...state.netWorth,
            categories: [
              { ...testCategory, __optimistic: RequestType.delete },
              {
                ...testCategory,
                id: 'id-b',
              },
            ],
          },
        }),
      ).toStrictEqual([expect.objectContaining({ id: 'id-b' })]);
    });

    it('should sort by type, then category', () => {
      expect.assertions(1);
      expect(
        getCategories({
          ...state,
          netWorth: {
            ...state.netWorth,
            categories: [
              { ...testCategory, id: 'id-a', type: 'asset', category: 'foo' },
              { ...testCategory, id: 'id-b', type: 'liability', category: 'bar' },
              { ...testCategory, id: 'id-c', type: 'asset', category: 'baz' },
              { ...testCategory, id: 'id-d', type: 'asset', category: 'bak' },
            ],
          },
        }),
      ).toStrictEqual([
        expect.objectContaining({ id: 'id-d', type: 'asset', category: 'bak' }),
        expect.objectContaining({ id: 'id-c', type: 'asset', category: 'baz' }),
        expect.objectContaining({ id: 'id-a', type: 'asset', category: 'foo' }),
        expect.objectContaining({ id: 'id-b', type: 'liability', category: 'bar' }),
      ]);
    });
  });

  describe('getSubcategories', () => {
    it('should exclude optimistically deleted items', () => {
      expect.assertions(1);
      expect(
        getSubcategories({
          ...state,
          netWorth: {
            ...state.netWorth,
            subcategories: [
              { ...testSubcategory, id: 'id-a', __optimistic: RequestType.delete },
              { ...testSubcategory, id: 'id-b' },
            ],
          },
        }),
      ).toStrictEqual([expect.objectContaining({ id: 'id-b' })]);
    });

    it('should sort by category ID and subcategory', () => {
      expect.assertions(1);
      expect(
        getSubcategories({
          ...state,
          netWorth: {
            ...state.netWorth,
            subcategories: [
              { ...testSubcategory, id: 'id-a', categoryId: 'cat-id-2', subcategory: 'foo' },
              { ...testSubcategory, id: 'id-b', categoryId: 'cat-id-1', subcategory: 'bar' },
              { ...testSubcategory, id: 'id-c', categoryId: 'cat-id-2', subcategory: 'baz' },
            ],
          },
        }),
      ).toStrictEqual([
        expect.objectContaining({ id: 'id-b', categoryId: 'cat-id-1', subcategory: 'bar' }),
        expect.objectContaining({ id: 'id-c', categoryId: 'cat-id-2', subcategory: 'baz' }),
        expect.objectContaining({ id: 'id-a', categoryId: 'cat-id-2', subcategory: 'foo' }),
      ]);
    });
  });

  describe('getNetWorthSummary', () => {
    it('should get a list of net worth values by month', () => {
      expect.assertions(8);
      const result = getNetWorthSummary(state);

      expect(result).toHaveLength(getNumMonths(state));

      expect(result[0]).toBe(0); // January 2018 doesn't have any entries
      expect(result[1]).toBe(10324 + 0.035 * 3750 + 1296523 - 8751);
      expect(result[2]).toBe(9752 + 1051343 - 21939);
      expect(result[3]).toBe(0); // April 2018 doesn't have any entries
      expect(result[4]).toBe(0); // May 2018 "
      expect(result[5]).toBe(0); // June 2018 "
      expect(result[6]).toBe(0); // July 2018 "
    });

    it('should exclude optimistically deleted entries', () => {
      expect.assertions(8);
      const result = getNetWorthSummary({
        ...state,
        netWorth: {
          ...state.netWorth,
          entries: replaceAtIndex(state.netWorth.entries, 1, entry => ({
            ...entry,
            __optimistic: RequestType.delete,
          })),
        },
      });

      expect(result).toHaveLength(getNumMonths(state));

      expect(result[0]).toBe(0); // January 2018 doesn't have any entries
      expect(result[1]).toBe(10324 + 0.035 * 3750 + 1296523 - 8751);
      expect(result[2]).toBe(0);
      expect(result[3]).toBe(0); // April 2018 doesn't have any entries
      expect(result[4]).toBe(0); // May 2018 "
      expect(result[5]).toBe(0); // June 2018 "
      expect(result[6]).toBe(0); // July 2018 "
    });
  });

  describe('getNetWorthSummaryOld', () => {
    it('should get the old net worth entry values, as provided by the API', () => {
      expect.assertions(1);
      const result = getNetWorthSummaryOld({
        ...state,
        overview: {
          ...state.overview,
          startDate: new Date('2018-03-31'),
          endDate: new Date('2018-05-31'),
        },
        netWorth: {
          ...state.netWorth,
          entries: [],
          old: [1000, 1302],
        },
      });

      expect(result).toStrictEqual([1000, 1302]);
    });
  });

  describe('getNetWorthTable', () => {
    it('should return a list of rows for the view', () => {
      expect.assertions(1);
      expect(getNetWorthTable(state)).toStrictEqual([
        {
          id: 'real-entry-id-a',
          date: new Date('2018-02-28'),
          assets: 10324 + 3750 * 0.035 + 1296523,
          liabilities: 8751,
          expenses: 900 + 13 + 90 + 1000 + 65,
          fti:
            (10324 + 3750 * 0.035 + 1296523 - 8751) *
            ((28 + 58 / 365) / ((900 + 13 + 90 + 1000 + 65) * 12)),
          pastYearAverageSpend: 24816,
        },
        {
          id: 'real-entry-id-b',
          date: new Date('2018-03-31'),
          assets: 9752 + 1051343,
          liabilities: 21939,
          expenses: 400 + 20 + 10 + 95 + 134,
          fti:
            (9752 + 1051343 - 21939) *
            ((28 + (58 + 31) / 365) /
              ((900 + 13 + 90 + 1000 + 65 + (400 + 20 + 10 + 95 + 134)) * (12 / 2))),
          pastYearAverageSpend: 16362,
        },
      ]);
    });
  });

  describe('getAggregates', () => {
    it('should return the latest summed value of a group of categories', () => {
      expect.assertions(1);
      expect(getAggregates(state)).toStrictEqual({
        cashEasyAccess: 9752 + 1051343,
        cashOther: 0,
        stocks: 0,
        pension: 0,
      });
    });

    it('should return 0 for each aggregate if there are no entries', () => {
      expect.assertions(1);
      expect(
        getAggregates({ ...state, netWorth: { ...state.netWorth, entries: [] } }),
      ).toStrictEqual({
        cashEasyAccess: 0,
        cashOther: 0,
        stocks: 0,
        pension: 0,
      });
    });
  });

  describe('getNetWorthRequests', () => {
    it("should get requests for all items which don't reference fake IDs", () => {
      expect.assertions(1);
      const stateOptimistic: State = {
        ...state,
        netWorth: {
          ...state.netWorth,
          categories: [
            {
              ...testCategory,
              id: 'real-category-id',
              __optimistic: RequestType.delete,
            },
            {
              ...testCategory,
              id: 'fake-category-id',
              __optimistic: RequestType.create,
            },
          ],
          subcategories: [
            {
              ...testSubcategory,
              id: 'real-subcategory-id',
              categoryId: 'real-category-id',
              __optimistic: RequestType.update,
            },
            {
              ...testSubcategory,
              id: 'fake-subcategory-id-a',
              categoryId: 'real-category-id',
              __optimistic: RequestType.create,
            },
            {
              ...testSubcategory,
              id: 'fake-subcategory-id-b',
              categoryId: 'fake-category-id',
              __optimistic: RequestType.create,
            },
          ],
          entries: [
            {
              id: 'real-entry-id',
              date: new Date('2019-07-27'),
              values: [{ id: 'some-value-id', value: 3, subcategory: 'real-subcategory-id' }],
              currencies: [],
              creditLimit: [],
              __optimistic: RequestType.update,
            },
            {
              id: 'fake-entry-id',
              date: new Date('2019-07-04'),
              values: [
                { id: 'value-id-a', value: 4, subcategory: 'real-subcategory-id' },
                { id: 'value-id-b', value: 5, subcategory: 'fake-subcategory-id-a' },
              ],
              currencies: [],
              creditLimit: [],
              __optimistic: RequestType.create,
            },
          ],
        },
      };

      const result = getNetWorthRequests(stateOptimistic);

      expect(result).toStrictEqual(
        expect.arrayContaining([
          {
            type: RequestType.create,
            fakeId: 'fake-category-id',
            method: 'post',
            route: 'data/net-worth/categories',
            body: {
              type: testCategory.type,
              category: testCategory.category,
              color: testCategory.color,
            },
          },
          {
            type: RequestType.delete,
            id: 'real-category-id',
            method: 'delete',
            route: 'data/net-worth/categories',
          },
          {
            type: RequestType.create,
            fakeId: 'fake-subcategory-id-a',
            method: 'post',
            route: 'data/net-worth/subcategories',
            body: {
              categoryId: 'real-category-id',
              subcategory: testSubcategory.subcategory,
              hasCreditLimit: testSubcategory.hasCreditLimit,
              opacity: testSubcategory.opacity,
            },
          },
          {
            type: RequestType.update,
            id: 'real-subcategory-id',
            method: 'put',
            route: 'data/net-worth/subcategories',
            body: {
              categoryId: 'real-category-id',
              subcategory: testSubcategory.subcategory,
              hasCreditLimit: testSubcategory.hasCreditLimit,
              opacity: testSubcategory.opacity,
            },
          },
          {
            type: RequestType.update,
            id: 'real-entry-id',
            method: 'put',
            route: 'data/net-worth',
            body: {
              date: '2019-07-27',
              values: [{ value: 3, subcategory: 'real-subcategory-id' }],
              currencies: [],
              creditLimit: [],
            },
          },
        ]),
      );
    });

    it('should remove IDs from net worth entry dependents', () => {
      expect.assertions(1);
      const stateWithEntryCreate: State = {
        ...state,
        netWorth: {
          ...state.netWorth,
          categories: [
            {
              ...testCategory,
              id: 'real-category-id',
            },
          ],
          subcategories: [
            {
              ...testSubcategory,
              id: 'real-subcategory-id',
              categoryId: 'real-category-id',
            },
          ],
          entries: [
            {
              id: 'fake-entry-id',
              date: new Date('2019-07-31'),
              values: [{ id: 'fake-value-id', subcategory: 'real-subcategory-id', value: 2 }],
              creditLimit: [
                { id: 'some-credit-limit-id', subcategory: 'real-subcategory-id', value: 100 },
              ],
              currencies: [{ id: 'fake-currency-id', currency: 'CZK', rate: 0.031 }],
              __optimistic: RequestType.create,
            },
          ],
        },
      };

      const result = getNetWorthRequests(stateWithEntryCreate);

      expect(result).toStrictEqual([
        {
          type: RequestType.create,
          fakeId: 'fake-entry-id',
          method: 'post',
          route: 'data/net-worth',
          body: {
            date: '2019-07-31',
            values: [expect.objectContaining({ subcategory: 'real-subcategory-id' })],
            creditLimit: [{ subcategory: 'real-subcategory-id', value: 100 }],
            currencies: [{ currency: 'CZK', rate: 0.031 }],
          },
        },
      ]);
    });
  });
});
