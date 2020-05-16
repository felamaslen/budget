import { replaceAtIndex } from 'replace-array';

import state from '~client/test-data/state';

import {
  getCategories,
  getSubcategories,
  getNetWorthSummary,
  getNetWorthSummaryOld,
  getNetWorthTable,
  getNetWorthRequests,
} from './net-worth';

import { getNumMonths } from './common';
import { RequestType } from '~client/types/crud';
import { Category, Subcategory, Aggregate } from '~client/types/net-worth';
import { State } from '~client/reducers';

describe('Overview selectors (net worth)', () => {
  const testCategory: Category = {
    id: 'category-id-a',
    type: 'asset',
    category: 'Some category',
    color: 'green',
    isOption: false,
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
      expect.assertions(1);
      const result = getNetWorthSummary(state);

      expect(result).toStrictEqual([
        0, // Jan 18 (no entries)
        10324 + 0.035 * 3750 + 1296523 - 8751, // Feb 18
        9752 + 1051343 - 21939, // Mar 18
        0, // Apr 18
        0, // May 18
        0, // Jun 18
        0, // Jul 18
      ]);
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
    it.each`
      description        | prop         | values
      ${'values'}        | ${'main'}    | ${[1000, 1302]}
      ${'option values'} | ${'options'} | ${[887, 193]}
    `(
      'should get the old net worth entry $description, as provided by the API',
      ({ prop, values }) => {
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
            oldOptions: [887, 193],
          },
        });

        expect(result).toStrictEqual(expect.objectContaining({ [prop]: values }));
      },
    );
  });

  describe('getNetWorthTable', () => {
    describe('for the first row in the view', () => {
      const fti =
        (10324 + 3750 * 0.035 + 1296523 - 8751) *
        ((28 + 58 / 365) / ((900 + 13 + 90 + 1000 + 65) * 12));

      const aggregate = {
        [Aggregate.cashEasyAccess]: 10324 + 37.5 * 100 * 0.035 + 1296523,
        [Aggregate.cashOther]: 0,
        [Aggregate.stocks]: 0,
        [Aggregate.pension]: 0,
      };

      it.each`
        prop                      | value
        ${'id'}                   | ${'real-entry-id-a'}
        ${'date'}                 | ${new Date('2018-02-28')}
        ${'assets'}               | ${10324 + 3750 * 0.035 + 1296523}
        ${'options'}              | ${0}
        ${'aggregate'}            | ${aggregate}
        ${'liabilities'}          | ${8751}
        ${'expenses'}             | ${900 + 13 + 90 + 1000 + 65}
        ${'fti'}                  | ${fti}
        ${'pastYearAverageSpend'} | ${24816}
      `('should return the correct $prop value', ({ prop, value }) => {
        expect.assertions(1);
        expect(getNetWorthTable(state)[0]).toStrictEqual(
          expect.objectContaining({
            [prop]: value,
          }),
        );
      });
    });

    describe('for the second row in the view', () => {
      const fti =
        (9752 + 1051343 - 21939) *
        ((28 + (58 + 31) / 365) /
          ((900 + 13 + 90 + 1000 + 65 + (400 + 20 + 10 + 95 + 134)) * (12 / 2)));

      const aggregate = {
        [Aggregate.cashEasyAccess]: 9752 + 1051343,
        [Aggregate.cashOther]: 0,
        [Aggregate.stocks]: 0,
        [Aggregate.pension]: 0,
      };

      it.each`
        prop                      | value
        ${'id'}                   | ${'real-entry-id-b'}
        ${'date'}                 | ${new Date('2018-03-31')}
        ${'assets'}               | ${9752 + 1051343}
        ${'options'}              | ${103 * 95.57}
        ${'aggregate'}            | ${aggregate}
        ${'liabilities'}          | ${21939}
        ${'expenses'}             | ${400 + 20 + 10 + 95 + 134}
        ${'fti'}                  | ${fti}
        ${'pastYearAverageSpend'} | ${16362}
      `('should return the correct $prop value', ({ prop, value }) => {
        expect.assertions(1);
        expect(getNetWorthTable(state)[1]).toStrictEqual(
          expect.objectContaining({
            [prop]: value,
          }),
        );
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
              isOption: testCategory.isOption,
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
              creditLimit: [{ subcategory: 'real-subcategory-id', value: 100 }],
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

    describe('for option values', () => {
      const stateWithOptions: State = {
        ...state,
        netWorth: {
          ...state.netWorth,
          categories: [
            {
              ...testCategory,
              id: 'real-category-id',
              isOption: true,
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
              values: [],
              creditLimit: [],
              currencies: [],
              __optimistic: RequestType.create,
            },
          ],
        },
      };

      it('should remove orphaned components of the value', () => {
        expect.assertions(1);
        const stateWithEntryCreate: State = {
          ...stateWithOptions,
          netWorth: {
            ...stateWithOptions.netWorth,
            entries: [
              {
                ...stateWithOptions.netWorth.entries[0],
                values: [
                  {
                    id: 'fake-value-id',
                    subcategory: 'real-subcategory-id',
                    value: [
                      3,
                      { units: 67, strikePrice: 35.27, marketPrice: 32.99 },
                      { value: 10, currency: 'USD' },
                      { units: 103, strikePrice: 135.27, marketPrice: 132.99 },
                    ],
                  },
                ],
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
              values: [
                {
                  subcategory: 'real-subcategory-id',
                  value: [
                    expect.objectContaining({
                      units: 67,
                      strikePrice: 35.27,
                      marketPrice: 32.99,
                    }),
                  ],
                },
              ],
              creditLimit: [],
              currencies: [],
            },
          },
        ]);
      });

      it('should revert to a zero-value field if there is no valid data', () => {
        expect.assertions(1);
        const stateWithEntryCreate: State = {
          ...stateWithOptions,
          netWorth: {
            ...stateWithOptions.netWorth,
            entries: [
              {
                ...stateWithOptions.netWorth.entries[0],
                values: [
                  {
                    id: 'fake-value-id',
                    subcategory: 'real-subcategory-id',
                    value: [3, { value: 10, currency: 'USD' }],
                  },
                ],
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
              values: [
                expect.objectContaining({
                  value: [
                    {
                      units: 0,
                      strikePrice: 0,
                      marketPrice: 0,
                    },
                  ],
                }),
              ],
              creditLimit: [],
              currencies: [],
            },
          },
        ]);
      });
    });
  });
});
