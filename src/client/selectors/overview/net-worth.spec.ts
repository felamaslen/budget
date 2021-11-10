import numericHash from 'string-hash';

import {
  getCategories,
  getIlliquidEquity,
  getLatestNetWorthAggregate,
  getNetWorthBreakdown,
  getNetWorthTable,
  getSubcategories,
} from './net-worth';
import { State } from '~client/reducers';
import { testState } from '~client/test-data';
import { NetWorthCategoryType } from '~client/types/enum';
import type { NetWorthCategory, NetWorthSubcategory } from '~client/types/gql';
import { NetWorthAggregate as Aggregate } from '~shared/constants';

describe('overview selectors (net worth)', () => {
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

  describe('getLatestNetWorthAggregate', () => {
    it('should aggregate the latest net worth value for the current month', () => {
      expect.assertions(2);

      expect(getLatestNetWorthAggregate(new Date('2018-02-28'))(testState)).toStrictEqual({
        [Aggregate.cashEasyAccess]: Math.round(10324 + 37.5 * 0.035 * 100 + 1296523),
        [Aggregate.cashOther]: 855912 + Math.round(657 * 123.6),
        [Aggregate.stocks]: 0,
        [Aggregate.pension]: 10654,
        [Aggregate.realEstate]: 21000000,
        [Aggregate.mortgage]: -18744200,
      });

      expect(getLatestNetWorthAggregate(new Date('2018-03-01'))(testState)).toStrictEqual({
        [Aggregate.cashEasyAccess]: 9752 + 1051343,
        [Aggregate.cashOther]: Math.round(165 * 0.865 * 100 + 698 * 123.6 + 94 * 200.1),
        [Aggregate.stocks]: 0,
        [Aggregate.pension]: 11237,
        [Aggregate.realEstate]: 21500000,
        [Aggregate.mortgage]: -18420900,
      });
    });

    describe('when the current month is not yet filled in', () => {
      it('should use the latest value', () => {
        expect.assertions(1);
        expect(getLatestNetWorthAggregate(new Date('2018-04-04'))(testState)).toStrictEqual(
          getLatestNetWorthAggregate(new Date('2018-03-01'))(testState),
        );
      });
    });
  });

  describe('getNetWorthTable', () => {
    describe('for the second row in the view', () => {
      const assets =
        10324 + 3750 * 0.035 + 855912 + Math.round(657 * 123.6) + 1296523 + 21000000 + 10654;
      const options = 657 * (176.28 - 123.6);
      const liabilities = 8751 + 18744200;
      const pastExpenses = 1000 + 50 + 150 + 10 + 50;
      const expenses = 900 + 13 + 90 + 1000 + 65;

      const pastYearAverageSpend = (pastExpenses + expenses) * (12 / 2);

      const fti = Math.round(((assets - liabilities) * (28 + 58 / 365)) / pastYearAverageSpend);

      const aggregate = {
        [Aggregate.cashEasyAccess]: Math.round(10324 + 37.5 * 100 * 0.035 + 1296523),
        [Aggregate.cashOther]: 855912 + Math.round(657 * 123.6),
        [Aggregate.stocks]: 0,
        [Aggregate.pension]: 10654,
        [Aggregate.realEstate]: 21000000,
        [Aggregate.mortgage]: -18744200,
      };

      it.each`
        prop                      | value
        ${'id'}                   | ${numericHash('real-entry-id-a')}
        ${'date'}                 | ${new Date('2018-02-28')}
        ${'assets'}               | ${Math.round(assets)}
        ${'options'}              | ${Math.round(options)}
        ${'aggregate'}            | ${aggregate}
        ${'liabilities'}          | ${liabilities}
        ${'expenses'}             | ${expenses}
        ${'fti'}                  | ${fti}
        ${'pastYearAverageSpend'} | ${pastYearAverageSpend}
      `('should return the correct $prop value', ({ prop, value }) => {
        expect.assertions(1);
        expect(getNetWorthTable(state)[1]).toStrictEqual(
          expect.objectContaining({
            [prop]: value,
          }),
        );
      });
    });

    describe('for the third row in the view', () => {
      const savingsSAYE = Math.round(698 * 123.6) + Math.round(94 * 200.1);

      const assets = 9752 + 11237 + 1051343 + 165 * 0.865 * 100 + 21500000 + savingsSAYE;
      const liabilities = 21939 + 18420900;

      const pastExpenses = 1000 + 50 + 150 + 10 + 50 + 900 + 13 + 90 + 1000 + 65;
      const expenses = 400 + 20 + 10 + 95 + 134;

      const pastYearAverageSpend = (pastExpenses + expenses) * (12 / 3);

      const fti = Math.round(
        (assets - liabilities) * ((28 + (58 + 31) / 365) / pastYearAverageSpend),
      );

      const options = Math.round(101 * (95.57 - 77.65)) + Math.round(698 * (182.3 - 123.6));

      const aggregate = {
        [Aggregate.cashEasyAccess]: Math.round(9752 + 1051343),
        [Aggregate.cashOther]: Math.round(165 * 0.865 * 100 + savingsSAYE),
        [Aggregate.stocks]: 0,
        [Aggregate.pension]: 11237,
        [Aggregate.realEstate]: 21500000,
        [Aggregate.mortgage]: -18420900,
      };

      it.each`
        prop                      | value
        ${'id'}                   | ${numericHash('real-entry-id-b')}
        ${'date'}                 | ${new Date('2018-03-31')}
        ${'assets'}               | ${Math.round(assets)}
        ${'options'}              | ${options}
        ${'aggregate'}            | ${aggregate}
        ${'liabilities'}          | ${liabilities}
        ${'expenses'}             | ${expenses}
        ${'fti'}                  | ${fti}
        ${'pastYearAverageSpend'} | ${pastYearAverageSpend}
      `('should return the correct $prop value', ({ prop, value }) => {
        expect.assertions(1);
        expect(getNetWorthTable(state)[2]).toStrictEqual(
          expect.objectContaining({
            [prop]: value,
          }),
        );
      });
    });
  });

  describe('getIlliquidEquity', () => {
    const now = new Date('2018-05-02');

    const principal = 26755400;
    const paymentsRemaining = 250;
    const interestRate = 2.76; // percent
    const appreciationRate = 5; // percent

    const stateWithIlliquidEquity: State = {
      ...testState,
      netWorth: {
        ...testState.netWorth,
        subcategories: [
          {
            id: numericHash('real-house-subcategory-id'),
            categoryId: numericHash('real-house-category-id'),
            subcategory: 'My house',
            hasCreditLimit: null,
            appreciationRate,
            opacity: 0.15,
          },
          {
            id: numericHash('real-mortgage-subcategory-id'),
            categoryId: numericHash('real-mortgage-category-id'),
            subcategory: 'My mortgage',
            hasCreditLimit: false,
            opacity: 0.1,
          },
        ],
        entries: [
          {
            id: numericHash('entry-id-a1'),
            date: new Date('2018-04-30'),
            values: [
              {
                subcategory: numericHash('real-mortgage-subcategory-id'),
                loan: {
                  principal,
                  paymentsRemaining,
                  rate: interestRate,
                  paid: 123,
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

    it('should get the illiquid equity values up to the present month', () => {
      expect.assertions(3);

      const expectedAprilValue = 34500000;
      const expectedAprilDebt = -26755400;

      const presentEquity = getIlliquidEquity(now)(stateWithIlliquidEquity).slice(0, 4);

      expect(presentEquity).toHaveLength(4);
      expect(presentEquity).toStrictEqual([
        { value: 0, debt: -0 }, // Jan 18
        { value: 0, debt: -0 }, // Feb 18
        { value: 0, debt: -0 }, // Mar 18
        { value: expectedAprilValue, debt: expectedAprilDebt }, // Apr 18
      ]);

      expect(presentEquity).toMatchInlineSnapshot(`
        Array [
          Object {
            "debt": -0,
            "value": 0,
          },
          Object {
            "debt": -0,
            "value": 0,
          },
          Object {
            "debt": -0,
            "value": 0,
          },
          Object {
            "debt": -26755400,
            "value": 34500000,
          },
        ]
      `);
    });

    it('should use the latest loan rate/terms/principal data to predict the future equity', () => {
      expect.assertions(8);

      const monthlyDebtPaid = 140386.57786325; // PMT(0.0276^(1/12), 250, 267554) - monthly payment

      const principalMay = principal * (1 + interestRate / 100) ** (1 / 12) - monthlyDebtPaid;
      const principalJun = principalMay * (1 + interestRate / 100) ** (1 / 12) - monthlyDebtPaid;
      const principalJul = principalJun * (1 + interestRate / 100) ** (1 / 12) - monthlyDebtPaid;

      const assetValueMay = 34500000 * (1 + appreciationRate / 100) ** (1 / 12);
      const assetValueJun = assetValueMay * (1 + appreciationRate / 100) ** (1 / 12);
      const assetValueJul = assetValueJun * (1 + appreciationRate / 100) ** (1 / 12);

      const forecastEquity = getIlliquidEquity(now)(stateWithIlliquidEquity).slice(4);

      expect(forecastEquity).toHaveLength(3);

      expect(forecastEquity[0].value / 100).toBeCloseTo(assetValueMay / 100, 1);
      expect(forecastEquity[1].value / 100).toBeCloseTo(assetValueJun / 100, 1);
      expect(forecastEquity[2].value / 100).toBeCloseTo(assetValueJul / 100, 1);

      expect(forecastEquity[0].debt / 100).toBeCloseTo(-principalMay / 100, 1);
      expect(forecastEquity[1].debt / 100).toBeCloseTo(-principalJun / 100, 1);
      expect(forecastEquity[2].debt / 100).toBeCloseTo(-principalJul / 100, 1);

      expect(forecastEquity).toMatchInlineSnapshot(`
        Array [
          Object {
            "debt": -26675785.850005087,
            "value": 34640557.27053587,
          },
          Object {
            "debt": -26595990.863798123,
            "value": 34781687.1887906,
          },
          Object {
            "debt": -26516014.630626306,
            "value": 34923392.087801866,
          },
        ]
      `);
    });
  });

  describe('getNetWorthBreakdown', () => {
    describe.each`
      dimension   | width  | height
      ${'width'}  | ${0}   | ${100}
      ${'height'} | ${100} | ${0}
    `('when the $dimension is zero', ({ width, height }) => {
      it('should return null', () => {
        expect.assertions(1);
        expect(getNetWorthBreakdown(state.netWorth.entries[0], width, height)(state)).toBeNull();
      });
    });

    it('should have a top level assets/liabilities split', () => {
      expect.assertions(3);
      const resultJan18 = getNetWorthBreakdown(state.netWorth.entries[0], 84, 120)(state);
      const resultFeb18 = getNetWorthBreakdown(state.netWorth.entries[1], 84, 120)(state);
      const resultMar18 = getNetWorthBreakdown(state.netWorth.entries[2], 84, 120)(state);

      expect(resultJan18).toStrictEqual([
        expect.objectContaining({ name: 'Assets (£210k)', total: 21000000 }),
        expect.objectContaining({ name: 'Liabilities (£193k)', total: 19319500 }),
      ]);

      expect(resultFeb18).toStrictEqual([
        expect.objectContaining({ name: 'Assets (£233k)', total: 23289360 }),
        expect.objectContaining({ name: 'Liabilities (£188k)', total: 18752951 }),
      ]);

      expect(resultMar18).toStrictEqual([
        expect.objectContaining({ name: 'Assets (£227k)', total: 22734469 }),
        expect.objectContaining({ name: 'Liabilities (£184k)', total: 18442839 }),
      ]);
    });

    it('should set the overall assets color', () => {
      expect.assertions(1);
      const resultFeb18 = getNetWorthBreakdown(state.netWorth.entries[1], 84, 120)(state);

      expect(
        resultFeb18?.find((compare) => compare.name.startsWith('Assets'))?.color,
      ).toMatchInlineSnapshot(`"#d8e9d3"`);
    });

    it('should set the overall liabilities color', () => {
      expect.assertions(1);
      const resultFeb18 = getNetWorthBreakdown(state.netWorth.entries[1], 84, 120)(state);

      expect(
        resultFeb18?.find((compare) => compare.name.startsWith('Liabilities'))?.color,
      ).toMatchInlineSnapshot(`"#f5cacb"`);
    });

    it('should set individual colors based on the category color', () => {
      expect.assertions(2);
      const resultFeb18 = getNetWorthBreakdown(state.netWorth.entries[1], 84, 120)(state);

      const cashEasyAccessBlock = resultFeb18
        ?.find((compare) => compare.name.startsWith('Assets'))
        ?.subTree?.find((compare) => compare.name.startsWith('Cash (easy access)'));

      const creditCardBlock = resultFeb18
        ?.find((compare) => compare.name.startsWith('Liabilities'))
        ?.subTree?.find((compare) => compare.name.startsWith('Credit cards'));

      expect(cashEasyAccessBlock?.color).toBe('#00ff00'); // check test state
      expect(creditCardBlock?.color).toBe('#fc0000');
    });

    it('should set the opacity of individual values at the subcategory level', () => {
      expect.assertions(2);
      const resultFeb18 = getNetWorthBreakdown(state.netWorth.entries[1], 84, 120)(state);

      const bankBlock = resultFeb18
        ?.find((compare) => compare.name.startsWith('Assets'))
        ?.subTree?.find((compare) => compare.name.startsWith('Cash (easy access)'))
        ?.subTree?.find((compare) => compare.name.startsWith('My bank'));

      const creditCardBlock = resultFeb18
        ?.find((compare) => compare.name.startsWith('Liabilities'))
        ?.subTree?.find((compare) => compare.name.startsWith('Credit card'))
        ?.subTree?.find((compare) => compare.name.startsWith('My credit card'));

      expect(bankBlock?.color).toBe('rgba(255,255,255,0.125)');
      expect(creditCardBlock?.color).toBe('rgba(255,255,255,0.15)');
    });
  });
});
