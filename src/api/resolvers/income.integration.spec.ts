import { addDays, formatISO } from 'date-fns';
import gql from 'graphql-tag';
import sinon from 'sinon';
import { sql } from 'slonik';

import { getPool } from '~api/modules/db';
import type { IncomeDeductionRow } from '~api/queries/income';
import { App, getTestApp } from '~api/test-utils/create-server';
import {
  CrudResponseCreate,
  Income,
  IncomeDeduction,
  IncomeInput,
  IncomeReadResponse,
  Maybe,
  Mutation,
  MutationCreateIncomeArgs,
  MutationDeleteIncomeArgs,
  MutationUpdateIncomeArgs,
  Query,
  QueryReadIncomeArgs,
} from '~api/types';
import { CrudResponseDelete, CrudResponseUpdate, PageListStandard } from '~client/types/gql';
import type { RawDate, RawDateDeep } from '~shared/types';

describe('income resolvers', () => {
  let app: App;
  let clock: sinon.SinonFakeTimers;
  beforeAll(async () => {
    clock = sinon.useFakeTimers(new Date('2020-04-20'));
    app = await getTestApp();
  });
  afterAll(async () => {
    clock.restore();
  });

  const testIncome: RawDate<IncomeInput, 'date'> = {
    date: '2020-04-20',
    item: 'Salary',
    cost: 328967, // bit of a misnomer for this route :)
    category: 'Mainline',
    shop: 'My company',
    deductions: [
      { name: 'Income tax', value: -196020 },
      { name: 'NI', value: -41920 },
    ],
  };

  const incomeDelta: Partial<RawDate<IncomeInput, 'date'>> = {
    item: 'Different salary (changed jobs)',
    deductions: [
      { name: 'Income tax', value: -196020 },
      { name: 'SAYE', value: -50000 },
    ],
  };

  const mutationCreate = gql`
    mutation CreateIncome($fakeId: Int!, $input: IncomeInput!) {
      createIncome(fakeId: $fakeId, input: $input) {
        error
        id
      }
    }
  `;

  describe('createIncome', () => {
    const setup = async (): Promise<Maybe<CrudResponseCreate>> => {
      const res = await app.authGqlClient.mutate<Mutation, RawDateDeep<MutationCreateIncomeArgs>>({
        mutation: mutationCreate,
        variables: {
          fakeId: 0,
          input: {
            ...testIncome,
          },
        },
      });
      return res.data?.createIncome ?? null;
    };

    it('should respond with a null error', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.error).toBeNull();
    });

    it('should respond with the inserted or updated IDs', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.id).toStrictEqual(expect.any(Number));
    });

    it('should create an item in the database', async () => {
      expect.assertions(1);
      const res = await setup();

      const { rows } = await getPool().query(sql`
      SELECT * FROM list_standard WHERE id = ${res?.id as number} AND uid = ${app.uid}
      `);

      expect(rows[0]).toStrictEqual(
        expect.objectContaining({
          date: new Date(testIncome.date),
          item: testIncome.item,
          category: testIncome.category,
          shop: testIncome.shop,
          value: testIncome.cost,
        }),
      );
    });

    it('should create deduction rows', async () => {
      expect.assertions(2);
      const res = await setup();

      const { rows } = await getPool().query(sql`
      SELECT * FROM income_deductions WHERE list_id = ${res?.id as number}
      `);

      expect(rows).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<Partial<IncomeDeductionRow>>({
            id: expect.any(Number),
            name: 'Income tax',
            value: -196020,
          }),
          expect.objectContaining<Partial<IncomeDeductionRow>>({
            id: expect.any(Number),
            name: 'NI',
            value: -41920,
          }),
        ]),
      );
      expect(rows).toHaveLength(2);
    });
  });

  describe('readIncome', () => {
    const query = gql`
      query ReadIncome($offset: Int, $limit: Int) {
        readIncome(offset: $offset, limit: $limit) {
          error
          items {
            id
            date
            item
            cost
            category
            shop
            deductions {
              name
              value
            }
          }
          olderExists
          weekly
          total {
            gross
            deductions {
              name
              value
            }
          }
        }
      }
    `;

    const readIncome = async (
      pageNumber?: number,
      limit?: number,
    ): Promise<Maybe<IncomeReadResponse>> => {
      await app.authGqlClient.clearStore();
      const res = await app.authGqlClient.query<Query, QueryReadIncomeArgs>({
        query,
        variables: {
          offset: pageNumber ?? null,
          limit: limit ?? null,
        },
      });
      return res.data?.readIncome ?? null;
    };

    const setup = async (
      data: IncomeInput = testIncome,
      pageNumber?: number,
      limit?: number,
    ): Promise<{ id: number; res: Maybe<IncomeReadResponse> }> => {
      const id = await getPool().connect(async (db) => {
        await db.query(
          sql`DELETE FROM list_standard WHERE uid = ${app.uid} AND page = ${'income'}`,
        );
        const { rows } = await db.query<{ id: number }>(sql`
          INSERT INTO list_standard (page, uid, date, item, category, value, shop)
          VALUES (${'income'}, ${app.uid}, ${data.date}, ${data.item}, ${data.category}, ${
          data.cost
        }, ${data.shop})
          RETURNING id
          `);
        await db.query(sql`
          INSERT INTO income_deductions (list_id, name, value)
          VALUES ${sql.join(
            [
              sql`(${rows[0].id}, ${testIncome.deductions[0].name}, ${testIncome.deductions[0].value})`,
              sql`(${rows[0].id}, ${testIncome.deductions[1].name}, ${testIncome.deductions[1].value})`,
            ],
            sql`, `,
          )}
          `);
        return rows[0].id;
      });

      const res = await readIncome(pageNumber, limit);

      return { id, res };
    };

    it('should return a null error', async () => {
      expect.assertions(1);
      const { res } = await setup();

      expect(res?.error).toBeNull();
    });

    it('should return a list of items', async () => {
      expect.assertions(1);
      const { id, res } = await setup();

      expect(res?.items).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<RawDate<Income, 'date'>>({
            id,
            ...testIncome,
            deductions: expect.arrayContaining(testIncome.deductions.map(expect.objectContaining)),
          }),
        ]),
      );
    });

    describe('aggregated totals', () => {
      const aggregatedIncomeTestValues: IncomeInput[] = [
        {
          ...testIncome,
          item: 'Salary 0',
          date: '2020-01-31',
          cost: 550000,
          deductions: [
            { name: 'Income tax', value: -112032 },
            { name: 'NI', value: -29876 },
          ],
        },
        {
          ...testIncome,
          item: 'Salary 1',
          date: '2020-02-15',
          cost: 308333,
          deductions: [
            { name: 'Income tax', value: -33482 },
            { name: 'NI', value: -19869 },
            { name: 'Student loan', value: -5893 },
          ],
        },
        {
          ...testIncome,
          item: 'Salary 2',
          date: '2020-03-21',
          cost: 708333,
          deductions: [
            { name: 'Income tax', value: -187723 },
            { name: 'NI', value: -43292 },
          ],
        },
      ];

      const createIncomeWithAggregatedTotals = async (): Promise<void> => {
        await getPool().query(
          sql`DELETE FROM list_standard WHERE uid = ${app.uid} AND page = ${PageListStandard.Income}`,
        );
        await aggregatedIncomeTestValues.reduce<Promise<void>>(
          async (prev, input): Promise<void> => {
            await prev;
            await app.authGqlClient.mutate<Mutation, RawDateDeep<MutationCreateIncomeArgs>>({
              mutation: mutationCreate,
              variables: {
                fakeId: 0,
                input,
              },
            });
          },
          Promise.resolve(),
        );
      };

      it('should include the total (gross) value', async () => {
        expect.assertions(1);
        await createIncomeWithAggregatedTotals();
        const res = await readIncome(0, 10);

        const expectedTotalGrossIncome = 550000 + 308333 + 708333;

        expect(res?.total?.gross).toBe(expectedTotalGrossIncome);
      });

      it('should return the weekly value less deductions', async () => {
        expect.assertions(1);
        await createIncomeWithAggregatedTotals();
        const res = await readIncome(0, 10);

        expect(res?.weekly).toMatchInlineSnapshot(`162071`);
      });

      it('should include aggregated deductions', async () => {
        expect.assertions(2);
        await createIncomeWithAggregatedTotals();
        const res = await readIncome(0, 10);

        const expectedTotalDeductionIncomeTax = 112032 + 33482 + 187723;
        const expectedTotalDeductionNI = 29876 + 19869 + 43292;
        const expectedTotalDeductionStudentLoan = 5893;

        expect(res?.total?.deductions).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining<IncomeDeduction>({
              name: 'Income tax',
              value: expectedTotalDeductionIncomeTax,
            }),
            expect.objectContaining<IncomeDeduction>({
              name: 'NI',
              value: expectedTotalDeductionNI,
            }),
            expect.objectContaining<IncomeDeduction>({
              name: 'Student loan',
              value: expectedTotalDeductionStudentLoan,
            }),
          ]),
        );
        expect(res?.total?.deductions).toHaveLength(3);
      });
    });

    it('should return the older exists value', async () => {
      expect.assertions(1);
      const { res } = await setup();

      expect(res?.olderExists).toStrictEqual(expect.any(Boolean));
    });

    describe('pagination', () => {
      const baseDate = new Date('2020-04-20');

      const setupForPagination = async (
        pageNumber?: number,
        limit?: number,
      ): Promise<Maybe<IncomeReadResponse>> => {
        await getPool().connect(async (db) => {
          await db.query(
            sql`DELETE FROM list_standard WHERE page = ${'income'} AND uid = ${app.uid}`,
          );
          await db.query<{ id: number }>(sql`
          INSERT INTO list_standard (page, uid, date, item, category, value, shop)
          SELECT * FROM ${sql.unnest(
            Array(10)
              .fill(0)
              .map((_, index) => [
                'income',
                app.uid,
                formatISO(addDays(baseDate, -index), { representation: 'date' }),
                testIncome.item,
                testIncome.category,
                testIncome.cost,
                testIncome.shop,
              ]),
            ['page_category', 'int4', 'date', 'text', 'text', 'int4', 'text'],
          )}
          RETURNING id
          `);
        });

        return readIncome(pageNumber, limit);
      };

      it('should apply an optional limit', async () => {
        expect.assertions(2);
        const resPage0Limit3 = await setupForPagination(0, 3);

        expect(resPage0Limit3?.items).toHaveLength(3);
        expect(resPage0Limit3?.olderExists).toBe(true);
      });

      it('should apply an optional page number', async () => {
        expect.assertions(1);
        const resPage1Limit3 = await setupForPagination(1, 3);

        expect(resPage1Limit3?.items).toStrictEqual([
          expect.objectContaining({
            date: '2020-04-17',
          }),
          expect.objectContaining({
            date: '2020-04-16',
          }),
          expect.objectContaining({
            date: '2020-04-15',
          }),
        ]);
      });

      it('should set olderExists to false on the last page', async () => {
        expect.assertions(2);
        const resPageNextFromLast = await setupForPagination(2, 3);
        const resPageLast = await setupForPagination(3, 3);

        expect(resPageNextFromLast?.olderExists).toBe(true);
        expect(resPageLast?.olderExists).toBe(false);
      });
    });
  });

  describe('updateIncome', () => {
    const mutation = gql`
      mutation updateIncome($id: Int!, $input: IncomeInput!) {
        updateIncome(id: $id, input: $input) {
          error
        }
      }
    `;

    const setup = async (): Promise<{ existingId: number; res: Maybe<CrudResponseUpdate> }> => {
      let existingId = 0;
      await getPool().connect(async (db) => {
        const { rows } = await db.query<{ id: number }>(sql`
          INSERT INTO list_standard (page, uid, date, item, category, value, shop)
          VALUES (
            ${'income'},
            ${app.uid},
            ${testIncome.date},
            ${testIncome.item},
            ${testIncome.category},
            ${testIncome.cost},
            ${testIncome.shop}
          )
          RETURNING id
          `);
        existingId = rows[0].id;
        await db.query(sql`
          INSERT INTO income_deductions (list_id, name, value)
          VALUES ${sql.join(
            [
              sql`(${existingId}, ${'Income tax'}, ${-195000})`,
              sql`(${existingId}, ${'NI'}, ${-42030})`,
            ],
            sql`, `,
          )}
          `);
      });

      const res = await app.authGqlClient.mutate<Mutation, RawDateDeep<MutationUpdateIncomeArgs>>({
        mutation,
        variables: {
          id: existingId,
          input: {
            ...testIncome,
            ...incomeDelta,
          },
        },
      });
      return { existingId, res: res.data?.updateIncome ?? null };
    };

    it('should respond with a null error', async () => {
      expect.assertions(1);
      const { res } = await setup();
      expect(res?.error).toBeNull();
    });

    it('should update the item in the database', async () => {
      expect.assertions(1);
      const { existingId } = await setup();

      const { rows } = await getPool().query(sql`
          SELECT * FROM list_standard WHERE id = ${existingId}
          `);

      expect(rows[0]).toStrictEqual(
        expect.objectContaining({
          uid: app.uid,
          page: 'income',
          date: new Date(incomeDelta.date ?? testIncome.date),
          item: incomeDelta.item ?? testIncome.item,
          category: incomeDelta.category ?? testIncome.category,
          shop: incomeDelta.shop ?? testIncome.shop,
          value: incomeDelta.cost ?? testIncome.cost,
        }),
      );
    });

    it('should upsert and delete (as necessary) the income deduction rows in the database', async () => {
      expect.assertions(1);
      const { existingId } = await setup();

      const { rows } = await getPool().query<IncomeDeductionRow>(sql`
          SELECT * FROM income_deductions WHERE list_id = ${existingId}
          `);

      expect(rows).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<Partial<IncomeDeductionRow>>({
            id: expect.any(Number),
            name: 'Income tax',
            value: -196020,
          }),
          expect.objectContaining<Partial<IncomeDeductionRow>>({
            id: expect.any(Number),
            name: 'SAYE',
            value: -50000,
          }),
        ]),
      );
    });
  });

  describe('deleteIncome', () => {
    const mutation = gql`
      mutation DeleteIncome($id: Int!) {
        deleteIncome(id: $id) {
          error
        }
      }
    `;
    const setup = async (): Promise<{ id: number; res: Maybe<CrudResponseDelete> }> => {
      let existingId = 0;
      await getPool().connect(async (db) => {
        const { rows } = await db.query<{ id: number }>(sql`
          INSERT INTO list_standard (page, uid, date, item, category, value, shop)
          VALUES (
            ${'income'},
            ${app.uid},
            ${testIncome.date},
            ${testIncome.item},
            ${testIncome.category},
            ${testIncome.cost},
            ${testIncome.shop}
          )
          RETURNING id
          `);
        existingId = rows[0].id;
        await db.query(sql`
          INSERT INTO income_deductions (list_id, name, value)
          VALUES ${sql.join(
            [
              sql`(${existingId}, ${'Income tax'}, ${-195000})`,
              sql`(${existingId}, ${'NI'}, ${-42030})`,
            ],
            sql`, `,
          )}
          `);
      });

      const res = await app.authGqlClient.mutate<Mutation, MutationDeleteIncomeArgs>({
        mutation,
        variables: { id: existingId },
      });

      return {
        id: existingId,
        res: res.data?.deleteIncome ?? null,
      };
    };

    it('should respond with a null error', async () => {
      expect.assertions(1);
      const { res } = await setup();

      expect(res?.error).toBeNull();
    });

    it('should delete the item from the database', async () => {
      expect.assertions(1);
      await setup();

      const { id } = await setup();

      const { rowCount } = await getPool().query(
        sql`SELECT * FROM list_standard WHERE page = ${'income'} AND uid = ${
          app.uid
        } AND id = ${id}`,
      );
      expect(rowCount).toBe(0);
    });
  });
});
