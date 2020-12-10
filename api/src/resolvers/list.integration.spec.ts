import { gql } from 'apollo-boost';
import { format, addDays } from 'date-fns';
import sinon from 'sinon';

import { App, getTestApp } from '~api/test-utils/create-server';
import {
  CrudResponseCreate,
  CrudResponseUpdate,
  CrudResponseDelete,
  ListItemStandardInput,
  ListReadResponse,
  ListTotalsResponse,
  Maybe,
  Mutation,
  MutationCreateListItemArgs,
  MutationDeleteListItemArgs,
  MutationUpdateListItemArgs,
  PageListStandard as PageList,
  Query,
  QueryReadListArgs,
  RawDate,
  RawDateDeep,
  ReceiptInput,
  MutationCreateReceiptArgs,
  ReceiptCreated,
  ReceiptPage,
} from '~api/types';

describe('Standard list resolvers', () => {
  let app: App;
  let clock: sinon.SinonFakeTimers;
  beforeAll(async () => {
    clock = sinon.useFakeTimers(new Date('2020-04-20'));
    app = await getTestApp();
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
        }
        olderExists
        weekly
        total
      }
    }
  `;

  const readQueryExtended = gql`
    query ReadListExtended($page: PageListExtended!, $offset: Int, $limit: Int) {
      readListExtended(page: $page, offset: $offset, limit: $limit) {
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

  const readTotalsQuery = gql`
    query ReadListTotals($page: PageListStandard!) {
      readListTotals(page: $page) {
        error
        total
        weekly
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

  const income = {
    date: '2020-04-20',
    item: 'Salary (my job)',
    cost: 328967, // bit of a misnomer for this route :)
  };
  const incomeDelta = {
    item: 'Different salary (changed jobs)',
  };

  const bill = {
    date: '2020-04-02',
    item: 'Rent',
    cost: 174910,
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
    page                | extended | testItem   | delta
    ${PageList.Income}  | ${false} | ${income}  | ${incomeDelta}
    ${PageList.Bills}   | ${false} | ${bill}    | ${billDelta}
    ${PageList.Food}    | ${true}  | ${food}    | ${foodDelta}
    ${PageList.General} | ${true}  | ${general} | ${generalDelta}
    ${PageList.Holiday} | ${true}  | ${holiday} | ${holidayDelta}
    ${PageList.Social}  | ${true}  | ${social}  | ${socialDelta}
  `(
    '$page resolvers',
    ({
      page,
      extended,
      testItem,
      delta,
    }: {
      page: PageList;
      extended: boolean;
      testItem: RawDate<ListItemStandardInput>;
      delta: Partial<RawDate<ListItemStandardInput>>;
    }) => {
      const clearDb = async (): Promise<void> => {
        await app.db(page).where({ item: testItem.item }).del();
        await app.db(page).where({ item: delta.item }).del();
      };

      beforeEach(clearDb);

      describe(`create ${page}`, () => {
        const setup = async (): Promise<Maybe<CrudResponseCreate>> => {
          const res = await app.authGqlClient.mutate<
            Mutation,
            RawDateDeep<MutationCreateListItemArgs>
          >({
            mutation: createMutation,
            variables: {
              page,
              fakeId: 0,
              input: {
                ...testItem,
              } as RawDate<ListItemStandardInput>,
            },
          });
          return res.data?.createListItem ?? null;
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

          const row = await app
            .db(page)
            .where({
              id: res?.id,
              uid: app.uid,
            })
            .first();

          expect(row).toStrictEqual(
            expect.objectContaining({
              ...testItem,
              date: new Date(testItem.date),
            }),
          );
        });
      });

      describe(`read ${page}`, () => {
        const readItems = async (
          pageNumber?: number,
          limit?: number,
        ): Promise<Maybe<ListReadResponse>> => {
          await app.authGqlClient.clearStore();
          const res = await app.authGqlClient.query<Query, QueryReadListArgs>({
            query: extended ? readQueryExtended : readQuery,
            variables: {
              page,
              offset: pageNumber ?? null,
              limit: limit ?? null,
            },
          });
          return (extended ? res.data?.readListExtended : res.data?.readList) ?? null;
        };

        const setup = async (
          data: Record<string, unknown> = testItem,
          pageNumber?: number,
          limit?: number,
        ): Promise<{ id: number; res: Maybe<ListReadResponse> }> => {
          await app.db(page).truncate();
          const [id] = await app
            .db(page)
            .insert({ uid: app.uid, ...data })
            .returning('id');

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
            await app.db(page).truncate();

            await app.db(page).insert(
              Array(10)
                .fill(0)
                .map((_, index) => ({
                  uid: app.uid,
                  ...testItem,
                  date: format(addDays(baseDate, -index), 'yyyy-MM-dd'),
                })),
            );

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

        describe('totals', () => {
          const setupTotals = async (): Promise<Maybe<ListTotalsResponse>> => {
            await app.authGqlClient.clearStore();
            const res = await app.authGqlClient.query<Query, QueryReadListArgs>({
              query: readTotalsQuery,
              variables: { page },
            });
            return res.data?.readListTotals ?? null;
          };

          it('should respond with the total cost', async () => {
            expect.assertions(2);

            const [{ sum }] = await app
              .db(page)
              .sum<{ sum: string }[]>('cost')
              .where({ uid: app.uid });

            const res = await setupTotals();

            expect(res?.total).toBe(Number(sum));

            await app.db(page).insert({ ...testItem, uid: app.uid, cost: 124356 });

            const resAfter = await setupTotals();

            expect(resAfter?.total).toBe(Number(sum) + 124356);
          });

          it('should respond with the weekly cost', async () => {
            expect.assertions(1);
            const res = await setupTotals();
            expect(res?.weekly).toStrictEqual(expect.any(Number));
          });
        });
      });

      describe(`update ${page}`, () => {
        const setup = async (): Promise<{ existingId: number; res: Maybe<CrudResponseUpdate> }> => {
          const [existingId] = await app
            .db(page)
            .insert({ ...testItem, uid: app.uid })
            .returning('id');

          const res = await app.authGqlClient.mutate<
            Mutation,
            RawDateDeep<MutationUpdateListItemArgs>
          >({
            mutation: updateMutation,
            variables: {
              page,
              id: existingId,
              input: {
                ...testItem,
                ...delta,
              },
            },
          });
          return { existingId, res: res.data?.updateListItem ?? null };
        };

        it('should respond with a null error', async () => {
          expect.assertions(1);
          const { res } = await setup();
          expect(res?.error).toBeNull();
        });

        it('should update the item in the database', async () => {
          expect.assertions(1);
          const { existingId } = await setup();

          const row = await app.db(page).where({ id: existingId }).first();

          expect(row).toStrictEqual(
            expect.objectContaining({
              ...testItem,
              ...delta,
              date: new Date(delta.date ?? testItem.date),
            }),
          );
        });
      });

      describe(`delete ${page}`, () => {
        const setup = async (): Promise<{ id: number; res: Maybe<CrudResponseDelete> }> => {
          const [existingId] = await app
            .db(page)
            .insert({ ...testItem, uid: app.uid })
            .returning('id');

          const res = await app.authGqlClient.mutate<Mutation, MutationDeleteListItemArgs>({
            mutation: deleteMutation,
            variables: { page, id: existingId },
          });

          return {
            id: existingId,
            res: res.data?.deleteListItem ?? null,
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

          expect(await app.db(page).where({ id }).first()).toBeUndefined();
        });
      });
    },
  );

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
      await app.db('food').where({ uid: app.uid, item: 'Blueberries' }).del();
      await app.db('general').where({ uid: app.uid, item: 'Bin liners' }).del();
      await app.db('holiday').where({ uid: app.uid, item: 'Gift card' }).del();

      const res = await app.authGqlClient.mutate<Mutation, RawDate<MutationCreateReceiptArgs>>({
        mutation,
        variables: {
          date,
          shop,
          items,
        },
      });
      return res.data?.createReceipt ?? null;
    };

    it('should create all the items in the database', async () => {
      expect.assertions(3);

      await setup();

      const rowsFood = await app.db('food').select();
      const rowsGeneral = await app.db('general').select();
      const rowsSocial = await app.db('social').select();

      expect(rowsFood).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            uid: app.uid,
            item: 'Blueberries',
            category: 'Fruit',
            cost: 123,
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
            cost: 405,
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
            cost: 5050,
            shop,
          }),
        ]),
      );
    });

    it('should respond with the created IDs', async () => {
      expect.assertions(5);

      const res = await setup();

      const rowFood = await app.db('food').where({ uid: app.uid, item: 'Blueberries' }).first();
      const rowGeneral = await app
        .db('general')
        .where({ uid: app.uid, item: 'Bin liners' })
        .first();
      const rowSocial = await app.db('social').where({ uid: app.uid, item: 'Gift card' }).first();

      expect(rowFood.id).toStrictEqual(expect.any(Number));
      expect(rowGeneral.id).toStrictEqual(expect.any(Number));
      expect(rowSocial.id).toStrictEqual(expect.any(Number));

      expect(res?.items).toHaveLength(3);

      expect(res?.items).toStrictEqual(
        expect.arrayContaining(
          [{ id: rowFood.id }, { id: rowGeneral.id }, { id: rowSocial.id }].map(
            expect.objectContaining,
          ),
        ),
      );
    });
  });
});
