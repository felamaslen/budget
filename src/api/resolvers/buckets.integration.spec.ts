import gql from 'graphql-tag';
import { sql } from 'slonik';

import { seedData } from '~api/__tests__/fixtures';
import { getPool } from '~api/modules/db';
import { App, getTestApp } from '~api/test-utils/create-server';
import {
  AnalysisPage,
  InvestmentBucket,
  ListBucketsResponse,
  Maybe,
  Mutation,
  MutationSetInvestmentBucketArgs,
  MutationUpsertBucketArgs,
  Query,
  QueryListBucketsArgs,
  SetInvestmentBucketResponse,
  UpsertBucketResponse,
} from '~api/types';

describe('Bucket resolvers', () => {
  let app: App;
  beforeAll(async () => {
    app = await getTestApp();
  });

  describe('Query ListBuckets', () => {
    beforeEach(async () => {
      await seedData(app.uid);
      await getPool().connect(async (db) => {
        await db.query(sql`DELETE FROM buckets WHERE uid = ${app.uid}`);
        await db.query(sql`
        INSERT INTO buckets (uid, page, filter_category, value)
        SELECT * FROM ${sql.unnest(
          [
            [app.uid, 'income', null, 400000],
            [app.uid, 'income', 'Side work', 450000],
            [app.uid, 'food', 'Snacks', 3000],
            [app.uid, 'general', null, 20000],
          ],
          ['int4', 'page_category', 'text', 'int4'],
        )}
        `);
      });
    });

    const query = gql`
      query ListBuckets($startDate: String!, $endDate: String!) {
        listBuckets(startDate: $startDate, endDate: $endDate) {
          buckets {
            id
            page
            filterCategory
            expectedValue
            actualValue
          }
          investmentBucket {
            expectedValue
            purchaseValue
          }
          error
        }
      }
    `;

    const setup = async (): Promise<Maybe<ListBucketsResponse>> => {
      const res = await app.authGqlClient.query<Query, QueryListBucketsArgs>({
        query,
        variables: {
          startDate: '2018-03-01',
          endDate: '2018-03-31',
        },
      });
      return res.data?.listBuckets ?? null;
    };

    it('should return the list of explicitly set buckets, with their values', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.buckets).toStrictEqual(
        expect.arrayContaining<NonNullable<ListBucketsResponse['buckets']>[0]>(
          [
            {
              id: expect.any(Number),
              page: AnalysisPage.Income,
              filterCategory: null,
              expectedValue: 400000,
              actualValue: 0,
            },
            {
              id: expect.any(Number),
              page: AnalysisPage.Income,
              filterCategory: 'Side work',
              expectedValue: 450000,
              actualValue: 433201,
            },
            {
              id: expect.any(Number),
              page: AnalysisPage.Bills,
              filterCategory: null,
              expectedValue: 0,
              actualValue: 72500 + 3902,
            },
            {
              id: 0,
              page: AnalysisPage.Food,
              filterCategory: null,
              expectedValue: 0,
              actualValue: 19239 + 91923,
            },
            {
              id: expect.any(Number),
              page: AnalysisPage.Food,
              filterCategory: 'Snacks',
              expectedValue: 3000,
              actualValue: 2239,
            },
            {
              id: expect.any(Number),
              page: AnalysisPage.General,
              filterCategory: null,
              expectedValue: 20000,
              actualValue: 1231 + 9912, // exclude house purchases
            },
            {
              id: 0,
              page: AnalysisPage.Social,
              filterCategory: null,
              expectedValue: 0,
              actualValue: 61923,
            },
            {
              id: 0,
              page: AnalysisPage.Holiday,
              filterCategory: null,
              expectedValue: 0,
              actualValue: 11023 + 23991,
            },
          ].map(expect.objectContaining),
        ),
      );
    });

    describe('Investment bucket', () => {
      it('should use the investment purchase value from the database', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res?.investmentBucket).toStrictEqual(
          expect.objectContaining(<InvestmentBucket>{ purchaseValue: 5956000 }),
        );
      });

      describe('when there is an entry in the database', () => {
        beforeEach(async () => {
          await getPool().query(sql`
          INSERT INTO bucket_investment (uid, value)
          VALUES (${app.uid}, ${1234})
          ON CONFLICT (uid) DO UPDATE SET value = excluded.value
          `);
          await app.authGqlClient.clearStore();
        });

        it('should use the given expected value', async () => {
          expect.assertions(1);
          const res = await setup();
          expect(res?.investmentBucket).toStrictEqual(
            expect.objectContaining(<InvestmentBucket>{ expectedValue: 1234 }),
          );
        });
      });

      describe('when there is no entry in the database', () => {
        beforeEach(async () => {
          await getPool().query(sql`DELETE FROM bucket_investment WHERE uid = ${app.uid}`);
          await app.authGqlClient.clearStore();
        });

        it('should set the expected value to zero', async () => {
          expect.assertions(1);
          await app.authGqlClient.clearStore();
          const res = await setup();
          expect(res?.investmentBucket).toStrictEqual(
            expect.objectContaining(<InvestmentBucket>{ expectedValue: 0 }),
          );
        });
      });
    });

    it('should return a list of missing buckets with zero ID', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.buckets).toStrictEqual(
        expect.arrayContaining<NonNullable<ListBucketsResponse['buckets']>[0]>(
          [
            {
              id: 0,
              page: AnalysisPage.Bills,
              filterCategory: null,
              expectedValue: 0,
              actualValue: 72500 + 3902,
            },
            {
              id: 0,
              page: AnalysisPage.Social,
              filterCategory: null,
              expectedValue: 0,
              actualValue: 61923,
            },
            {
              id: 0,
              page: AnalysisPage.Holiday,
              filterCategory: null,
              expectedValue: 0,
              actualValue: 11023 + 23991,
            },
          ].map(expect.objectContaining),
        ),
      );
    });

    describe('when a page has no data for the given month', () => {
      it('should still have a bucket', async () => {
        expect.assertions(1);
        await getPool().query(
          sql`DELETE FROM list_standard WHERE page = ${'social'} AND uid = ${app.uid}`,
        );
        await app.authGqlClient.clearStore();
        const res = await setup();
        expect(res?.buckets).toStrictEqual(
          expect.arrayContaining<NonNullable<ListBucketsResponse['buckets']>[0]>(
            [
              {
                id: 0,
                page: AnalysisPage.Social,
                filterCategory: null,
                expectedValue: 0,
                actualValue: 0,
              },
            ].map(expect.objectContaining),
          ),
        );
      });
    });
  });

  describe('Mutation UpsertBucket', () => {
    beforeEach(async () => {
      await seedData(app.uid);
      await getPool().query(sql`DELETE FROM buckets WHERE uid = ${app.uid}`);
    });

    const mutation = gql`
      mutation UpsertBucket(
        $startDate: String!
        $endDate: String!
        $id: NonNegativeInt!
        $bucket: BucketInput!
      ) {
        upsertBucket(startDate: $startDate, endDate: $endDate, id: $id, bucket: $bucket) {
          buckets {
            id
            page
            filterCategory
            expectedValue
            actualValue
          }
          error
        }
      }
    `;

    const setup = async (id: number): Promise<Maybe<UpsertBucketResponse>> => {
      const res = await app.authGqlClient.mutate<Mutation, MutationUpsertBucketArgs>({
        mutation,
        variables: {
          startDate: '2018-03-01',
          endDate: '2018-03-31',
          id,
          bucket: {
            page: AnalysisPage.Holiday,
            filterCategory: 'a country',
            value: 15000,
          },
        },
      });
      return res.data?.upsertBucket ?? null;
    };

    describe('when the ID is zero', () => {
      it('should create the bucket in the database', async () => {
        expect.assertions(1);
        await setup(0);
        const result = await getPool().query(sql`SELECT * FROM buckets`);
        expect(result.rows).toStrictEqual(
          expect.arrayContaining([
            {
              id: expect.any(Number),
              uid: app.uid,
              page: 'holiday',
              filter_category: 'a country',
              value: 15000,
            },
          ]),
        );
      });

      it('should respond with the full list of buckets', async () => {
        expect.assertions(1);
        const res = await setup(0);
        expect(res?.buckets).toStrictEqual<UpsertBucketResponse['buckets']>(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              page: AnalysisPage.Holiday,
              filterCategory: 'a country',
              expectedValue: 15000,
              actualValue: 11023 + 23991,
            }),
          ]),
        );
      });
    });

    describe('when an existing bucket ID is given', () => {
      let id: number;

      beforeEach(async () => {
        const { rows } = await getPool().query<{ id: number }>(sql`
        INSERT INTO buckets (uid, page, filter_category, value)
        VALUES (${app.uid}, 'income', null, 400000)
        RETURNING id
        `);
        id = rows[0].id;
      });

      it('should update the given bucket in the database', async () => {
        expect.assertions(1);
        await setup(id);

        const result = await getPool().query(sql`SELECT * FROM buckets WHERE id = ${id}`);
        expect(result.rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id,
              uid: app.uid,
              page: 'holiday',
              filter_category: 'a country',
              value: 15000,
            }),
          ]),
        );
      });

      it('should respond with the full list of buckets', async () => {
        expect.assertions(1);
        const res = await setup(id);
        expect(res?.buckets).toStrictEqual<UpsertBucketResponse['buckets']>(
          expect.arrayContaining([
            expect.objectContaining({
              id,
              page: AnalysisPage.Holiday,
              filterCategory: 'a country',
              expectedValue: 15000,
              actualValue: 11023 + 23991,
            }),
          ]),
        );
      });
    });
  });

  describe('Mutation SetInvestmentBucket', () => {
    const mutation = gql`
      mutation SetInvestmentBucket($value: NonNegativeInt!) {
        setInvestmentBucket(value: $value) {
          expectedValue
          error
        }
      }
    `;

    const setup = async (value: number): Promise<Maybe<SetInvestmentBucketResponse>> => {
      const res = await app.authGqlClient.mutate<Mutation, MutationSetInvestmentBucketArgs>({
        mutation,
        variables: { value },
      });
      return res.data?.setInvestmentBucket ?? null;
    };

    describe('when there is an entry in the database', () => {
      beforeEach(async () => {
        await getPool().query(sql`
        INSERT INTO bucket_investment (uid, value)
        VALUES (${app.uid}, ${1234})
        ON CONFLICT (uid) DO UPDATE SET value = excluded.value
        `);
      });

      it('should update the entry value', async () => {
        expect.assertions(1);
        await setup(5678);
        const { rows } = await getPool().query(sql`
        SELECT * FROM bucket_investment WHERE uid = ${app.uid}
        `);
        expect(rows).toStrictEqual([{ uid: app.uid, value: 5678 }]);
      });

      it('should return the updated value', async () => {
        expect.assertions(1);
        const res = await setup(5678);
        expect(res).toStrictEqual(
          expect.objectContaining<SetInvestmentBucketResponse>({
            error: null,
            expectedValue: 5678,
          }),
        );
      });
    });

    describe('when there is no entry in the database', () => {
      beforeEach(async () => {
        await getPool().query(sql`DELETE FROM bucket_investment WHERE uid = ${app.uid}`);
      });

      it('should create the entry value', async () => {
        expect.assertions(1);
        await setup(5678);
        const { rows } = await getPool().query(sql`
        SELECT * FROM bucket_investment WHERE uid = ${app.uid}
        `);
        expect(rows).toStrictEqual([{ uid: app.uid, value: 5678 }]);
      });

      it('should return the updated value', async () => {
        expect.assertions(1);
        const res = await setup(5678);
        expect(res).toStrictEqual(
          expect.objectContaining(<SetInvestmentBucketResponse>{
            error: null,
            expectedValue: 5678,
          }),
        );
      });
    });
  });
});
