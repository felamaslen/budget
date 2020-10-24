import { replaceAtIndex } from 'replace-array';
import numericHash from 'string-hash';

import { getNumMonths } from './common';
import {
  getCategories,
  getSubcategories,
  getNetWorthSummary,
  getNetWorthSummaryOld,
  getNetWorthTable,
  getNetWorthRequests,
} from './net-worth';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import {
  Create,
  RequestType,
  RawDate,
  Category,
  Subcategory,
  Aggregate,
  Request,
  CreateEntry,
} from '~client/types';

describe('Overview selectors (net worth)', () => {
  const state: State = {
    ...testState,
    netWorth: {
      ...testState.netWorth,
      entries: {
        ...testState.netWorth.entries,
        items: [
          testState.netWorth.entries.items[0],
          {
            ...testState.netWorth.entries.items[1],
            values: replaceAtIndex(
              testState.netWorth.entries.items[1].values,
              testState.netWorth.entries.items[1].values.findIndex(
                ({ id }) => id === numericHash('value-id-b5'),
              ),
              (item) => ({
                ...item,
                value: [
                  {
                    units: 103,
                    vested: 56,
                    strikePrice: 77.65,
                    marketPrice: 95.57,
                  },
                ],
              }),
            ),
          },
        ],
      },
    },
  };

  const testCategory: Category = {
    id: numericHash('category-id-a'),
    type: 'asset',
    category: 'Some category',
    color: 'green',
    isOption: false,
  };

  const testSubcategory: Subcategory = {
    id: numericHash('subcategory-id-a'),
    categoryId: numericHash('category-id-a'),
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
            categories: {
              items: [
                testCategory,
                {
                  ...testCategory,
                  id: numericHash('id-b'),
                },
              ],
              __optimistic: [RequestType.delete, undefined],
            },
          },
        }),
      ).toStrictEqual([expect.objectContaining({ id: numericHash('id-b') })]);
    });

    it('should sort by type, then category', () => {
      expect.assertions(1);
      expect(
        getCategories({
          ...state,
          netWorth: {
            ...state.netWorth,
            categories: {
              items: [
                { ...testCategory, id: numericHash('id-a'), type: 'asset', category: 'foo' },
                { ...testCategory, id: numericHash('id-b'), type: 'liability', category: 'bar' },
                { ...testCategory, id: numericHash('id-c'), type: 'asset', category: 'baz' },
                { ...testCategory, id: numericHash('id-d'), type: 'asset', category: 'bak' },
              ],
              __optimistic: [undefined, undefined, undefined, undefined],
            },
          },
        }),
      ).toStrictEqual([
        expect.objectContaining({ id: numericHash('id-d'), type: 'asset', category: 'bak' }),
        expect.objectContaining({ id: numericHash('id-c'), type: 'asset', category: 'baz' }),
        expect.objectContaining({ id: numericHash('id-a'), type: 'asset', category: 'foo' }),
        expect.objectContaining({ id: numericHash('id-b'), type: 'liability', category: 'bar' }),
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
            subcategories: {
              items: [
                { ...testSubcategory, id: numericHash('id-a') },
                { ...testSubcategory, id: numericHash('id-b') },
              ],
              __optimistic: [RequestType.delete, undefined],
            },
          },
        }),
      ).toStrictEqual([expect.objectContaining({ id: numericHash('id-b') })]);
    });

    it('should sort by category ID and subcategory', () => {
      expect.assertions(1);
      expect(
        getSubcategories({
          ...state,
          netWorth: {
            ...state.netWorth,
            subcategories: {
              items: [
                {
                  ...testSubcategory,
                  id: numericHash('id-a'),
                  categoryId: numericHash('cat-id-2'),
                  subcategory: 'foo',
                },
                {
                  ...testSubcategory,
                  id: numericHash('id-b'),
                  categoryId: numericHash('cat-id-1'),
                  subcategory: 'bar',
                },
                {
                  ...testSubcategory,
                  id: numericHash('id-c'),
                  categoryId: numericHash('cat-id-2'),
                  subcategory: 'baz',
                },
              ],
              __optimistic: [undefined, undefined, undefined],
            },
          },
        }),
      ).toStrictEqual([
        expect.objectContaining({
          id: numericHash('id-b'),
          categoryId: numericHash('cat-id-1'),
          subcategory: 'bar',
        }),
        expect.objectContaining({
          id: numericHash('id-c'),
          categoryId: numericHash('cat-id-2'),
          subcategory: 'baz',
        }),
        expect.objectContaining({
          id: numericHash('id-a'),
          categoryId: numericHash('cat-id-2'),
          subcategory: 'foo',
        }),
      ]);
    });
  });

  describe('getNetWorthSummary', () => {
    it('should get a list of net worth values by month', () => {
      expect.assertions(1);
      const result = getNetWorthSummary(state);

      expect(result).toStrictEqual([
        0, // Jan 18 (no entries)
        10324 + 0.035 * 3750 + 1296523 + 21000000 - 8751 - 18744200, // Feb 18
        9752 + 1051343 - 21939 + 21500000 - 18420900, // Mar 18
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
          entries: {
            items: state.netWorth.entries.items,
            __optimistic: replaceAtIndex(
              state.netWorth.entries.__optimistic,
              1,
              RequestType.delete,
            ),
          },
        },
      });

      expect(result).toHaveLength(getNumMonths(state));

      expect(result[0]).toBe(0); // January 2018 doesn't have any entries
      expect(result[1]).toBe(10324 + 0.035 * 3750 + 1296523 + 21000000 - 8751 - 18744200);
      expect(result[2]).toBe(0); // March 2018 doesn't have any entries
      expect(result[3]).toBe(0); // April 2018 "
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
            entries: { items: [], __optimistic: [] },
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
        (10324 + 3750 * 0.035 + 1296523 + 21000000 - 8751 - 18744200) *
        ((28 + 58 / 365) / ((900 + 13 + 90 + 1000 + 65) * 12));

      const aggregate = {
        [Aggregate.cashEasyAccess]: 10324 + 37.5 * 100 * 0.035 + 1296523,
        [Aggregate.cashOther]: 0,
        [Aggregate.stocks]: 0,
        [Aggregate.pension]: 0,
        [Aggregate.realEstate]: 21000000,
        [Aggregate.mortgage]: -18744200,
      };

      it.each`
        prop                      | value
        ${'id'}                   | ${numericHash('real-entry-id-a')}
        ${'date'}                 | ${new Date('2018-02-28')}
        ${'assets'}               | ${10324 + 3750 * 0.035 + 1296523 + 21000000}
        ${'options'}              | ${0}
        ${'aggregate'}            | ${aggregate}
        ${'liabilities'}          | ${8751 + 18744200}
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
        (9752 + 1051343 + 21500000 - 21939 - 18420900) *
        ((28 + (58 + 31) / 365) /
          ((900 + 13 + 90 + 1000 + 65 + (400 + 20 + 10 + 95 + 134)) * (12 / 2)));

      const aggregate = {
        [Aggregate.cashEasyAccess]: 9752 + 1051343,
        [Aggregate.cashOther]: 0,
        [Aggregate.stocks]: 0,
        [Aggregate.pension]: 0,
        [Aggregate.realEstate]: 21500000,
        [Aggregate.mortgage]: -18420900,
      };

      it.each`
        prop                      | value
        ${'id'}                   | ${numericHash('real-entry-id-b')}
        ${'date'}                 | ${new Date('2018-03-31')}
        ${'assets'}               | ${9752 + 1051343 + 21500000}
        ${'options'}              | ${56 * 95.57}
        ${'aggregate'}            | ${aggregate}
        ${'liabilities'}          | ${21939 + 18420900}
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
          categories: {
            items: [
              {
                ...testCategory,
                id: numericHash('real-category-id'),
              },
              {
                ...testCategory,
                id: numericHash('fake-category-id'),
              },
            ],
            __optimistic: [RequestType.delete, RequestType.create],
          },
          subcategories: {
            items: [
              {
                ...testSubcategory,
                id: numericHash('real-subcategory-id'),
                categoryId: numericHash('real-category-id'),
              },
              {
                ...testSubcategory,
                id: numericHash('fake-subcategory-id-a'),
                categoryId: numericHash('real-category-id'),
              },
              {
                ...testSubcategory,
                id: numericHash('fake-subcategory-id-b'),
                categoryId: numericHash('fake-category-id'),
              },
            ],
            __optimistic: [RequestType.update, RequestType.create, RequestType.create],
          },
          entries: {
            items: [
              {
                id: numericHash('real-entry-id'),
                date: new Date('2019-07-27'),
                values: [
                  {
                    id: numericHash('some-value-id'),
                    value: 3,
                    subcategory: numericHash('real-subcategory-id'),
                  },
                ],
                currencies: [],
                creditLimit: [],
              },
              {
                id: numericHash('fake-entry-id'),
                date: new Date('2019-07-04'),
                values: [
                  {
                    id: numericHash('value-id-a'),
                    value: 4,
                    subcategory: numericHash('real-subcategory-id'),
                  },
                  {
                    id: numericHash('value-id-b'),
                    value: 5,
                    subcategory: numericHash('fake-subcategory-id-a'),
                  },
                ],
                currencies: [],
                creditLimit: [],
              },
            ],
            __optimistic: [RequestType.update, RequestType.create],
          },
        },
      };

      const result = getNetWorthRequests(stateOptimistic);

      expect(result).toStrictEqual(
        expect.arrayContaining<Request>([
          {
            type: RequestType.create,
            fakeId: numericHash('fake-category-id'),
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
            id: numericHash('real-category-id'),
            method: 'delete',
            route: 'data/net-worth/categories',
          },
          {
            type: RequestType.create,
            fakeId: numericHash('fake-subcategory-id-a'),
            method: 'post',
            route: 'data/net-worth/subcategories',
            body: {
              categoryId: numericHash('real-category-id'),
              subcategory: testSubcategory.subcategory,
              hasCreditLimit: testSubcategory.hasCreditLimit,
              opacity: testSubcategory.opacity,
            },
          },
          {
            type: RequestType.update,
            id: numericHash('real-subcategory-id'),
            method: 'put',
            route: 'data/net-worth/subcategories',
            body: {
              categoryId: numericHash('real-category-id'),
              subcategory: testSubcategory.subcategory,
              hasCreditLimit: testSubcategory.hasCreditLimit,
              opacity: testSubcategory.opacity,
            },
          },
          {
            type: RequestType.update,
            id: numericHash('real-entry-id'),
            method: 'put',
            route: 'data/net-worth',
            body: {
              date: '2019-07-27',
              values: [{ value: 3, subcategory: numericHash('real-subcategory-id') }],
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
          categories: {
            items: [
              {
                ...testCategory,
                id: numericHash('real-category-id'),
              },
            ],
            __optimistic: [undefined],
          },
          subcategories: {
            items: [
              {
                ...testSubcategory,
                id: numericHash('real-subcategory-id'),
                categoryId: numericHash('real-category-id'),
              },
            ],
            __optimistic: [undefined],
          },
          entries: {
            items: [
              {
                id: numericHash('fake-entry-id'),
                date: new Date('2019-07-31'),
                values: [
                  {
                    id: numericHash('fake-value-id'),
                    subcategory: numericHash('real-subcategory-id'),
                    value: 2,
                  },
                ],
                creditLimit: [{ subcategory: numericHash('real-subcategory-id'), value: 100 }],
                currencies: [{ id: numericHash('fake-currency-id'), currency: 'CZK', rate: 0.031 }],
              },
            ],
            __optimistic: [RequestType.create],
          },
        },
      };

      const result = getNetWorthRequests(stateWithEntryCreate);

      expect(result).toStrictEqual([
        {
          type: RequestType.create,
          fakeId: numericHash('fake-entry-id'),
          method: 'post',
          route: 'data/net-worth',
          body: {
            date: '2019-07-31',
            values: [expect.objectContaining({ subcategory: numericHash('real-subcategory-id') })],
            creditLimit: [{ subcategory: numericHash('real-subcategory-id'), value: 100 }],
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
          categories: {
            items: [
              {
                ...testCategory,
                id: numericHash('real-category-id'),
                isOption: true,
              },
            ],
            __optimistic: [undefined],
          },
          subcategories: {
            items: [
              {
                ...testSubcategory,
                id: numericHash('real-subcategory-id'),
                categoryId: numericHash('real-category-id'),
              },
            ],
            __optimistic: [undefined],
          },
          entries: {
            items: [
              {
                id: numericHash('fake-entry-id'),
                date: new Date('2019-07-31'),
                values: [],
                creditLimit: [],
                currencies: [],
              },
            ],
            __optimistic: [RequestType.create],
          },
        },
      };

      it('should remove orphaned components of the value', () => {
        expect.assertions(1);
        const stateWithEntryCreate: State = {
          ...stateWithOptions,
          netWorth: {
            ...stateWithOptions.netWorth,
            entries: {
              items: [
                {
                  ...stateWithOptions.netWorth.entries.items[0],
                  values: [
                    {
                      id: numericHash('fake-value-id'),
                      subcategory: numericHash('real-subcategory-id'),
                      value: [
                        3,
                        { units: 67, vested: 10, strikePrice: 35.27, marketPrice: 32.99 },
                        { value: 10, currency: 'USD' },
                        { units: 103, vested: 0, strikePrice: 135.27, marketPrice: 132.99 },
                      ],
                    },
                  ],
                },
              ],
              __optimistic: [RequestType.create],
            },
          },
        };

        const result = getNetWorthRequests(stateWithEntryCreate);

        expect(result).toStrictEqual<Request<Create<RawDate<CreateEntry>>>[]>([
          {
            type: RequestType.create,
            fakeId: numericHash('fake-entry-id'),
            method: 'post',
            route: 'data/net-worth',
            body: {
              date: '2019-07-31',
              values: [
                {
                  subcategory: numericHash('real-subcategory-id'),
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
            entries: {
              items: [
                {
                  ...stateWithOptions.netWorth.entries.items[0],
                  values: [
                    {
                      id: numericHash('fake-value-id'),
                      subcategory: numericHash('real-subcategory-id'),
                      value: [3, { value: 10, currency: 'USD' }],
                    },
                  ],
                },
              ],
              __optimistic: [RequestType.create],
            },
          },
        };

        const result = getNetWorthRequests(stateWithEntryCreate);

        expect(result).toStrictEqual([
          {
            type: RequestType.create,
            fakeId: numericHash('fake-entry-id'),
            method: 'post',
            route: 'data/net-worth',
            body: {
              date: '2019-07-31',
              values: [
                expect.objectContaining({
                  value: [
                    {
                      units: 0,
                      vested: 0,
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
