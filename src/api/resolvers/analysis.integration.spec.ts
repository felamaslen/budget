import gql from 'graphql-tag';
import moize from 'moize';
import sinon from 'sinon';

import { seedData } from '~api/__tests__/fixtures';
import { App, getTestApp } from '~api/test-utils/create-server';
import {
  AnalysisGroupBy,
  AnalysisPage,
  AnalysisPeriod,
  AnalysisResponse,
  CategoryCostTreeDeep,
  Maybe,
  Query,
  QueryAnalysisArgs,
  QueryAnalysisDeepArgs,
} from '~api/types';

describe('Analysis resolvers', () => {
  let clock: sinon.SinonFakeTimers;
  let app: App;
  beforeAll(async () => {
    clock = sinon.useFakeTimers(new Date('2018-04-20'));
    app = await getTestApp();
    await seedData(app.uid, app.db);
  });
  afterAll(async () => {
    clock.restore();
  });

  const query = gql`
    query Analysis($period: AnalysisPeriod!, $groupBy: AnalysisGroupBy!, $page: Int) {
      analysis(period: $period, groupBy: $groupBy, page: $page) {
        description
        cost {
          item
          tree {
            category
            sum
          }
        }
        saved
        timeline
      }
    }
  `;

  describe('Grouping by year / category', () => {
    const setup = moize.promise(
      async (): Promise<Maybe<AnalysisResponse>> => {
        const res = await app.authGqlClient.query<Query, QueryAnalysisArgs>({
          query,
          variables: {
            period: AnalysisPeriod.Year,
            groupBy: AnalysisGroupBy.Category,
          },
        });
        return res.data?.analysis ?? null;
      },
    );

    it('should return cost data', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res).toStrictEqual(
        expect.objectContaining({
          cost: expect.arrayContaining([
            expect.objectContaining({
              item: 'bills',
              tree: expect.arrayContaining([
                expect.objectContaining({ category: 'Rent', sum: 72500 }),
                expect.objectContaining({ category: 'Electricity', sum: 3902 }),
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

    it('should return a description', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.description).toMatchInlineSnapshot(`"2018"`);
    });

    it('should return a saved number', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.saved).toMatchInlineSnapshot(`135318`);
    });

    it('should return timeline data', async () => {
      expect.assertions(3);
      const res = await setup();
      expect(res?.timeline).toBeInstanceOf(Array);
      expect(res?.timeline).toHaveLength(365);
      expect(res?.timeline?.slice(80, 90)).toMatchInlineSnapshot(`
        Array [
          Array [],
          Array [],
          Array [],
          Array [
            76402,
            113401,
            11143,
            35014,
            61923,
          ],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
        ]
      `);
    });

    describe('on leap years', () => {
      const setupLeapYear = moize.promise(
        async (): Promise<Maybe<AnalysisResponse>> => {
          const res = await app.authGqlClient.query<Query, QueryAnalysisArgs>({
            query,
            variables: {
              period: AnalysisPeriod.Year,
              groupBy: AnalysisGroupBy.Category,
              page: 2,
            },
          });

          return res.data?.analysis ?? null;
        },
      );

      it('should return data from the given year', async () => {
        expect.assertions(3);
        const res = await setupLeapYear();
        expect(res?.description).toMatchInlineSnapshot(`"2016"`);
        expect(res?.saved).toMatchInlineSnapshot(`0`);
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
              "item": "social",
              "tree": Array [],
            },
          ]
        `);
      });

      it('should return 366 items in the timeline', async () => {
        expect.assertions(1);
        const res = await setupLeapYear();
        expect(res?.timeline).toHaveLength(366);
      });
    });
  });

  describe('Grouping by month / shop / second page', () => {
    const setup = moize.promise(
      async (): Promise<Maybe<AnalysisResponse>> => {
        const res = await app.authGqlClient.query<Query, QueryAnalysisArgs>({
          query,
          variables: {
            period: AnalysisPeriod.Month,
            groupBy: AnalysisGroupBy.Shop,
            page: 1,
          },
        });
        return res.data?.analysis ?? null;
      },
    );

    it('should return cost data for the month', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.cost).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: 'bills',
            tree: expect.arrayContaining([
              expect.objectContaining({ category: 'Rent', sum: 72500 }),
              expect.objectContaining({ category: 'Electricity', sum: 3902 }),
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

    it('should return a description for the month', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.description).toMatchInlineSnapshot(`"March 2018"`);
    });

    it('should return a saved number for the month', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.saved).toMatchInlineSnapshot(`135318`);
    });

    it('should return timeline data', async () => {
      expect.assertions(3);
      const res = await setup();
      expect(res?.timeline).toBeInstanceOf(Array);
      expect(res?.timeline).toHaveLength(31); // 31 days in March
      expect(res?.timeline).toMatchInlineSnapshot(`
        Array [
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [
            76402,
            113401,
            11143,
            35014,
            61923,
          ],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
        ]
      `);
    });
  });

  describe('Grouping by week / category', () => {
    const setup = moize.promise(
      async (): Promise<Maybe<AnalysisResponse>> => {
        const res = await app.authGqlClient.query<Query, QueryAnalysisArgs>({
          query,
          variables: {
            period: AnalysisPeriod.Week,
            groupBy: AnalysisGroupBy.Category,
          },
        });
        return res.data?.analysis ?? null;
      },
    );

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

    it('should return a saved number for the week', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.saved).toMatchInlineSnapshot(`0`);
    });

    it('should not return timeline data', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.timeline).toBeNull();
    });
  });

  describe('Deep query', () => {
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

    const setup = moize.promise(
      async (): Promise<Maybe<CategoryCostTreeDeep[]>> => {
        const res = await app.authGqlClient.query<Query, QueryAnalysisDeepArgs>({
          query: queryDeep,
          variables: {
            category: AnalysisPage.Food,
            period: AnalysisPeriod.Month,
            groupBy: AnalysisGroupBy.Category,
            page: 1,
          },
        });
        return res.data?.analysisDeep ?? null;
      },
    );

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
