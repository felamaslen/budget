import gql from 'graphql-tag';
import moize from 'moize';
import sinon from 'sinon';
import { sql } from 'slonik';

import { seedData } from '~api/__tests__/fixtures';
import { getPool } from '~api/modules/db';
import { App, getTestApp } from '~api/test-utils/create-server';
import { runQuery } from '~api/test-utils/gql';
import {
  AnalysisGroupBy,
  AnalysisPage,
  AnalysisPeriod,
  AnalysisResponse,
  CategoryCostTreeDeep,
  Maybe,
  QueryAnalysisArgs,
  QueryAnalysisDeepArgs,
} from '~api/types';

describe('analysis resolvers', () => {
  let clock: sinon.SinonFakeTimers;
  let app: App;
  beforeAll(async () => {
    clock = sinon.useFakeTimers(new Date('2018-04-20'));
    app = await getTestApp();
    await seedData(app.uid);
  });
  afterAll(async () => {
    clock.restore();
  });

  const query = gql`
    query Analysis($period: AnalysisPeriod!, $groupBy: AnalysisGroupBy!, $page: Int) {
      analysis(period: $period, groupBy: $groupBy, page: $page) {
        description
        startDate
        endDate
        cost {
          item
          tree {
            category
            sum
          }
        }
      }
    }
  `;

  describe('grouping by year / category', () => {
    const setup = async (): Promise<Maybe<AnalysisResponse>> => {
      const res = await runQuery<QueryAnalysisArgs>(app, query, {
        period: AnalysisPeriod.Year,
        groupBy: AnalysisGroupBy.Category,
      });
      return res?.analysis ?? null;
    };

    it('should return cost data', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res).toStrictEqual(
        expect.objectContaining({
          cost: expect.arrayContaining([
            expect.objectContaining({
              item: 'bills',
              tree: expect.arrayContaining([
                expect.objectContaining({ category: 'Housing', sum: 72500 }),
                expect.objectContaining({ category: 'Utilities', sum: 3902 }),
              ]),
            }),
            expect.objectContaining({
              item: 'food',
              tree: expect.arrayContaining([
                expect.objectContaining({ category: 'Food', sum: 111162 }),
                expect.objectContaining({ category: 'Snacks', sum: 2239 }),
              ]),
            }),
            expect.objectContaining({
              item: 'general',
              tree: expect.arrayContaining([
                expect.objectContaining({ category: 'Foo', sum: 11143 }),
              ]),
            }),
            expect.objectContaining({
              item: 'holiday',
              tree: expect.arrayContaining([
                expect.objectContaining({ category: 'a country', sum: 35014 }),
              ]),
            }),
            expect.objectContaining({
              item: 'social',
              tree: expect.arrayContaining([
                expect.objectContaining({ category: 'Bar', sum: 61923 }),
              ]),
            }),
          ]),
        }),
      );
    });

    it('should return income data, excluding deductions', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.cost).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: 'income',
            tree: expect.arrayContaining([
              expect.objectContaining({ category: 'Side work', sum: 433201 - (39765 + 10520) }),
            ]),
          }),
        ]),
      );
    });

    it('should return a description', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.description).toMatchInlineSnapshot(`"2018"`);
    });

    it('should return a start and end date', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res).toStrictEqual(
        expect.objectContaining({
          startDate: '2018-01-01',
          endDate: '2018-12-31',
        }),
      );
    });

    describe('on leap years', () => {
      const setupLeapYear = async (): Promise<Maybe<AnalysisResponse>> => {
        const res = await runQuery<QueryAnalysisArgs>(app, query, {
          period: AnalysisPeriod.Year,
          groupBy: AnalysisGroupBy.Category,
          page: 2,
        });

        return res?.analysis ?? null;
      };

      it('should return data from the given year', async () => {
        expect.assertions(2);
        const res = await setupLeapYear();
        expect(res?.description).toMatchInlineSnapshot(`"2016"`);
        expect(res?.cost).toMatchInlineSnapshot(`
          Array [
            Object {
              "__typename": "CategoryCostTree",
              "item": "bills",
              "tree": Array [],
            },
            Object {
              "__typename": "CategoryCostTree",
              "item": "food",
              "tree": Array [],
            },
            Object {
              "__typename": "CategoryCostTree",
              "item": "general",
              "tree": Array [],
            },
            Object {
              "__typename": "CategoryCostTree",
              "item": "holiday",
              "tree": Array [],
            },
            Object {
              "__typename": "CategoryCostTree",
              "item": "income",
              "tree": Array [],
            },
            Object {
              "__typename": "CategoryCostTree",
              "item": "social",
              "tree": Array [],
            },
          ]
        `);
      });
    });

    it('should ignore certain expense categories', async () => {
      expect.assertions(2);

      await getPool().query(sql`
      INSERT INTO list_standard (page, uid, date, item, category, value, shop)
      VALUES (${'general'}, ${
        app.uid
      }, ${'2018-03-11'}, ${'Down payment'}, ${'House purchase'}, ${1700000}, ${'Solicitors'})
      `);

      const res = await setup();
      expect(res).toStrictEqual(
        expect.objectContaining({
          cost: expect.arrayContaining([
            expect.objectContaining({
              item: 'general',
              tree: expect.arrayContaining([
                expect.objectContaining({ category: 'Foo', sum: 9912 + 1231 }),
              ]),
            }),
          ]),
        }),
      );

      expect(res).not.toStrictEqual(
        expect.objectContaining({
          cost: expect.arrayContaining([
            expect.objectContaining({
              item: 'general',
              tree: expect.arrayContaining([
                expect.objectContaining({ category: 'House purchase' }),
              ]),
            }),
          ]),
        }),
      );
    });
  });

  describe('grouping by month / shop / second page', () => {
    const setup = moize.promise(async (): Promise<Maybe<AnalysisResponse>> => {
      const res = await runQuery<QueryAnalysisArgs>(app, query, {
        period: AnalysisPeriod.Month,
        groupBy: AnalysisGroupBy.Shop,
        page: 1,
      });
      return res?.analysis ?? null;
    });

    it('should return cost data for the month', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.cost).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: 'bills',
            tree: expect.arrayContaining([
              expect.objectContaining({ category: 'My bank', sum: 72500 }),
              expect.objectContaining({ category: 'My energy company', sum: 3902 }),
            ]),
          }),
          expect.objectContaining({
            item: 'food',
            tree: expect.arrayContaining([
              expect.objectContaining({ category: 'Tesco', sum: 19239 }),
              expect.objectContaining({ category: 'Morrisons', sum: 91923 }),
            ]),
          }),
          expect.objectContaining({
            item: 'general',
            tree: expect.arrayContaining([
              expect.objectContaining({ category: 'Amazon', sum: 1231 }),
              expect.objectContaining({ category: 'Hardware store', sum: 9912 }),
            ]),
          }),
          expect.objectContaining({
            item: 'holiday',
            tree: expect.arrayContaining([
              expect.objectContaining({ category: 'Travel agents', sum: 11023 }),
              expect.objectContaining({ category: 'Skyscanner', sum: 23991 }),
            ]),
          }),
          expect.objectContaining({
            item: 'social',
            tree: expect.arrayContaining([
              expect.objectContaining({ category: 'Some pub', sum: 61923 }),
            ]),
          }),
        ]),
      );
    });

    it('should return income data, excluding deductions', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.cost).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: 'income',
            tree: expect.arrayContaining([
              expect.objectContaining({ category: 'Contract', sum: 433201 - (39765 + 10520) }),
            ]),
          }),
        ]),
      );
    });

    it('should return a description for the month', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.description).toMatchInlineSnapshot(`"March 2018"`);
    });

    it('should return a start and end date', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res).toStrictEqual(
        expect.objectContaining({
          startDate: '2018-03-01',
          endDate: '2018-03-31',
        }),
      );
    });
  });

  describe('grouping by week / category', () => {
    const setup = moize.promise(async (): Promise<Maybe<AnalysisResponse>> => {
      const res = await runQuery<QueryAnalysisArgs>(app, query, {
        period: AnalysisPeriod.Week,
        groupBy: AnalysisGroupBy.Category,
      });
      return res?.analysis ?? null;
    });

    it('should return cost data for the week', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.cost).toMatchInlineSnapshot(`
        Array [
          Object {
            "__typename": "CategoryCostTree",
            "item": "bills",
            "tree": Array [],
          },
          Object {
            "__typename": "CategoryCostTree",
            "item": "food",
            "tree": Array [],
          },
          Object {
            "__typename": "CategoryCostTree",
            "item": "general",
            "tree": Array [],
          },
          Object {
            "__typename": "CategoryCostTree",
            "item": "holiday",
            "tree": Array [],
          },
          Object {
            "__typename": "CategoryCostTree",
            "item": "income",
            "tree": Array [],
          },
          Object {
            "__typename": "CategoryCostTree",
            "item": "social",
            "tree": Array [],
          },
        ]
      `);
    });

    it('should return a description for the week', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.description).toMatchInlineSnapshot(`"Week beginning April 16, 2018"`);
    });

    it('should return a start and end date', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res).toStrictEqual(
        expect.objectContaining({
          startDate: '2018-04-16',
          endDate: '2018-04-22',
        }),
      );
    });
  });

  describe('deep query', () => {
    const queryDeep = gql`
      query AnalysisDeep(
        $category: AnalysisPage!
        $period: AnalysisPeriod!
        $groupBy: AnalysisGroupBy!
        $page: Int
      ) {
        analysisDeep(category: $category, period: $period, groupBy: $groupBy, page: $page) {
          item
          tree {
            category
            sum
          }
        }
      }
    `;

    const setup = async (): Promise<Maybe<CategoryCostTreeDeep[]>> => {
      const res = await runQuery<QueryAnalysisDeepArgs>(app, queryDeep, {
        category: AnalysisPage.Food,
        period: AnalysisPeriod.Month,
        groupBy: AnalysisGroupBy.Category,
        page: 1,
      });
      return res?.analysisDeep ?? null;
    };

    it('should return grouped cost data for the category in the given period', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: 'Food',
            tree: expect.arrayContaining([
              expect.objectContaining({ category: 'Breakfast', sum: 19239 }),
              expect.objectContaining({ category: 'Lunch', sum: 91923 }),
            ]),
          }),
          expect.objectContaining({
            item: 'Snacks',
            tree: expect.arrayContaining([
              expect.objectContaining({ category: 'Nuts', sum: 2239 }),
            ]),
          }),
        ]),
      );
    });
  });
});
