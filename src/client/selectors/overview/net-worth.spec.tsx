import React from 'react';
import numericHash from 'string-hash';

import {
  assumedHousePriceInflation,
  getCategories,
  getHomeEquity,
  getNetWorthBreakdown,
  getNetWorthSummary,
  getNetWorthSummaryOld,
  getNetWorthTable,
  getSubcategories,
} from './net-worth';
import * as breakdownBlocks from '~client/components/net-worth/breakdown.blocks';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import { Aggregate, NetWorthCategoryType } from '~client/types/enum';
import type { NetWorthCategory, NetWorthSubcategory } from '~client/types/gql';

describe('Overview selectors (net worth)', () => {
  const state = testState;

  const testCategory: NetWorthCategory = {
    id: numericHash('category-id-a'),
    type: NetWorthCategoryType.Asset,
    category: 'Some category',
    color: 'green',
    isOption: false,
  };

  const testSubcategory: NetWorthSubcategory = {
    id: numericHash('subcategory-id-a'),
    categoryId: numericHash('category-id-a'),
    subcategory: 'Some subcategory',
    hasCreditLimit: null,
    opacity: 0.8,
  };

  describe('getCategories', () => {
    it('should sort by type, then category', () => {
      expect.assertions(1);
      expect(
        getCategories({
          ...state,
          netWorth: {
            ...state.netWorth,
            categories: [
              {
                ...testCategory,
                id: numericHash('id-a'),
                type: NetWorthCategoryType.Asset,
                category: 'foo',
              },
              {
                ...testCategory,
                id: numericHash('id-b'),
                type: NetWorthCategoryType.Liability,
                category: 'bar',
              },
              {
                ...testCategory,
                id: numericHash('id-c'),
                type: NetWorthCategoryType.Asset,
                category: 'baz',
              },
              {
                ...testCategory,
                id: numericHash('id-d'),
                type: NetWorthCategoryType.Asset,
                category: 'bak',
              },
            ],
          },
        }),
      ).toStrictEqual([
        expect.objectContaining({
          id: numericHash('id-d'),
          type: NetWorthCategoryType.Asset,
          category: 'bak',
        }),
        expect.objectContaining({
          id: numericHash('id-c'),
          type: NetWorthCategoryType.Asset,
          category: 'baz',
        }),
        expect.objectContaining({
          id: numericHash('id-a'),
          type: NetWorthCategoryType.Asset,
          category: 'foo',
        }),
        expect.objectContaining({
          id: numericHash('id-b'),
          type: NetWorthCategoryType.Liability,
          category: 'bar',
        }),
      ]);
    });
  });

  describe('getSubcategories', () => {
    it('should sort by category ID and subcategory', () => {
      expect.assertions(1);
      expect(
        getSubcategories({
          ...state,
          netWorth: {
            ...state.netWorth,
            subcategories: [
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

      const marSavingsSAYE = Math.round(698 * 123.6) + Math.round(94 * 200.1); // check testState

      expect(result).toStrictEqual(
        [
          0, // Jan 18 (no entries)
          10324 + 0.035 * 3750 + 1296523 + 21000000 - 8751 - 18744200, // Feb 18
          9752 + 1051343 - 21939 + 21500000 - 18420900 + marSavingsSAYE, // Mar 18
          0, // Apr 18
          0, // May 18
          0, // Jun 18
          0, // Jul 18
        ].map(Math.round),
      );
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
      const fti = Math.round(
        (10324 + 3750 * 0.035 + 1296523 + 21000000 - 8751 - 18744200) *
          ((28 + 58 / 365) / ((900 + 13 + 90 + 1000 + 65) * 12)),
      );

      const aggregate = {
        [Aggregate.cashEasyAccess]: Math.round(10324 + 37.5 * 100 * 0.035 + 1296523),
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
        ${'assets'}               | ${Math.round(10324 + 3750 * 0.035 + 1296523 + 21000000)}
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
      const savingsSAYE = Math.round(698 * 123.6) + Math.round(94 * 200.1);

      const fti = Math.round(
        (9752 + 1051343 + 21500000 - 21939 - 18420900 + savingsSAYE) *
          ((28 + (58 + 31) / 365) /
            ((900 + 13 + 90 + 1000 + 65 + (400 + 20 + 10 + 95 + 134)) * (12 / 2))),
      );

      const options = Math.round(101 * (95.57 - 77.65)) + Math.round(698 * (182.3 - 123.6));

      const aggregate = {
        [Aggregate.cashEasyAccess]: Math.round(9752 + 1051343),
        [Aggregate.cashOther]: savingsSAYE,
        [Aggregate.stocks]: 0,
        [Aggregate.pension]: 0,
        [Aggregate.realEstate]: 21500000,
        [Aggregate.mortgage]: -18420900,
      };

      it.each`
        prop                      | value
        ${'id'}                   | ${numericHash('real-entry-id-b')}
        ${'date'}                 | ${new Date('2018-03-31')}
        ${'assets'}               | ${Math.round(9752 + 1051343 + 21500000 + savingsSAYE)}
        ${'options'}              | ${options}
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

  describe('getHomeEquity', () => {
    const now = new Date('2018-05-02');

    const principal = 26755400;
    const paymentsRemaining = 250;
    const interestRate = 2.76; // percent

    const stateWithHomeEquity: State = {
      ...testState,
      netWorth: {
        ...testState.netWorth,
        entries: [
          {
            id: numericHash('entry-id-a1'),
            date: new Date('2018-04-30'),
            values: [
              {
                subcategory: numericHash('real-mortgage-subcategory-id'),
                mortgage: {
                  principal,
                  paymentsRemaining,
                  rate: interestRate,
                },
              },
              {
                subcategory: numericHash('real-house-subcategory-id'),
                simple: 34500000,
              },
            ],
            creditLimit: [],
            currencies: [],
          },
        ],
      },
    };

    it('should get the home equity values up to the present month', () => {
      expect.assertions(3);

      const expectedAprilEquity = 34500000 - 26755400;

      const presentEquity = getHomeEquity(now)(stateWithHomeEquity).slice(0, 4);

      expect(presentEquity).toHaveLength(4);
      expect(presentEquity).toStrictEqual([
        0, // Jan 18
        0, // Feb 18
        0, // Mar 18
        expectedAprilEquity, // Apr 18
      ]);

      expect(presentEquity).toMatchInlineSnapshot(`
        Array [
          0,
          0,
          0,
          7744600,
        ]
      `);
    });

    it('should use the latest mortgage rate/terms/principal data to predict the future equity', () => {
      expect.assertions(5);

      const monthlyDebtPaid = 140842.5536318; // PMT(0.0276/12, 250, 267554) - monthly payment

      const principalMay = principal * (1 + interestRate / 100) ** (1 / 12) - monthlyDebtPaid;
      const principalJun = principalMay * (1 + interestRate / 100) ** (1 / 12) - monthlyDebtPaid;
      const principalJul = principalJun * (1 + interestRate / 100) ** (1 / 12) - monthlyDebtPaid;

      const housePriceMay = 34500000 * (1 + assumedHousePriceInflation) ** (1 / 12);
      const housePriceJun = housePriceMay * (1 + assumedHousePriceInflation) ** (1 / 12);
      const housePriceJul = housePriceJun * (1 + assumedHousePriceInflation) ** (1 / 12);

      const equityMay = housePriceMay - principalMay;
      const equityJun = housePriceJun - principalJun;
      const equityJul = housePriceJul - principalJul;

      const forecastEquity = getHomeEquity(now)(stateWithHomeEquity).slice(4);

      expect(forecastEquity).toHaveLength(3);

      expect(forecastEquity[0] / 100).toBeCloseTo(equityMay / 100, 1);
      expect(forecastEquity[1] / 100).toBeCloseTo(equityJun / 100, 1);
      expect(forecastEquity[2] / 100).toBeCloseTo(equityJul / 100, 1);

      expect(forecastEquity).toMatchInlineSnapshot(`
        Array [
          7965227.396299284,
          8186609.312236443,
          8408748.493954502,
        ]
      `);
    });
  });

  describe('getNetWorthBreakdown', () => {
    it('should return blocks', () => {
      expect.assertions(1);
      jest.spyOn(breakdownBlocks, 'getText').mockImplementation((name, level) => (
        <span>
          {name} - {level}
        </span>
      ));

      // eslint-disable-next-line jest/prefer-inline-snapshots
      expect(getNetWorthBreakdown(state.netWorth.entries[0], 100, 100)(state)).toMatchSnapshot();
    });
  });
});
