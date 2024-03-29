import { addDays, formatISO } from 'date-fns';
import gql from 'graphql-tag';
import sinon from 'sinon';
import { sql } from 'slonik';

import { getPool } from '~api/modules/db';
import { App, getTestApp, runMutation, runQuery, runSubscription } from '~api/test-utils';
import {
  CrudResponseCreate,
  CrudResponseUpdate,
  CrudResponseDelete,
  SubscriptionListChangedArgs,
  ListItemStandard,
  ListItemStandardInput,
  ListReadResponse,
  Maybe,
  MutationCreateListItemArgs,
  MutationDeleteListItemArgs,
  MutationUpdateListItemArgs,
  PageListStandard as PageList,
  QueryReadListArgs,
  ReceiptInput,
  ReceiptCreated,
  ReceiptPage,
  PageListStandard,
  ListSubscription,
} from '~api/types';
import { MutationCreateReceiptArgs, Subscription } from '~client/types/gql';
import type { RawDate } from '~shared/types';

describe('standard list resolvers', () => {
  let app: App;
  let clock: sinon.SinonFakeTimers;
  beforeAll(async () => {
    clock = sinon.useFakeTimers(new Date('2020-04-20'));
    app = await getTestApp({ subscriptions: true });
  });
  afterAll(async () => {
    clock.restore();
  });

  const createMutation = gql`
    mutation CreateListItem(
      $page: PageListStandard!
      $fakeId: Int!
      $input: ListItemStandardInput!
    ) {
      createListItem(page: $page, fakeId: $fakeId, input: $input) {
        error
        id
      }
    }
  `;

  const updateMutation = gql`
    mutation updateListItem($page: PageListStandard!, $id: Int!, $input: ListItemStandardInput!) {
      updateListItem(page: $page, id: $id, input: $input) {
        error
      }
    }
  `;

  const readQuery = gql`
    query ReadList($page: PageListStandard!, $offset: Int, $limit: Int) {
      readList(page: $page, offset: $offset, limit: $limit) {
        error
        items {
          id
          date
          item
          cost
          category
          shop
        }
        olderExists
        weekly
        total
      }
    }
  `;

  const deleteMutation = gql`
    mutation DeleteListItem($page: PageListStandard!, $id: Int!) {
      deleteListItem(page: $page, id: $id) {
        error
      }
    }
  `;

  const bill = {
    date: '2020-04-02',
    item: 'Rent',
    cost: 174910,
    category: 'Housing',
    shop: 'My landlord',
  };
  const billDelta = { item: 'Mortgage', cost: 155602 };

  const food = {
    date: '2020-04-10',
    item: 'Apples',
    category: 'Fruit',
    cost: 210,
    shop: 'Tesco',
  };
  const foodDelta = { item: 'Pears' };

  const general = {
    date: '2020-04-09',
    item: 'Pills',
    category: 'Medicine',
    cost: 799,
    shop: 'Boots',
  };
  const generalDelta = { item: 'Boots', category: 'Shoes' };

  const holiday = {
    date: '2020-05-23',
    item: 'Flight',
    category: 'Australia',
    cost: 156543,
    shop: 'skyscanner.com',
  };
  const holidayDelta = { item: 'Refund', category: 'Pandemic' };

  const social = {
    date: '2020-04-07',
    item: 'Pizza',
    category: 'Remote social',
    cost: 2945,
    shop: 'Dominoes',
  };
  const socialDelta = { item: 'Garlic bread' };

  describe.each`
    page                | testItem   | delta
    ${PageList.Bills}   | ${bill}    | ${billDelta}
    ${PageList.Food}    | ${food}    | ${foodDelta}
    ${PageList.General} | ${general} | ${generalDelta}
    ${PageList.Holiday} | ${holiday} | ${holidayDelta}
    ${PageList.Social}  | ${social}  | ${socialDelta}
  `(
    '$page resolvers',
    ({
      page,
      testItem,
      delta,
    }: {
      page: PageList;
      testItem: RawDate<ListItemStandardInput, 'date'>;
      delta: Partial<RawDate<ListItemStandardInput, 'date'>>;
    }) => {
      beforeEach(async () => {
        await getPool().query(
          sql`DELETE FROM list_standard WHERE page = ${page} AND item = ANY(${sql.array(
            [testItem.item, delta.item].filter((x: string | undefined): x is string => !!x),
            'text',
          )})`,
        );
      });

      describe(`create ${page}`, () => {
        const setup = async (): Promise<Maybe<CrudResponseCreate>> => {
          const res = await runMutation<MutationCreateListItemArgs>(app, createMutation, {
            page,
            fakeId: 0,
            input: {
              ...testItem,
            } as RawDate<ListItemStandardInput, 'date'>,
          });
          return res?.createListItem ?? null;
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
              page,
              date: new Date(testItem.date),
              item: testItem.item,
              category: testItem.category,
              shop: testItem.shop,
              value: testItem.cost,
            }),
          );
        });
      });

      describe(`read ${page}`, () => {
        const readItems = async (
          pageNumber?: number,
          limit?: number,
        ): Promise<Maybe<ListReadResponse>> => {
          const res = await runQuery<QueryReadListArgs>(app, readQuery, {
            page,
            offset: pageNumber ?? null,
            limit: limit ?? null,
          });
          return res?.readList ?? null;
        };

        const setup = async (
          data: ListItemStandardInput = testItem,
          pageNumber?: number,
          limit?: number,
        ): Promise<{ id: number; res: Maybe<ListReadResponse> }> => {
          const id = await getPool().connect(async (db) => {
            await db.query(
              sql`DELETE FROM list_standard WHERE uid = ${app.uid} AND page = ${page}`,
            );
            const { rows } = await db.query<{ id: number }>(sql`
            INSERT INTO list_standard (page, uid, date, item, category, value, shop)
            VALUES (${page}, ${app.uid}, ${data.date}, ${data.item}, ${data.category}, ${data.cost}, ${data.shop})
            RETURNING id
            `);
            return rows[0].id;
          });

          const res = await readItems(pageNumber, limit);

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
              expect.objectContaining({
                id,
                ...testItem,
              }),
            ]),
          );
        });

        it('should return the weekly value', async () => {
          expect.assertions(1);
          const { res } = await setup();

          expect(res?.weekly).toStrictEqual(expect.any(Number));
        });

        it('should return the total value', async () => {
          expect.assertions(1);
          const { res } = await setup();

          expect(res?.total).toStrictEqual(expect.any(Number));
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
          ): Promise<Maybe<ListReadResponse>> => {
            await getPool().connect(async (db) => {
              await db.query(
                sql`DELETE FROM list_standard WHERE page = ${page} AND uid = ${app.uid}`,
              );
              await db.query(sql`
              INSERT INTO list_standard (page, uid, date, item, category, value, shop)
              SELECT * FROM ${sql.unnest(
                Array(10)
                  .fill(0)
                  .map((_, index) => [
                    page,
                    app.uid,
                    formatISO(addDays(baseDate, -index), { representation: 'date' }),
                    testItem.item,
                    testItem.category,
                    testItem.cost,
                    testItem.shop,
                  ]),
                ['page_category', 'int4', 'date', 'text', 'text', 'int4', 'text'],
              )}
              `);
            });

            return readItems(pageNumber, limit);
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

      describe(`update ${page}`, () => {
        const setup = async (): Promise<{ existingId: number; res: Maybe<CrudResponseUpdate> }> => {
          const { rows } = await getPool().query<{ id: number }>(sql`
          INSERT INTO list_standard (page, uid, date, item, category, value, shop)
          VALUES (
            ${page},
            ${app.uid},
            ${testItem.date},
            ${testItem.item},
            ${testItem.category},
            ${testItem.cost},
            ${testItem.shop}
          )
          RETURNING id
          `);
          const existingId = rows[0].id;

          const res = await runMutation<MutationUpdateListItemArgs>(app, updateMutation, {
            page,
            id: existingId,
            input: {
              ...testItem,
              ...delta,
            },
          });
          return { existingId, res: res?.updateListItem ?? null };
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
              page,
              date: new Date(delta.date ?? testItem.date),
              item: delta.item ?? testItem.item,
              category: delta.category ?? testItem.category,
              shop: delta.shop ?? testItem.shop,
              value: delta.cost ?? testItem.cost,
            }),
          );
        });
      });

      describe(`delete ${page}`, () => {
        const setup = async (): Promise<{ id: number; res: Maybe<CrudResponseDelete> }> => {
          const { rows } = await getPool().query<{ id: number }>(sql`
          INSERT INTO list_standard (page, uid, date, item, category, value, shop)
          VALUES (
            ${page},
            ${app.uid},
            ${testItem.date},
            ${testItem.item},
            ${testItem.category},
            ${testItem.cost},
            ${testItem.shop}
          )
          RETURNING id
          `);
          const existingId = rows[0].id;

          const res = await runMutation<MutationDeleteListItemArgs>(app, deleteMutation, {
            page,
            id: existingId,
          });

          return {
            id: existingId,
            res: res?.deleteListItem ?? null,
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
            sql`SELECT * FROM list_standard WHERE page = ${page} AND uid = ${app.uid} AND id = ${id}`,
          );
          expect(rowCount).toBe(0);
        });
      });
    },
  );

  describe('list subscriptions', () => {
    const listChangedSubscription = gql`
      subscription ListChanged($pages: [PageListStandard!]!) {
        listChanged(pages: $pages) {
          page
          created {
            fakeId
            item {
              id
              date
              item
              category
              cost
              shop
            }
          }
          updated {
            id
            date
            item
            category
            cost
            shop
          }
          deleted

          overviewCost
          total
          weekly
        }
      }
    `;

    it('should listen to mutations against the given lists', async () => {
      expect.assertions(1);
      const [subscriptionResult, mutationResult] = await Promise.all([
        runSubscription<ListSubscription, SubscriptionListChangedArgs>(
          app,
          listChangedSubscription,
          { pages: [PageListStandard.General, PageListStandard.Food] },
        ),
        runMutation<MutationCreateListItemArgs>(app, createMutation, {
          page: PageListStandard.General,
          fakeId: -157,
          input: {
            ...general,
          },
        }),
      ]);

      expect(subscriptionResult).toStrictEqual<Partial<Subscription>>({
        listChanged: {
          page: PageListStandard.General,
          created: {
            fakeId: -157,
            item: {
              id: mutationResult?.createListItem?.id as number,
              ...general,
            },
          },
          updated: null,
          deleted: null,
          overviewCost: expect.arrayContaining([expect.any(Number)]),
          total: expect.any(Number),
          weekly: expect.any(Number),
        },
      });
    });
  });

  describe('createReceipt', () => {
    const mutation = gql`
      mutation CreateReceipt($date: Date!, $shop: String!, $items: [ReceiptInput!]!) {
        createReceipt(date: $date, shop: $shop, items: $items) {
          items {
            id
          }
        }
      }
    `;

    const date = '2020-04-20';
    const shop = "Sainsbury's";

    const items: ReceiptInput[] = [
      {
        page: ReceiptPage.Food,
        item: 'Blueberries',
        category: 'Fruit',
        cost: 123,
      },
      {
        page: ReceiptPage.General,
        item: 'Bin liners',
        category: 'Household',
        cost: 405,
      },
      {
        page: ReceiptPage.Social,
        item: 'Gift card',
        category: 'Gifts',
        cost: 5050,
      },
    ];

    const setup = async (): Promise<Maybe<ReceiptCreated>> => {
      await getPool().connect(async (db) => {
        await db.query(
          sql`DELETE FROM list_standard WHERE page = ${PageListStandard.Food} AND uid = ${
            app.uid
          } AND item = ${'Blueberries'}`,
        );
        await db.query(
          sql`DELETE FROM list_standard WHERE page = ${PageListStandard.General} AND uid = ${
            app.uid
          } AND item = ${'Bin liners'}`,
        );
        await db.query(
          sql`DELETE FROM list_standard WHERE page = ${PageListStandard.Social} AND uid = ${
            app.uid
          } AND item = ${'Gift card'}`,
        );
      });

      const res = await runMutation<MutationCreateReceiptArgs>(app, mutation, {
        date,
        shop,
        items,
      });
      return res?.createReceipt ?? null;
    };

    it('should create all the items in the database', async () => {
      expect.assertions(3);

      await setup();

      const { rows: rowsFood } = await getPool().query(
        sql`SELECT * FROM list_standard WHERE page = ${PageListStandard.Food}`,
      );
      const { rows: rowsGeneral } = await getPool().query(
        sql`SELECT * FROM list_standard WHERE page = ${PageListStandard.General}`,
      );
      const { rows: rowsSocial } = await getPool().query(
        sql`SELECT * FROM list_standard WHERE page = ${PageListStandard.Social}`,
      );

      expect(rowsFood).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            uid: app.uid,
            item: 'Blueberries',
            category: 'Fruit',
            value: 123,
            shop,
          }),
        ]),
      );

      expect(rowsGeneral).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            uid: app.uid,
            item: 'Bin liners',
            category: 'Household',
            value: 405,
            shop,
          }),
        ]),
      );

      expect(rowsSocial).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            uid: app.uid,
            item: 'Gift card',
            category: 'Gifts',
            value: 5050,
            shop,
          }),
        ]),
      );
    });

    it('should respond with the created IDs', async () => {
      expect.assertions(5);

      const res = await setup();

      const { rows: rowsFood } = await getPool().query<RawDate<ListItemStandard, 'date'>>(
        sql`SELECT * FROM list_standard WHERE page = ${'food'} AND uid = ${
          app.uid
        } AND item = ${'Blueberries'} LIMIT 1`,
      );
      const { rows: rowsGeneral } = await getPool().query<RawDate<ListItemStandard, 'date'>>(
        sql`SELECT * FROM list_standard WHERE page = ${'general'} AND uid = ${
          app.uid
        } AND item = ${'Bin liners'} LIMIT 1`,
      );
      const { rows: rowsSocial } = await getPool().query<RawDate<ListItemStandard, 'date'>>(
        sql`SELECT * FROM list_standard WHERE page = ${'social'} AND uid = ${
          app.uid
        } AND item = ${'Gift card'} LIMIT 1`,
      );

      expect(rowsFood[0].id).toStrictEqual(expect.any(Number));
      expect(rowsGeneral[0].id).toStrictEqual(expect.any(Number));
      expect(rowsSocial[0].id).toStrictEqual(expect.any(Number));

      expect(res?.items).toHaveLength(3);

      expect(res?.items).toStrictEqual(
        expect.arrayContaining(
          [{ id: rowsFood[0].id }, { id: rowsGeneral[0].id }, { id: rowsSocial[0].id }].map(
            expect.objectContaining,
          ),
        ),
      );
    });
  });
});
