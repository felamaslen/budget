import { ApolloQueryResult } from 'apollo-boost';
import gql from 'graphql-tag';
import sinon from 'sinon';
import { sql } from 'slonik';

import { seedData } from '~api/__tests__/fixtures';
import { getPool, withSlonik } from '~api/modules/db';
import type { NetWorthLoansRow } from '~api/queries';
import { App, getTestApp } from '~api/test-utils/create-server';
import {
  AsyncReturnType,
  CategoryRow,
  CreditLimit,
  CrudResponseCreate,
  CrudResponseDelete,
  CrudResponseUpdate,
  Maybe,
  Mutation,
  MutationCreateNetWorthCategoryArgs,
  MutationCreateNetWorthEntryArgs,
  MutationCreateNetWorthSubcategoryArgs,
  MutationDeleteNetWorthCategoryArgs,
  MutationDeleteNetWorthEntryArgs,
  MutationDeleteNetWorthSubcategoryArgs,
  MutationUpdateNetWorthCategoryArgs,
  MutationUpdateNetWorthEntryArgs,
  MutationUpdateNetWorthSubcategoryArgs,
  NetWorthCashTotal,
  NetWorthCategory,
  NetWorthCategoryInput,
  NetWorthCategoryType,
  NetWorthEntry,
  NetWorthEntryInput,
  NetWorthEntryOverview,
  NetWorthEntryRow,
  NetWorthValueObject,
  NetWorthSubcategory,
  NetWorthSubcategoryInput,
  Query,
  QueryReadNetWorthCategoriesArgs,
  QueryReadNetWorthSubcategoriesArgs,
  SubcategoryRow,
  ValueRowSelect,
} from '~api/types';
import type { Create, RawDate, RawDateDeep, RequiredNotNull } from '~shared/types';

describe('Net worth resolver', () => {
  let app: App;
  beforeAll(async () => {
    app = await getTestApp();
  });

  beforeEach(
    withSlonik(async (db) => {
      await db.query(sql`DELETE FROM net_worth_categories`);
      await db.query(sql`DELETE FROM net_worth`);
    }),
  );

  const category: NetWorthCategoryInput = {
    type: NetWorthCategoryType.Asset,
    category: 'Cash',
    color: '#33ff11',
    isOption: false,
  };

  const createCategories = async (inputs: NetWorthCategoryInput[]): Promise<number[]> => {
    const results = await Promise.all(
      inputs.map((input) =>
        app.authGqlClient.mutate<Mutation, MutationCreateNetWorthCategoryArgs>({
          mutation: gql`
            mutation CreateNetWorthCategory($input: NetWorthCategoryInput!) {
              createNetWorthCategory(input: $input) {
                id
                error
              }
            }
          `,
          variables: {
            input,
          },
        }),
      ),
    );
    if (!results.every((res) => res.data?.createNetWorthCategory?.id)) {
      throw new Error('Error creating categories for test');
    }
    return results.map((res) => res.data?.createNetWorthCategory?.id as number);
  };

  const createSubcategories = async (inputs: NetWorthSubcategoryInput[]): Promise<number[]> => {
    const results = await Promise.all(
      inputs.map((input) =>
        app.authGqlClient.mutate<Mutation, MutationCreateNetWorthSubcategoryArgs>({
          mutation: gql`
            mutation CreateNetWorthSubcategory($input: NetWorthSubcategoryInput!) {
              createNetWorthSubcategory(input: $input) {
                id
                error
              }
            }
          `,
          variables: {
            input,
          },
        }),
      ),
    );
    return results.map((res) => res.data?.createNetWorthSubcategory?.id as number);
  };

  describe('categories', () => {
    describe('createNetWorthCategory', () => {
      const mutation = gql`
        mutation CreateNetWorthCategory($input: NetWorthCategoryInput!) {
          createNetWorthCategory(input: $input) {
            id
            error
          }
        }
      `;

      const setup = async (input = category): Promise<Maybe<CrudResponseCreate>> => {
        const res = await app.authGqlClient.mutate<Mutation, MutationCreateNetWorthCategoryArgs>({
          mutation,
          variables: {
            input,
          },
        });
        return res.data?.createNetWorthCategory ?? null;
      };

      it('should respond with the created category ID', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res).toStrictEqual(
          expect.objectContaining({
            id: expect.any(Number),
            error: null,
          }),
        );
      });

      it('should create the category in the database', async () => {
        expect.assertions(2);
        const res = await setup();

        expect(res?.id).not.toBeUndefined();

        const rows = await getPool().query(sql`
        SELECT * FROM net_worth_categories
        WHERE id = ${res?.id as number} AND category = ${category.category}
        LIMIT 1
        `);

        expect(rows.rowCount).toBe(1);
      });

      it('should accept isOption value', async () => {
        expect.assertions(1);

        const res = await setup({ ...category, isOption: true });

        const { rows } = await getPool().query<RequiredNotNull<CategoryRow>>(sql`
        SELECT * FROM net_worth_categories
        WHERE id = ${res?.id as number}
        `);

        expect(rows[0].is_option).toBe(true);
      });
    });

    describe('readNetWorthCategories', () => {
      const query = gql`
        query ReadNetWorthCategories($id: Int) {
          readNetWorthCategories(id: $id) {
            id
            type
            category
            color
            isOption
          }
        }
      `;

      const setup = async (id?: Maybe<number>): Promise<Maybe<NetWorthCategory[]>> => {
        const res = await app.authGqlClient.query<Query, QueryReadNetWorthCategoriesArgs>({
          query,
          variables: { id },
        });

        return res.data.readNetWorthCategories ?? null;
      };

      describe('when passing an id', () => {
        it('should respond with the specified category', async () => {
          expect.assertions(2);

          const [id] = await createCategories([category]);

          const res = await setup(id);

          expect(res).toHaveLength(1);
          expect(res).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id,
                ...category,
              }),
            ]),
          );
        });
      });

      describe('when not passing an id', () => {
        const category0: NetWorthCategoryInput = {
          ...category,
          category: 'Category A',
        };
        const category1: NetWorthCategoryInput = {
          ...category,
          category: 'Category B',
        };

        it('should respond with all those categories belonging to the user', async () => {
          expect.assertions(2);

          await createCategories([category0, category1]);

          const res = await setup();

          expect(res).toHaveLength(2);

          expect(res).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                category: 'Category A',
              }),
              expect.objectContaining({
                category: 'Category B',
              }),
            ]),
          );
        });
      });
    });

    describe('updateNetWorthCategory', () => {
      const mutation = gql`
        mutation UpdateNetWorthCategory($id: Int!, $input: NetWorthCategoryInput!) {
          updateNetWorthCategory(id: $id, input: $input) {
            error
          }
        }
      `;

      const modifiedCategory = {
        ...category,
        category: 'Bank',
        isOption: true,
      };

      const setup = async (): Promise<{ id: number; res: Maybe<CrudResponseUpdate> }> => {
        const [id] = await createCategories([category]);

        const res = await app.authGqlClient.mutate<Mutation, MutationUpdateNetWorthCategoryArgs>({
          mutation,
          variables: {
            id,
            input: modifiedCategory,
          },
        });
        return { id, res: res.data?.updateNetWorthCategory ?? null };
      };

      it('should return a null error', async () => {
        expect.assertions(1);
        const { res } = await setup();

        expect(res?.error).toBeNull();
      });

      it('should update the category in the database', async () => {
        expect.assertions(1);
        const { id } = await setup();

        const { rows } = await getPool().query<RequiredNotNull<CategoryRow>>(sql`
        SELECT * FROM net_worth_categories
        WHERE id = ${id}
        `);

        expect(rows[0]).toStrictEqual(
          expect.objectContaining({
            category: 'Bank',
            is_option: true,
          }),
        );
      });
    });

    describe('deleteNetWorthCategory', () => {
      const mutation = gql`
        mutation DeleteNetWorthCategory($id: Int!) {
          deleteNetWorthCategory(id: $id) {
            error
          }
        }
      `;

      const setup = async (): Promise<{ id: number; res: Maybe<CrudResponseDelete> }> => {
        const [id] = await createCategories([category]);

        const res = await app.authGqlClient.mutate<Mutation, MutationDeleteNetWorthCategoryArgs>({
          mutation,
          variables: {
            id,
          },
        });
        return { id, res: res.data?.deleteNetWorthCategory ?? null };
      };

      it('should return a null error', async () => {
        expect.assertions(1);
        const { res } = await setup();
        expect(res?.error).toBeNull();
      });

      it('should delete the category from the database', async () => {
        expect.assertions(1);
        const { id } = await setup();
        const { rowCount } = await getPool().query<RequiredNotNull<CategoryRow>>(sql`
        SELECT * FROM net_worth_categories
        WHERE id = ${id}
        `);
        expect(rowCount).toBe(0);
      });
    });
  });

  describe('subcategories', () => {
    const subcategory: Create<Omit<NetWorthSubcategory, 'categoryId'>> = {
      subcategory: 'Current account',
      hasCreditLimit: null,
      appreciationRate: null,
      opacity: 0.8,
      isSAYE: null,
    };

    describe('createNetWorthSubcategory', () => {
      const mutation = gql`
        mutation CreateNetWorthSubcategory($input: NetWorthSubcategoryInput!) {
          createNetWorthSubcategory(input: $input) {
            id
            error
          }
        }
      `;

      const setup = async (categoryId?: number): Promise<Maybe<CrudResponseCreate>> => {
        const [postedCategoryId] = await createCategories([category]);

        const res = await app.authGqlClient.mutate<Mutation, MutationCreateNetWorthSubcategoryArgs>(
          {
            mutation,
            variables: {
              input: {
                ...subcategory,
                categoryId: categoryId ?? postedCategoryId,
              },
            },
          },
        );

        return res.data?.createNetWorthSubcategory ?? null;
      };

      it('should respond with the created subcategory ID', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res).toStrictEqual(
          expect.objectContaining({
            id: expect.any(Number),
            error: null,
          }),
        );
      });

      it('should create the subcategory in the database', async () => {
        expect.assertions(1);
        const res = await setup();

        const { rowCount } = await getPool().query<RequiredNotNull<SubcategoryRow>>(sql`
        SELECT * FROM net_worth_subcategories
        WHERE id = ${res?.id as number} AND subcategory = ${subcategory.subcategory}
        `);
        expect(rowCount).toBe(1);
      });

      describe('when the category does not exist', () => {
        const nonexistentCategoryId = 88664915;

        it('should return an error with no created ID', async () => {
          expect.assertions(2);
          const res = await setup(nonexistentCategoryId);
          expect(res?.id).toBeNull();
          expect(res?.error).toMatchInlineSnapshot(`"Category not found"`);
        });

        it('should not create a row in the database', async () => {
          expect.assertions(1);
          await setup(nonexistentCategoryId);

          const { rowCount } = await getPool().query<RequiredNotNull<SubcategoryRow>>(sql`
          SELECT * FROM net_worth_subcategories
          WHERE category_id = ${nonexistentCategoryId}
          `);
          expect(rowCount).toBe(0);
        });
      });

      describe('when the category is an option', () => {
        const setupSAYE = async (): Promise<Maybe<CrudResponseCreate>> => {
          const [postedCategoryId] = await createCategories([
            {
              type: NetWorthCategoryType.Asset,
              category: 'Options',
              color: '#00ffcc',
              isOption: true,
            },
          ]);

          const res = await app.authGqlClient.mutate<
            Mutation,
            MutationCreateNetWorthSubcategoryArgs
          >({
            mutation,
            variables: {
              input: {
                ...subcategory,
                categoryId: postedCategoryId,
                isSAYE: true,
              },
            },
          });

          return res.data?.createNetWorthSubcategory ?? null;
        };

        it('should accept an isSAYE value', async () => {
          expect.assertions(2);

          const res = await setupSAYE();

          expect(res?.id).toStrictEqual(expect.any(Number));
          const { rows } = await getPool().query<RequiredNotNull<SubcategoryRow>>(sql`
          SELECT * FROM net_worth_subcategories
          WHERE id = ${res?.id as number}
          `);
          expect(rows[0]).toStrictEqual(
            expect.objectContaining({
              subcategory: subcategory.subcategory,
              is_saye: true,
            }),
          );
        });
      });
    });

    describe('readNetWorthSubcategories', () => {
      const query = gql`
        query ReadNetWorthSubcategories($id: Int) {
          readNetWorthSubcategories(id: $id) {
            id
            categoryId
            subcategory
            hasCreditLimit
            appreciationRate
            isSAYE
            opacity
          }
        }
      `;

      const setup = async (id?: Maybe<number>): Promise<Maybe<NetWorthSubcategory[]>> => {
        const res = await app.authGqlClient.query<Query, QueryReadNetWorthSubcategoriesArgs>({
          query,
          variables: { id },
        });

        return res.data.readNetWorthSubcategories ?? null;
      };

      describe('when passing an id', () => {
        it('should respond with the given subcategory', async () => {
          expect.assertions(1);

          const [categoryId] = await createCategories([category]);
          const [subcategoryId] = await createSubcategories([
            {
              categoryId,
              ...subcategory,
            },
          ]);

          const result = await setup(subcategoryId);

          expect(result).toStrictEqual([
            expect.objectContaining({
              id: subcategoryId,
              categoryId,
              ...subcategory,
            }),
          ]);
        });
      });

      describe('when not passing an id', () => {
        it('should respond with the all the subcategories belonging to the user', async () => {
          expect.assertions(3);

          const [categoryId, categoryIdForeign] = await createCategories([
            category,
            { ...category, category: 'Foreign category' },
          ]);

          const subcategory0: NetWorthSubcategoryInput = {
            ...subcategory,
            categoryId,
            subcategory: 'Subcategory A',
          };
          const subcategory1: NetWorthSubcategoryInput = {
            ...subcategory,
            categoryId,
            subcategory: 'Subcategory B',
          };
          const subcategory2: NetWorthSubcategoryInput = {
            ...subcategory,
            categoryId: categoryIdForeign,
            subcategory: 'Subcategory C',
          };

          await createSubcategories([subcategory0, subcategory1, subcategory2]);

          await getPool().transaction(async (db) => {
            const {
              rows: [{ uid: foreignUid }],
            } = await db.query<{ uid: number }>(
              sql`
              INSERT INTO users (name, pin_hash, config)
              VALUES (${'Foreign user'}, ${'my-pin-hash'}, ${JSON.stringify({})})
              RETURNING uid
              `,
            );

            expect(foreignUid).toStrictEqual(expect.any(Number));

            await db.query(
              sql`UPDATE net_worth_categories SET uid = ${foreignUid} WHERE id = ${categoryIdForeign}`,
            );
          });

          const result = await setup();

          expect(result).toHaveLength(2);

          expect(result).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                ...subcategory,
                subcategory: 'Subcategory A',
              }),
              expect.objectContaining({
                ...subcategory,
                subcategory: 'Subcategory B',
              }),
            ]),
          );
        });
      });
    });

    describe('updateNetWorthSubcategory', () => {
      const mutation = gql`
        mutation UpdateNetWorthSubcategory($id: Int!, $input: NetWorthSubcategoryInput!) {
          updateNetWorthSubcategory(id: $id, input: $input) {
            error
          }
        }
      `;

      const modifiedSubcategory = {
        ...subcategory,
        subcategory: 'Savings account',
        appreciationRate: 6.5,
      };

      const setup = async (
        categoryId?: number,
      ): Promise<{ id: number; res: Maybe<CrudResponseUpdate> }> => {
        const [postedCategoryId] = await createCategories([category]);
        const [id] = await createSubcategories([
          {
            categoryId: postedCategoryId,
            ...subcategory,
          },
        ]);

        const res = await app.authGqlClient.mutate<Mutation, MutationUpdateNetWorthSubcategoryArgs>(
          {
            mutation,
            variables: {
              id,
              input: {
                categoryId: categoryId ?? postedCategoryId,
                ...modifiedSubcategory,
              },
            },
          },
        );

        return { id, res: res.data?.updateNetWorthSubcategory ?? null };
      };

      it('should return a null error', async () => {
        expect.assertions(1);
        const { res } = await setup();

        expect(res?.error).toBeNull();
      });

      it('should update the subcategory in the database', async () => {
        expect.assertions(1);
        const { id } = await setup();

        const { rows } = await getPool().query<RequiredNotNull<SubcategoryRow>>(sql`
        SELECT * FROM net_worth_subcategories
        WHERE id = ${id}
        `);

        expect(rows[0]).toStrictEqual(
          expect.objectContaining({
            subcategory: 'Savings account',
            appreciation_rate: 6.5,
          }),
        );
      });

      describe('when the category does not exist', () => {
        it('should respond with an error', async () => {
          expect.assertions(3);

          const nonexistentCategoryId = 163387;
          const { res } = await setup(nonexistentCategoryId);

          expect(res?.error).not.toBeNull();
          expect(res?.error).not.toBeUndefined();
          expect(res?.error).toMatchInlineSnapshot(`"Category not found"`);
        });
      });
    });

    describe('deleteNetWorthSubcategory', () => {
      const mutation = gql`
        mutation DeleteNetWorthSubcategory($id: Int!) {
          deleteNetWorthSubcategory(id: $id) {
            error
          }
        }
      `;

      const setup = async (): Promise<{ id: number; res: Maybe<CrudResponseDelete> }> => {
        const [categoryId] = await createCategories([category]);
        const [id] = await createSubcategories([
          {
            categoryId,
            ...subcategory,
          },
        ]);

        const res = await app.authGqlClient.mutate<Mutation, MutationDeleteNetWorthSubcategoryArgs>(
          {
            mutation,
            variables: { id },
          },
        );

        return { id, res: res.data?.deleteNetWorthSubcategory ?? null };
      };

      it('should return a null error', async () => {
        expect.assertions(1);
        const { res } = await setup();
        expect(res?.error).toBeNull();
      });

      it('should delete the subcategory from the database', async () => {
        expect.assertions(1);
        const { id } = await setup();
        const { rowCount } = await getPool().query<RequiredNotNull<SubcategoryRow>>(sql`
        SELECT * FROM net_worth_subcategories
        WHERE id = ${id}
        `);
        expect(rowCount).toBe(0);
      });
    });
  });

  describe('entries', () => {
    const categoryBank: Create<NetWorthCategory> = {
      type: NetWorthCategoryType.Asset,
      category: 'Bank',
      color: '#00ff00',
    };

    const categoryOptions: Create<NetWorthCategory> = {
      type: NetWorthCategoryType.Asset,
      category: 'Options',
      color: '#00ffcc',
      isOption: true,
    };

    const categoryHouse: Create<NetWorthCategory> = {
      type: NetWorthCategoryType.Asset,
      category: 'House',
      color: '#00ff32',
    };

    const categoryDebts: Create<NetWorthCategory> = {
      type: NetWorthCategoryType.Liability,
      category: 'My big debts',
      color: '#ffcc00',
      isOption: false,
    };

    const categoryCC: Create<NetWorthCategory> = {
      type: NetWorthCategoryType.Liability,
      category: 'Credit Cards',
      color: '#ff0000',
    };

    const subcategoryCurrentAccount: Create<NetWorthSubcategory> = {
      categoryId: 0,
      subcategory: 'Current account',
      hasCreditLimit: null,
      isSAYE: null,
      opacity: 0.8,
    };

    const subcategoryForeignCash: Create<NetWorthSubcategory> = {
      categoryId: 0,
      subcategory: 'Foreign cash',
      hasCreditLimit: null,
      isSAYE: null,
      opacity: 0.8,
    };

    const subcategoryOptions: Create<NetWorthSubcategory> = {
      categoryId: 0,
      subcategory: 'Company X Ord 5p',
      hasCreditLimit: null,
      isSAYE: false,
      opacity: 1,
    };

    const subcategoryHouse: Create<NetWorthSubcategory> = {
      categoryId: 0,
      subcategory: 'My house',
      hasCreditLimit: null,
      appreciationRate: 5.5,
      opacity: 1,
    };

    const subcategoryLoan: Create<NetWorthSubcategory> = {
      categoryId: 0,
      subcategory: 'My house mortgage',
      hasCreditLimit: false,
      isSAYE: null,
      opacity: 1,
    };

    const subcategoryMainCC: Create<NetWorthSubcategory> = {
      categoryId: 0,
      subcategory: 'Main credit card',
      hasCreditLimit: true,
      isSAYE: null,
      opacity: 0.5,
    };

    const subcategoryTravelCC: Create<NetWorthSubcategory> = {
      categoryId: 0,
      subcategory: 'Travel credit card',
      hasCreditLimit: true,
      isSAYE: null,
      opacity: 0.7,
    };

    type Parents = {
      categoryId: {
        bank: number;
        options: number;
        house: number;
        debts: number;
        cc: number;
      };
      subcategoryId: {
        currentAccount: number;
        foreignCash: number;
        options: number;
        house: number;
        SAYE: number;
        SAYE2: number;
        loan: number;
        mainCC: number;
        travelCC: number;
      };
    };

    const setupParents = async (): Promise<{
      parents: Parents;
      entryInput: RawDate<NetWorthEntryInput, 'date'>;
    }> => {
      const [
        categoryIdBank,
        categoryIdOptions,
        categoryIdHouse,
        categoryIdDebts,
        categoryIdCC,
      ] = await createCategories([
        categoryBank,
        categoryOptions,
        categoryHouse,
        categoryDebts,
        categoryCC,
      ]);

      const [
        subcategoryIdCurrentAccount,
        subcategoryIdForeignCash,
        subcategoryIdOptions,
        subcategoryIdSAYE,
        subcategoryIdSAYE2,
        subcategoryIdHouse,
        subcategoryIdLoan,
        subcategoryIdMainCC,
        subcategoryIdTravelCC,
      ] = await createSubcategories([
        { ...subcategoryCurrentAccount, categoryId: categoryIdBank },
        { ...subcategoryForeignCash, categoryId: categoryIdBank },
        { ...subcategoryOptions, categoryId: categoryIdOptions, isSAYE: false },
        {
          ...subcategoryOptions,
          categoryId: categoryIdOptions,
          subcategory: 'My SAYE options',
          isSAYE: true,
        },
        {
          ...subcategoryOptions,
          categoryId: categoryIdOptions,
          subcategory: 'My other SAYE options',
          isSAYE: true,
        },
        {
          ...subcategoryHouse,
          categoryId: categoryIdHouse,
        },
        { ...subcategoryLoan, categoryId: categoryIdDebts },
        { ...subcategoryMainCC, categoryId: categoryIdCC },
        { ...subcategoryTravelCC, categoryId: categoryIdCC },
      ]);

      const parents: Parents = {
        categoryId: {
          bank: categoryIdBank,
          options: categoryIdOptions,
          house: categoryIdHouse,
          debts: categoryIdDebts, // e.g. mortgage, bank loan, car loan
          cc: categoryIdCC,
        },
        subcategoryId: {
          currentAccount: subcategoryIdCurrentAccount,
          foreignCash: subcategoryIdForeignCash,
          options: subcategoryIdOptions,
          house: subcategoryIdHouse,
          SAYE: subcategoryIdSAYE,
          SAYE2: subcategoryIdSAYE2,
          loan: subcategoryIdLoan,
          mainCC: subcategoryIdMainCC,
          travelCC: subcategoryIdTravelCC,
        },
      };

      const entryInput: RawDate<NetWorthEntryInput, 'date'> = {
        date: '2020-04-14',
        values: [
          {
            subcategory: parents.subcategoryId.currentAccount,
            simple: 166523,
          },
          {
            subcategory: parents.subcategoryId.foreignCash,
            fx: [
              {
                value: 62000,
                currency: 'CNY',
              },
            ],
          },
          {
            subcategory: parents.subcategoryId.mainCC,
            simple: -15000,
          },
          {
            subcategory: parents.subcategoryId.travelCC,
            skip: true,
            simple: -1340,
          },
        ],
        creditLimit: [
          {
            subcategory: parents.subcategoryId.mainCC,
            value: 250000,
          },
          {
            subcategory: parents.subcategoryId.travelCC,
            value: 100000,
          },
        ],
        currencies: [
          {
            currency: 'CNY',
            rate: 0.113,
          },
        ],
      };

      return { parents, entryInput };
    };

    const createEntries = async (
      inputs: RawDateDeep<MutationCreateNetWorthEntryArgs>[],
    ): Promise<number[]> => {
      const results = await Promise.all(
        inputs.map((variables) =>
          app.authGqlClient.mutate<Mutation, RawDateDeep<MutationCreateNetWorthEntryArgs>>({
            mutation: gql`
              mutation CreateNetWorthEntry($input: NetWorthEntryInput!) {
                createNetWorthEntry(input: $input) {
                  id
                }
              }
            `,
            variables,
          }),
        ),
      );
      return results.map((res) => res.data?.createNetWorthEntry?.id as number);
    };
    describe('createNetWorthEntry', () => {
      const mutation = gql`
        mutation CreateNetWorthEntry($input: NetWorthEntryInput!) {
          createNetWorthEntry(input: $input) {
            id
            error
          }
        }
      `;

      const setup = async (): Promise<
        AsyncReturnType<typeof setupParents> & {
          res: Maybe<CrudResponseCreate>;
        }
      > => {
        const { parents, entryInput } = await setupParents();

        const res = await app.authGqlClient.mutate<
          Mutation,
          RawDateDeep<MutationCreateNetWorthEntryArgs>
        >({
          mutation,
          variables: {
            input: entryInput,
          },
        });
        return {
          res: res.data?.createNetWorthEntry ?? null,
          parents,
          entryInput,
        };
      };

      it('should respond with the entry id and null error', async () => {
        expect.assertions(1);

        const { res } = await setup();

        expect(res).toStrictEqual(
          expect.objectContaining({
            id: expect.any(Number),
            error: null,
          }),
        );
      });

      it('should create the entry and dependent items in the database', async () => {
        expect.assertions(7);

        const { res, parents } = await setup();
        const id = res?.id as number;

        const [
          { rows: rowsMain },
          { rows: rowValues },
          { rows: rowValuesFX },
          { rows: creditLimitRows },
          { rows: currencyRows },
        ] = await getPool().connect(async (db) =>
          Promise.all([
            db.query(sql`
            SELECT * FROM net_worth
            WHERE id = ${id}
            `),
            db.query<ValueRowSelect>(sql`
            SELECT * FROM net_worth_values
            WHERE net_worth_id = ${id}
            `),
            db.query(sql`
            SELECT nwfxv.* FROM net_worth_fx_values nwfxv
            INNER JOIN net_worth_values nwv ON nwv.id = nwfxv.values_id
            WHERE nwv.net_worth_id = ${id}
            `),
            db.query(sql`
            SELECT * FROM net_worth_credit_limit
            WHERE net_worth_id = ${id}
            `),
            db.query(sql`
            SELECT * FROM net_worth_currencies
            WHERE net_worth_id = ${id}
            `),
          ]),
        );

        expect(rowsMain[0]).toStrictEqual({
          id,
          date: new Date('2020-04-14'),
          uid: app.uid,
        });

        expect(rowValues).toHaveLength(4);
        expect(rowValues).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              subcategory: parents.subcategoryId.currentAccount,
              skip: null,
              value: 166523,
            }),
            expect.objectContaining({
              id: expect.any(Number),
              subcategory: parents.subcategoryId.foreignCash,
              skip: null,
              value: null,
            }),
            expect.objectContaining({
              subcategory: parents.subcategoryId.mainCC,
              skip: null,
              value: -15000,
            }),
            expect.objectContaining({
              subcategory: parents.subcategoryId.travelCC,
              skip: true,
              value: -1340,
            }),
          ]),
        );

        const foreignCashValueId = rowValues.find(
          ({ subcategory }) => subcategory === parents.subcategoryId.foreignCash,
        )?.id as number;

        expect(rowValuesFX).toStrictEqual([
          expect.objectContaining({
            values_id: foreignCashValueId,
            currency: 'CNY',
            value: 62000,
          }),
        ]);

        expect(creditLimitRows).toHaveLength(2);
        expect(creditLimitRows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              subcategory: parents.subcategoryId.mainCC,
              value: 250000,
            }),
            expect.objectContaining({
              subcategory: parents.subcategoryId.travelCC,
              value: 100000,
            }),
          ]),
        );

        expect(currencyRows).toStrictEqual([
          expect.objectContaining({
            currency: 'CNY',
            rate: 0.113,
          }),
        ]);
      });

      describe('sending entry with option values', () => {
        const setupOption = async (): Promise<{
          parents: Parents;
          entryWithOption: RawDate<NetWorthEntryInput, 'date'>;
        }> => {
          const { parents } = await setupParents();
          const entryWithOption: RawDate<NetWorthEntryInput, 'date'> = {
            date: '2020-04-15',
            values: [
              {
                subcategory: parents.subcategoryId.options,
                skip: null,
                option: {
                  units: 157,
                  strikePrice: 140.53,
                  marketPrice: 197.812,
                  vested: 0,
                },
              },
            ],
            currencies: [],
            creditLimit: [],
          };

          return { parents, entryWithOption };
        };

        it('should add the option value rows', async () => {
          expect.assertions(3);
          const { parents, entryWithOption } = await setupOption();

          const res = await app.authGqlClient.mutate<
            Mutation,
            RawDateDeep<MutationCreateNetWorthEntryArgs>
          >({
            mutation,
            variables: {
              input: entryWithOption,
            },
          });

          expect(res.data?.createNetWorthEntry).toStrictEqual(
            expect.objectContaining({
              id: expect.any(Number),
              error: null,
            }),
          );

          const id = res.data?.createNetWorthEntry?.id as number;

          const [{ rows: rowValues }, { rows: rowOptionValues }] = await getPool().connect(
            async (db) =>
              Promise.all([
                db.query<ValueRowSelect>(sql`
                SELECT * FROM net_worth_values
                WHERE net_worth_id = ${id}
                `),
                db.query(sql`
                SELECT nwopv.* FROM net_worth_option_values nwopv
                INNER JOIN net_worth_values nwv ON nwv.id = nwopv.values_id
                WHERE nwv.net_worth_id = ${id}
                `),
              ]),
          );

          expect(rowValues).toStrictEqual([
            expect.objectContaining({
              id: expect.any(Number),
              subcategory: parents.subcategoryId.options,
              skip: null,
              value: null,
            }),
          ]);

          expect(rowOptionValues).toStrictEqual([
            expect.objectContaining({
              units: 157,
              strike_price: 140.53,
              market_price: 197.812,
              vested: 0,
            }),
          ]);
        });
      });

      describe('sending entry with loan values', () => {
        const setupLoan = async (): Promise<{
          parents: Parents;
          entryWithLoan: RawDate<NetWorthEntryInput, 'date'>;
        }> => {
          const { parents } = await setupParents();
          const entryWithLoan: RawDate<NetWorthEntryInput, 'date'> = {
            date: '2020-04-15',
            values: [
              {
                subcategory: parents.subcategoryId.loan,
                skip: null,
                loan: {
                  principal: 35987623,
                  paymentsRemaining: 25 * 12 - 3,
                  rate: 2.74,
                  paid: 154,
                },
              },
            ],
            currencies: [],
            creditLimit: [],
          };

          return { parents, entryWithLoan };
        };

        it('should add the loan value rows', async () => {
          expect.assertions(3);
          const { parents, entryWithLoan } = await setupLoan();

          const res = await app.authGqlClient.mutate<
            Mutation,
            RawDateDeep<MutationCreateNetWorthEntryArgs>
          >({
            mutation,
            variables: {
              input: entryWithLoan,
            },
          });

          expect(res.data?.createNetWorthEntry).toStrictEqual(
            expect.objectContaining({
              id: expect.any(Number),
              error: null,
            }),
          );

          const id = res.data?.createNetWorthEntry?.id as number;

          const [{ rows: rowValues }, { rows: rowLoanValues }] = await getPool().connect(
            async (db) =>
              Promise.all([
                db.query<ValueRowSelect>(sql`
                SELECT * FROM net_worth_values
                WHERE net_worth_id = ${id}
                `),
                db.query(sql`
                SELECT nwlv.* FROM net_worth_loan_values nwlv
                INNER JOIN net_worth_values nwv ON nwv.id = nwlv.values_id
                WHERE nwv.net_worth_id = ${id}
                `),
              ]),
          );

          expect(rowValues).toStrictEqual([
            expect.objectContaining({
              id: expect.any(Number),
              subcategory: parents.subcategoryId.loan,
              skip: null,
              value: -35987623,
            }),
          ]);

          expect(rowLoanValues).toStrictEqual([
            expect.objectContaining<Partial<NetWorthLoansRow>>({
              payments_remaining: 297,
              rate: 2.74,
              paid: 154,
            }),
          ]);
        });
      });
    });

    describe('readNetWorthEntries', () => {
      const query = gql`
        query ReadNetWorthEntries {
          readNetWorthEntries {
            current {
              id
              date
              values {
                subcategory
                skip

                value

                simple
                fx {
                  value
                  currency
                }
                option {
                  units
                  vested
                  strikePrice
                  marketPrice
                }
                loan {
                  principal
                  rate
                  paymentsRemaining
                  paid
                }
              }
              creditLimit {
                subcategory
                value
              }
              currencies {
                currency
                rate
              }
            }
          }
        }
      `;

      const now = new Date('2020-04-10');
      let clock: sinon.SinonFakeTimers;

      beforeAll(() => {
        clock = sinon.useFakeTimers(now);
      });

      afterAll(() => {
        clock.restore();
      });

      const setup = async (): Promise<{
        ids: number[];
        res: Maybe<NetWorthEntryOverview>;
        expectedEntryTemplate: Create<RawDate<NetWorthEntry, 'date'>>;
      }> => {
        const { parents, entryInput } = await setupParents();

        const expectedEntryTemplate: Create<RawDate<NetWorthEntry, 'date'>> = {
          date: entryInput.date,
          values: expect.arrayContaining<NetWorthValueObject>([
            expect.objectContaining({
              subcategory: parents.subcategoryId.currentAccount,
              value: 166523,
              simple: 166523,
              fx: null,
              option: null,
              loan: null,
              skip: null,
            }),
            expect.objectContaining({
              subcategory: parents.subcategoryId.foreignCash,
              value: 62000 * 100 * 0.113,
              simple: null,
              fx: [
                expect.objectContaining({
                  value: 62000,
                  currency: 'CNY',
                }),
              ],
              option: null,
              loan: null,
              skip: null,
            }),
            expect.objectContaining({
              subcategory: parents.subcategoryId.mainCC,
              value: -15000,
              simple: -15000,
              fx: null,
              option: null,
              loan: null,
              skip: null,
            }),
            expect.objectContaining({
              subcategory: parents.subcategoryId.travelCC,
              value: -1340,
              simple: -1340,
              fx: null,
              option: null,
              loan: null,
              skip: true,
            }),
          ]),
          creditLimit: expect.arrayContaining<CreditLimit>([
            expect.objectContaining({
              subcategory: parents.subcategoryId.mainCC,
              value: 250000,
            }),
            expect.objectContaining({
              subcategory: parents.subcategoryId.travelCC,
              value: 100000,
            }),
          ]),
          currencies: [
            expect.objectContaining({
              currency: 'CNY',
              rate: 0.113,
            }),
          ],
        };

        const mods: Partial<RawDate<NetWorthEntryInput, 'date'>>[] = [
          { date: '2020-04-14' },
          { date: '2020-01-31' },
          {
            date: '2020-03-30',
            values: [
              {
                subcategory: parents.subcategoryId.loan,
                loan: {
                  paymentsRemaining: 125,
                  principal: 16544005,
                  rate: 2.74,
                  paid: 154,
                },
              },
            ],
          },
          { date: '2020-02-29' },
          { date: '2019-12-31' },
          { date: '2019-12-18' },
          { date: '2020-02-28' },
        ];

        const ids = await createEntries(
          mods.map((mod) => ({
            input: {
              ...entryInput,
              ...mod,
            },
          })),
        );

        await app.authGqlClient.clearStore();
        const res = await app.authGqlClient.query<Query>({ query });

        return { ids, res: res.data.readNetWorthEntries ?? null, expectedEntryTemplate };
      };

      it('should return all current entries', async () => {
        expect.assertions(2);

        const { res, expectedEntryTemplate } = await setup();

        expect(res?.current).toHaveLength(7);

        expect(res?.current).toStrictEqual(
          expect.arrayContaining<RawDate<NetWorthEntry, 'date'>>(
            [
              {
                ...expectedEntryTemplate,
                id: expect.any(Number),
                date: '2020-04-14',
              },
              {
                ...expectedEntryTemplate,
                id: expect.any(Number),
                date: '2020-01-31',
              },
              {
                ...expectedEntryTemplate,
                id: expect.any(Number),
                date: '2020-03-30',
                values: [
                  expect.objectContaining({
                    value: -16544005,
                    simple: null,
                    loan: expect.objectContaining({
                      paymentsRemaining: 125,
                      principal: 16544005,
                      rate: 2.74,
                      paid: 154,
                    }),
                  }),
                ],
              },
              {
                ...expectedEntryTemplate,
                id: expect.any(Number),
                date: '2020-02-29',
              },
              {
                ...expectedEntryTemplate,
                id: expect.any(Number),
                date: '2019-12-31',
              },
              {
                ...expectedEntryTemplate,
                id: expect.any(Number),
                date: '2019-12-18',
              },
              {
                ...expectedEntryTemplate,
                id: expect.any(Number),
                date: '2020-02-28',
              },
            ].map(expect.objectContaining),
          ),
        );
      });

      it('should sum SAYE options with a floor', async () => {
        expect.assertions(1);

        const { parents, entryInput } = await setupParents();

        await createEntries([
          {
            input: {
              ...entryInput,
              date: '2020-02-03',
              values: [
                {
                  subcategory: parents.subcategoryId.SAYE,
                  option: {
                    strikePrice: 101.2,
                    marketPrice: 99.37,
                    units: 203,
                    vested: 197,
                  },
                },
              ],
            },
          },
        ]);

        await app.authGqlClient.clearStore();
        const res = await app.authGqlClient.query<Query>({ query });

        expect(res.data.readNetWorthEntries?.current).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              date: '2020-02-03',
              values: [
                expect.objectContaining({
                  subcategory: parents.subcategoryId.SAYE,
                  value: Math.round(101.2 * 197),
                }),
              ],
            }),
          ]),
        );
      });

      it('should order the current entries by date ascending', async () => {
        expect.assertions(1);

        const { res } = await setup();

        const dates = res?.current.map((entry) => entry.date);

        expect(dates).toStrictEqual([
          '2019-12-18',
          '2019-12-31',
          '2020-01-31',
          '2020-02-28',
          '2020-02-29',
          '2020-03-30',
          '2020-04-14',
        ]);
      });
    });

    describe('updateNetWorthEntry', () => {
      const mutation = gql`
        mutation UpdateNetWorthEntry($id: Int!, $input: NetWorthEntryInput!) {
          updateNetWorthEntry(id: $id, input: $input) {
            error
          }
        }
      `;

      const setup = async (): Promise<AsyncReturnType<typeof setupParents> & { id: number }> => {
        const { parents, entryInput } = await setupParents();
        const [id] = await createEntries([{ input: entryInput }]);
        return { id, parents, entryInput };
      };

      it('should update the date', async () => {
        expect.assertions(2);
        const { id, entryInput } = await setup();

        const updatedEntry: Create<RawDate<NetWorthEntryInput, 'date'>> = {
          ...entryInput,
          date: '2020-04-15',
        };

        const res = await app.authGqlClient.mutate<
          Mutation,
          RawDateDeep<MutationUpdateNetWorthEntryArgs>
        >({
          mutation,
          variables: {
            id,
            input: updatedEntry,
          },
        });

        expect(res.data?.updateNetWorthEntry?.error).toBeNull();

        const { rows } = await getPool().query<NetWorthEntryRow>(sql`
        SELECT * FROM net_worth WHERE id = ${id}
        `);

        expect(rows[0].date).toStrictEqual(new Date('2020-04-15'));
      });

      it('should update a value', async () => {
        expect.assertions(2);
        const { id, entryInput, parents } = await setup();
        const updatedEntry: Create<RawDate<NetWorthEntryInput, 'date'>> = {
          ...entryInput,
          values: [
            {
              subcategory: parents.subcategoryId.currentAccount,
              simple: 30,
            },
          ],
        };

        const res = await app.authGqlClient.mutate<
          Mutation,
          RawDateDeep<MutationUpdateNetWorthEntryArgs>
        >({
          mutation,
          variables: {
            id,
            input: updatedEntry,
          },
        });

        expect(res.data?.updateNetWorthEntry?.error).toBeNull();

        const { rows: valueRows } = await getPool().query(sql`
        SELECT * FROM net_worth_values WHERE net_worth_id = ${id}
        `);

        expect(valueRows).toStrictEqual([
          expect.objectContaining({
            subcategory: parents.subcategoryId.currentAccount,
            value: 30,
          }),
        ]);
      });

      it('should update a credit limit', async () => {
        expect.assertions(2);
        const { id, entryInput, parents } = await setup();
        const updatedEntry: Create<RawDate<NetWorthEntryInput, 'date'>> = {
          ...entryInput,
          creditLimit: [
            {
              subcategory: parents.subcategoryId.mainCC,
              value: 125000,
            },
          ],
        };

        const res = await app.authGqlClient.mutate<
          Mutation,
          RawDateDeep<MutationUpdateNetWorthEntryArgs>
        >({
          mutation,
          variables: {
            id,
            input: updatedEntry,
          },
        });

        expect(res.data?.updateNetWorthEntry?.error).toBeNull();

        const { rows: creditLimitRows } = await getPool().query(sql`
        SELECT * FROM net_worth_credit_limit WHERE net_worth_id = ${id}
        `);

        expect(creditLimitRows).toStrictEqual([
          expect.objectContaining({
            subcategory: parents.subcategoryId.mainCC,
            value: 125000,
          }),
        ]);
      });

      it('should update a currency', async () => {
        expect.assertions(2);
        const { id, entryInput } = await setup();
        const updatedEntry: Create<RawDate<NetWorthEntryInput, 'date'>> = {
          ...entryInput,
          currencies: [
            {
              currency: 'USD',
              rate: 0.783,
            },
          ],
        };

        const res = await app.authGqlClient.mutate<
          Mutation,
          RawDateDeep<MutationUpdateNetWorthEntryArgs>
        >({
          mutation,
          variables: {
            id,
            input: updatedEntry,
          },
        });

        expect(res.data?.updateNetWorthEntry?.error).toBeNull();

        const { rows: currencyRows } = await getPool().query(sql`
        SELECT * FROM net_worth_currencies WHERE net_worth_id = ${id}
        `);

        expect(currencyRows).toStrictEqual([
          expect.objectContaining({
            currency: 'USD',
            rate: 0.783,
          }),
        ]);
      });

      it('should update an option price and vested number', async () => {
        expect.assertions(4);
        const { id, entryInput, parents } = await setup();
        const updatedEntry: Create<RawDate<NetWorthEntryInput, 'date'>> = {
          ...entryInput,
          values: [
            {
              subcategory: parents.subcategoryId.mainCC,
              simple: -103,
            },
            {
              subcategory: parents.subcategoryId.options,
              option: {
                units: 1327,
                strikePrice: 4.53,
                marketPrice: 19.27,
                vested: 141,
              },
            },
          ],
        };

        const res = await app.authGqlClient.mutate<
          Mutation,
          RawDateDeep<MutationUpdateNetWorthEntryArgs>
        >({
          mutation,
          variables: {
            id,
            input: updatedEntry,
          },
        });

        expect(res.data?.updateNetWorthEntry?.error).toBeNull();

        const { rows: valuesRows } = await getPool().query(sql`
        SELECT * FROM net_worth_values WHERE net_worth_id = ${id}
        `);

        expect(valuesRows).toHaveLength(2);

        expect(valuesRows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              subcategory: parents.subcategoryId.mainCC,
              value: -103,
            }),
            expect.objectContaining({
              id: expect.any(Number),
              subcategory: parents.subcategoryId.options,
              value: null,
            }),
          ]),
        );

        const valueIdOptions = valuesRows.find(
          ({ subcategory }) => subcategory === parents.subcategoryId.options,
        )?.id;

        const allValueIds = valuesRows.map((row) => row.id);

        const { rows: optionValuesRows } = await getPool().query(sql`
        SELECT * FROM net_worth_option_values WHERE values_id = ANY(${sql.array(
          allValueIds,
          'int4',
        )})
        `);

        expect(optionValuesRows).toStrictEqual([
          expect.objectContaining({
            values_id: valueIdOptions,
            units: 1327,
            vested: 141,
            strike_price: 4.53,
            market_price: 19.27,
          }),
        ]);
      });

      it('should not duplicate options', async () => {
        expect.assertions(3);
        const { id, entryInput, parents } = await setup();

        const updateOptionA: Create<RawDate<NetWorthEntryInput, 'date'>> = {
          ...entryInput,
          values: [
            ...entryInput.values,
            {
              ...entryInput.values[0],
              subcategory: parents.subcategoryId.options,
              option: {
                units: 10,
                strikePrice: 11,
                marketPrice: 12,
              },
            },
          ],
        };

        const updateOptionB: Create<RawDate<NetWorthEntryInput, 'date'>> = {
          ...entryInput,
          values: [
            {
              ...entryInput.values[0],
              simple: 11111,
            },
            ...updateOptionA.values.slice(1),
          ],
        };

        const resA = await app.authGqlClient.mutate<
          Mutation,
          RawDateDeep<MutationUpdateNetWorthEntryArgs>
        >({
          mutation,
          variables: {
            id,
            input: updateOptionA,
          },
        });
        const resB = await app.authGqlClient.mutate<
          Mutation,
          RawDateDeep<MutationUpdateNetWorthEntryArgs>
        >({
          mutation,
          variables: {
            id,
            input: updateOptionB,
          },
        });

        expect(resA.data?.updateNetWorthEntry?.error).toBeNull();
        expect(resB.data?.updateNetWorthEntry?.error).toBeNull();

        const { rows: optionValuesRows } = await getPool().query(sql`
        SELECT ov.* FROM net_worth_values v
        INNER JOIN net_worth_option_values ov ON ov.values_id = v.id
        WHERE v.net_worth_id = ${id}
        `);

        expect(optionValuesRows).toStrictEqual([
          expect.objectContaining({
            units: 10,
            vested: 0,
            strike_price: 11,
            market_price: 12,
          }),
        ]);
      });
    });

    describe('deleteNetWorthEntry', () => {
      const mutation = gql`
        mutation DeleteNetWorthEntry($id: Int!) {
          deleteNetWorthEntry(id: $id) {
            error
          }
        }
      `;

      it('should remove the entry from the database', async () => {
        expect.assertions(4);

        const { entryInput } = await setupParents();
        const [id] = await createEntries([{ input: entryInput }]);

        expect(id).toStrictEqual(expect.any(Number));

        const { rowCount: countBefore } = await getPool().query(sql`
        SELECT * FROM net_worth WHERE id = ${id}
        `);
        expect(countBefore).toBe(1);

        const res = await app.authGqlClient.mutate<Mutation, MutationDeleteNetWorthEntryArgs>({
          mutation,
          variables: { id },
        });

        expect(res.data?.deleteNetWorthEntry?.error).toBeNull();

        const { rowCount: countAfter } = await getPool().query(sql`
        SELECT * FROM net_worth WHERE id = ${id}
        `);
        expect(countAfter).toBe(0);
      });
    });
  });

  describe('netWorthCashTotal', () => {
    const query = gql`
      query NetWorthCashTotal {
        netWorthCashTotal {
          date
          cashInBank
          stockValue
          stocksIncludingCash
          incomeSince
          spendingSince
        }
      }
    `;

    let res: ApolloQueryResult<Query>;

    beforeAll(async () => {
      await seedData(app.uid);
      const clock = sinon.useFakeTimers(new Date('2020-04-10'));
      await app.authGqlClient.clearStore();
      res = await app.authGqlClient.query<Query>({ query });
      clock.restore();
    });

    it('should return the date of the net worth entry where values are calculated from', () => {
      expect.assertions(1);
      expect(res.data.netWorthCashTotal?.date).toBe('2020-03-31');
    });

    // check fixtures data to verify the expected values here
    const expectedCashInBank = 1288520; // check seed data
    const expectedISAValue = 6449962;

    const expectedFundValueAtNetWorthDate = 127.39 * (1005.2 - 1005.2 + 89.095 + 894.134 - 883.229);

    const expectedIncomeSinceNetWorthDate = 15422 - (3629 + 1550);
    const expectedSpendingSinceNetWorthDate = 350;

    it.each`
      thing                                   | key                      | expectedValue
      ${'Cash in bank'}                       | ${'cashInBank'}          | ${expectedCashInBank}
      ${'Fund value'}                         | ${'stockValue'}          | ${expectedFundValueAtNetWorthDate}
      ${'Stocks (including investable cash)'} | ${'stocksIncludingCash'} | ${expectedISAValue}
      ${'Income since net worth date'}        | ${'incomeSince'}         | ${expectedIncomeSinceNetWorthDate}
      ${'Spending since net worth date'}      | ${'spendingSince'}       | ${expectedSpendingSinceNetWorthDate}
    `(
      'should return the $thing',
      ({ key, expectedValue }: { key: keyof NetWorthCashTotal; expectedValue: number }) => {
        expect.assertions(1);
        expect(res.data.netWorthCashTotal?.[key]).toBeCloseTo(expectedValue);
      },
    );
  });

  describe('netWorthLoans', () => {
    const query = gql`
      query NetWorthLoans {
        netWorthLoans {
          loans {
            subcategory
            values {
              date
              value {
                principal
                rate
                paymentsRemaining
                paid
              }
            }
          }
        }
      }
    `;

    it('should return the list of historical and current loans, grouped by subcategory', async () => {
      expect.assertions(1);
      await seedData(app.uid);
      const res = await app.authGqlClient.query<Query>({ query });
      expect(res.data.netWorthLoans).toMatchInlineSnapshot(`
        Object {
          "__typename": "NetWorthLoansResponse",
          "loans": Array [
            Object {
              "__typename": "NetWorthLoan",
              "subcategory": "My mortgage",
              "values": Array [
                Object {
                  "__typename": "NetWorthLoanValue",
                  "date": "2015-03-27",
                  "value": Object {
                    "__typename": "LoanValue",
                    "paid": 147692,
                    "paymentsRemaining": 360,
                    "principal": 36125000,
                    "rate": 2.74,
                  },
                },
                Object {
                  "__typename": "NetWorthLoanValue",
                  "date": "2015-05-31",
                  "value": Object {
                    "__typename": "LoanValue",
                    "paid": 147687,
                    "paymentsRemaining": 358,
                    "principal": 34713229,
                    "rate": 2.71,
                  },
                },
              ],
            },
          ],
        }
      `);
    });
  });
});
