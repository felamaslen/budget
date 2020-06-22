import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import sinon from 'sinon';
import { Response } from 'supertest';

import config from '~api/config';
import db from '~api/test-utils/knex';
import {
  RawDate,
  Create,
  Category,
  Subcategory,
  Entry,
  CreateEntry,
  AsyncReturnType,
} from '~api/types';

describe('Net worth route', () => {
  const clearDb = async (): Promise<void> => {
    await db('net_worth_categories').del();
    await db('net_worth').del();
  };

  beforeEach(clearDb);

  const category: Omit<Category, 'id'> = {
    type: 'asset',
    category: 'Cash',
    color: '#33ff11',
    isOption: false,
  };

  describe('categories', () => {
    describe('POST /net-worth/categories', () => {
      const setup = async (): Promise<Response> => {
        const res = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
          .send(category);
        return res;
      };

      it('should respond with the category', async () => {
        expect.assertions(3);
        const res = await setup();

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual(expect.objectContaining(category));
        expect(res.body).toHaveProperty('id');
      });

      it('should respond with the category on subsequent get requests', async () => {
        expect.assertions(1);
        const res = await setup();
        const resAfter = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/categories/${res.body.id}`),
        );
        expect(resAfter.body).toStrictEqual(expect.objectContaining(category));
      });

      it('should accept isOption value', async () => {
        expect.assertions(1);

        const res = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
          .send({
            ...category,
            isOption: true,
          });

        expect(res.body).toHaveProperty('isOption', true);
      });
    });

    describe('GET /net-worth/categories/:categoryId', () => {
      const setup = async (): Promise<Response> => {
        const resPost = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
          .send(category);
        const res = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/categories/${resPost.body.id}`),
        );

        return res;
      };

      it('should respond with the category', async () => {
        expect.assertions(2);
        const res = await setup();

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          id: expect.any(Number),
          ...category,
        });
      });
    });

    describe('GET /net-worth/categories', () => {
      const setup = async (): Promise<Response> => {
        await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
          .send(category);
        const res = await global.withAuth(global.agent.get(`/api/v4/data/net-worth/categories`));

        return res;
      };

      it('should respond with all of the categories belonging to the user making the request', async () => {
        expect.assertions(2);
        const res = await setup();

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual([
          {
            id: expect.any(Number),
            ...category,
          },
        ]);
      });
    });

    describe('PUT /net-worth/categories/:categoryId', () => {
      const modifiedCategory = {
        ...category,
        category: 'Bank',
        isOption: true,
      };

      const setup = async (): Promise<Response> => {
        const resPost = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
          .send(category);

        const res = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/categories/${resPost.body.id}`))
          .send(modifiedCategory);
        return res;
      };

      it('should respond with the updated category', async () => {
        expect.assertions(2);
        const res = await setup();

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          id: expect.any(Number),
          ...modifiedCategory,
        });
      });

      it('should respond with the updated category on subsequent requests', async () => {
        expect.assertions(1);
        const res = await setup();
        const resAfter = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/categories/${res.body.id}`),
        );

        expect(resAfter.body).toStrictEqual(expect.objectContaining(modifiedCategory));
      });
    });

    describe('DELETE /net-worth/categories/:categoryId', () => {
      const setup = async (): Promise<{ resPost: Response; resDelete: Response }> => {
        const resPost = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
          .send(category);

        const resDelete = await global.withAuth(
          global.agent.delete(`/api/v4/data/net-worth/categories/${resPost.body.id}`),
        );

        return { resPost, resDelete };
      };

      it('should respond with 204 no content', async () => {
        expect.assertions(1);
        const { resDelete } = await setup();

        expect(resDelete.status).toBe(204);
      });

      it('should respond with 404 on subsequent get requests', async () => {
        expect.assertions(1);
        const { resPost } = await setup();
        const resAfter = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/categories/${resPost.body.id}`),
        );

        expect(resAfter.status).toBe(404);
      });
    });
  });

  describe('subcategories', () => {
    const subcategory: Create<Omit<Subcategory, 'categoryId'>> = {
      subcategory: 'Current account',
      hasCreditLimit: null,
      opacity: 0.8,
    };

    const setup = async (categoryId?: number): Promise<Response> => {
      const resPostCategory = await global
        .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
        .send(category);

      const res = await global
        .withAuth(global.agent.post('/api/v4/data/net-worth/subcategories'))
        .send({ categoryId: categoryId ?? resPostCategory.body.id, ...subcategory });

      return res;
    };

    describe('POST /net-worth/subcategories', () => {
      it('should respond with the subcategory', async () => {
        expect.assertions(2);
        const res = await setup();

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            id: expect.any(Number),
            ...subcategory,
          }),
        );
      });

      it('should response with the subcategory on subsequent get requests', async () => {
        expect.assertions(1);
        const res = await setup();
        const resAfter = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/subcategories/${res.body.id}`),
        );

        expect(resAfter.body).toStrictEqual(
          expect.objectContaining({
            categoryId: res.body.categoryId,
            ...subcategory,
          }),
        );
      });

      describe('if the category does not exist', () => {
        it('should respond with an error', async () => {
          expect.assertions(2);
          const nonexistentCategoryId = 88664915;
          const res = await setup(nonexistentCategoryId);

          expect(res.status).toBe(404);
          expect(res.body).toMatchInlineSnapshot(`
            Object {
              "err": "Category not found",
            }
          `);
        });
      });
    });

    describe('GET /net-worth/subcategories/:subcategoryId', () => {
      const setupForGet = async (): Promise<Response> => {
        const resPost = await setup();
        const res = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/subcategories/${resPost.body.id}`),
        );
        return res;
      };

      it('should respond with the subcategory', async () => {
        expect.assertions(2);
        const res = await setupForGet();

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            id: expect.any(Number),
            ...subcategory,
          }),
        );
      });
    });

    describe('PUT /net-worth/subcategories/:subcategoryId', () => {
      const modifiedSubcategory = {
        ...subcategory,
        subcategory: 'Savings account',
      };

      const setupForPut = async (): Promise<{ resPost: Response; resPut: Response }> => {
        const resPost = await setup();
        const resPut = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/subcategories/${resPost.body.id}`))
          .send({
            categoryId: resPost.body.categoryId,
            ...modifiedSubcategory,
          });
        return { resPost, resPut };
      };

      it('should respond with the updated subcategory', async () => {
        expect.assertions(2);
        const { resPut } = await setupForPut();

        expect(resPut.status).toBe(200);
        expect(resPut.body).toStrictEqual({
          id: resPut.body.id,
          categoryId: resPut.body.categoryId,
          ...modifiedSubcategory,
        });
      });

      it('should respond with the updated category on subsequent get requests', async () => {
        expect.assertions(1);
        const { resPut } = await setupForPut();
        const resAfter = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/subcategories/${resPut.body.id}`),
        );

        expect(resAfter.body).toStrictEqual(
          expect.objectContaining({
            categoryId: resPut.body.categoryId,
            ...modifiedSubcategory,
          }),
        );
      });

      describe('if the category does not exist', () => {
        it('should respond with an error', async () => {
          expect.assertions(2);
          const { resPost } = await setupForPut();

          const nonexistentCategoryId = 163387;

          const res = await global
            .withAuth(global.agent.put(`/api/v4/data/net-worth/subcategories/${resPost.body.id}`))
            .send({
              ...modifiedSubcategory,
              categoryId: nonexistentCategoryId,
            });

          expect(res.status).toBe(404);
          expect(res.body).toMatchInlineSnapshot(`
            Object {
              "err": "Category not found",
            }
          `);
        });
      });
    });

    describe('DELETE /net-worth/categories/:categoryId', () => {
      const setupForDelete = async (): Promise<{ resPost: Response; resDelete: Response }> => {
        const resPost = await setup();
        const resDelete = await global.withAuth(
          global.agent.delete(`/api/v4/data/net-worth/subcategories/${resPost.body.id}`),
        );

        return { resPost, resDelete };
      };

      it('should respond with 204 no content', async () => {
        expect.assertions(1);
        const { resDelete } = await setupForDelete();

        expect(resDelete.status).toBe(204);
      });

      it('should respond with 404 on subsequent get requests', async () => {
        expect.assertions(1);
        const { resPost } = await setupForDelete();
        const resAfter = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/subcategories/${resPost.body.id}`),
        );

        expect(resAfter.status).toBe(404);
      });
    });
  });

  describe('entries', () => {
    const categoryBank: Create<Category> = {
      type: 'asset',
      category: 'Bank',
      color: '#00ff00',
    };

    const categoryOptions: Create<Category> = {
      type: 'asset',
      category: 'Options',
      color: '#00ffcc',
      isOption: true,
    };

    const categoryCC: Create<Category> = {
      type: 'liability',
      category: 'Credit Cards',
      color: '#ff0000',
    };

    const subcategoryCurrentAccount: Create<Subcategory> = {
      categoryId: 0,
      subcategory: 'Current account',
      hasCreditLimit: null,
      opacity: 0.8,
    };

    const subcategoryOptions: Create<Subcategory> = {
      categoryId: 0,
      subcategory: 'Company X Ord 5p',
      hasCreditLimit: null,
      opacity: 1,
    };

    const subcategoryMainCC: Create<Subcategory> = {
      categoryId: 0,
      subcategory: 'Main credit card',
      hasCreditLimit: true,
      opacity: 0.5,
    };

    const subcategoryTravelCC: Create<Subcategory> = {
      categoryId: 0,
      subcategory: 'Travel credit card',
      hasCreditLimit: true,
      opacity: 0.7,
    };

    const setup = async (): Promise<{
      entry: RawDate<CreateEntry>;
      resPostCategoryBank: Response;
      resPostCategoryOptions: Response;
      resPostCategoryCC: Response;
      resPostSubcategoryCurrentAccount: Response;
      resPostSubcategoryOptions: Response;
      resPostSubcategoryMainCC: Response;
      resPostSubcategoryTravelCC: Response;
    }> => {
      const resPostCategoryBank = await global
        .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
        .send(categoryBank);

      const resPostCategoryOptions = await global
        .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
        .send(categoryOptions);

      const resPostCategoryCC = await global
        .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
        .send(categoryCC);

      const resPostSubcategoryCurrentAccount = await global
        .withAuth(global.agent.post('/api/v4/data/net-worth/subcategories'))
        .send({
          ...subcategoryCurrentAccount,
          categoryId: resPostCategoryBank.body.id,
        });

      const resPostSubcategoryOptions = await global
        .withAuth(global.agent.post('/api/v4/data/net-worth/subcategories'))
        .send({
          ...subcategoryOptions,
          categoryId: resPostCategoryOptions.body.id,
        });

      const resPostSubcategoryMainCC = await global
        .withAuth(global.agent.post('/api/v4/data/net-worth/subcategories'))
        .send({
          ...subcategoryMainCC,
          categoryId: resPostCategoryCC.body.id,
        });

      const resPostSubcategoryTravelCC = await global
        .withAuth(global.agent.post('/api/v4/data/net-worth/subcategories'))
        .send({
          ...subcategoryTravelCC,
          categoryId: resPostCategoryCC.body.id,
        });

      const entry: RawDate<CreateEntry> = {
        date: '2020-04-14',
        values: [
          {
            subcategory: resPostSubcategoryCurrentAccount.body.id,
            skip: null,
            value: [
              {
                value: 62000,
                currency: 'CNY',
              },
            ],
          },
          {
            subcategory: resPostSubcategoryMainCC.body.id,
            skip: null,
            value: -15000,
          },
          {
            subcategory: resPostSubcategoryTravelCC.body.id,
            skip: true,
            value: -1340,
          },
        ],
        creditLimit: [
          {
            subcategory: resPostSubcategoryMainCC.body.id,
            value: 250000,
          },
          {
            subcategory: resPostSubcategoryTravelCC.body.id,
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

      return {
        entry,
        resPostCategoryBank,
        resPostCategoryOptions,
        resPostCategoryCC,
        resPostSubcategoryCurrentAccount,
        resPostSubcategoryOptions,
        resPostSubcategoryMainCC,
        resPostSubcategoryTravelCC,
      };
    };

    describe('POST /net-worth', () => {
      it('should respond with the entry', async () => {
        expect.assertions(2);
        const { entry } = await setup();
        const res = await global.withAuth(global.agent.post('/api/v4/data/net-worth')).send(entry);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual({
          id: expect.any(Number),
          date: '2020-04-14',
          values: expect.arrayContaining([
            expect.objectContaining(entry.values[0]),
            expect.objectContaining(entry.values[1]),
            expect.objectContaining(entry.values[2]),
          ]),
          creditLimit: expect.arrayContaining(entry.creditLimit.map(expect.objectContaining)),
          currencies: [expect.objectContaining(entry.currencies[0])],
        });
      });

      describe('sending entry with option values', () => {
        const setupOption = async (): Promise<RawDate<CreateEntry>> => {
          const { resPostSubcategoryOptions } = await setup();
          const entryWithOption = {
            date: '2020-04-15',
            values: [
              {
                subcategory: resPostSubcategoryOptions.body.id,
                skip: null,
                value: [
                  {
                    units: 157,
                    strikePrice: 140.53,
                    marketPrice: 197.812,
                  },
                ],
              },
            ],
            currencies: [],
            creditLimit: [],
          };

          return entryWithOption;
        };

        it('should add the option value to the entry', async () => {
          expect.assertions(2);
          const entryWithOption = await setupOption();
          const res = await global
            .withAuth(global.agent.post('/api/v4/data/net-worth'))
            .send(entryWithOption);

          expect(res.status).toBe(201);
          expect(res.body).toStrictEqual(
            expect.objectContaining({
              id: expect.any(Number),
              values: expect.arrayContaining([expect.objectContaining(entryWithOption.values[0])]),
            }),
          );
        });
      });
    });

    describe('GET /net-worth/:entryId', () => {
      const setupForGet = async (): Promise<{ entry: RawDate<CreateEntry>; res: Response }> => {
        const { entry } = await setup();
        const resPost = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth'))
          .send(entry);

        const res = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/${resPost.body.id}`),
        );

        return { entry, res };
      };

      it('should respond with the entry', async () => {
        expect.assertions(2);
        const { res, entry } = await setupForGet();

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          id: expect.any(Number),
          date: '2020-04-14',
          values: expect.arrayContaining(entry.values.map(expect.objectContaining)),
          creditLimit: expect.arrayContaining(entry.creditLimit.map(expect.objectContaining)),
          currencies: expect.arrayContaining(entry.currencies.map(expect.objectContaining)),
        });
      });
    });

    describe('GET /net-worth', () => {
      const now = new Date('2020-04-10');
      let clock: sinon.SinonFakeTimers;

      beforeAll(() => {
        clock = sinon.useFakeTimers(now);
      });

      afterAll(() => {
        clock.restore();
      });

      const setupForGet = async (): Promise<{
        entry: RawDate<CreateEntry>;
        mods: Partial<RawDate<CreateEntry>>[];
        res: Response[];
      }> => {
        const { entry, resPostSubcategoryOptions } = await setup();
        const mods = [
          {
            date: '2020-04-14',
          },
          { date: '2020-01-31' },
          { date: '2020-03-30' },
          { date: '2020-02-29' },
          { date: '2019-12-31' },
          { date: '2019-12-18' },
          { date: '2020-02-28' },
          {
            date: format(addMonths(now, -(config.data.overview.numLast + 1)), 'yyyy-MM-dd'),
            values: [
              {
                ...entry.values[0],
                subcategory: resPostSubcategoryOptions.body.id,
                value: [
                  5871,
                  {
                    value: 2040.76,
                    currency: 'CNY',
                  },
                  {
                    units: 1324,
                    strikePrice: 4.53,
                    marketPrice: 19.27,
                  },
                ],
              },
              ...entry.values.slice(1),
            ],
          },
          { date: format(addMonths(now, -(config.data.overview.numLast + 3)), 'yyyy-MM-dd') },
        ];

        const res = await Promise.all(
          mods.map((mod) =>
            global.withAuth(global.agent.post('/api/v4/data/net-worth')).send({
              ...entry,
              ...mod,
            }),
          ),
        );

        return { entry, mods, res };
      };

      it('should get a list of net worth entries', async () => {
        expect.assertions(2);

        const { entry, mods } = await setupForGet();
        const res = await global.withAuth(global.agent.get(`/api/v4/data/net-worth`));

        const expectedResults = mods.slice(0, 7).map(({ date }) =>
          expect.objectContaining({
            date: date || entry.date,
            values: expect.arrayContaining(entry.values.map(expect.objectContaining)),
            creditLimit: expect.arrayContaining(entry.creditLimit.map(expect.objectContaining)),
            currencies: expect.arrayContaining(entry.currencies.map(expect.objectContaining)),
          }),
        );

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            items: expect.arrayContaining(expectedResults),
          }),
        );
      });

      it('should order the results by date ascending', async () => {
        expect.assertions(1);
        await setupForGet();
        const res = await global.withAuth(global.agent.get(`/api/v4/data/net-worth`));

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            items: [
              expect.objectContaining({ date: '2019-12-18' }),
              expect.objectContaining({ date: '2019-12-31' }),
              expect.objectContaining({ date: '2020-01-31' }),
              expect.objectContaining({ date: '2020-02-28' }),
              expect.objectContaining({ date: '2020-02-29' }),
              expect.objectContaining({ date: '2020-03-30' }),
              expect.objectContaining({ date: '2020-04-14' }),
            ],
          }),
        );
      });

      it('should put old values in their own section', async () => {
        expect.assertions(2);
        await setupForGet();
        const res = await global.withAuth(global.agent.get(`/api/v4/data/net-worth`));

        const entryValueOld = 5871 + Math.round(2040.76 * 0.113 * 100) - 15000;
        const entryValueOlder = 62000 * 0.113 * 100 - 15000;

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            old: [entryValueOlder, entryValueOld],
          }),
        );
      });

      it('should put old option values in a separate array', async () => {
        expect.assertions(2);
        await setupForGet();
        const res = await global.withAuth(global.agent.get(`/api/v4/data/net-worth`));

        const entryOptionValueOld = Math.round(1324 * 19.27);
        const entryOptionValueOlder = 0;

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            oldOptions: [entryOptionValueOlder, entryOptionValueOld],
          }),
        );
      });
    });

    describe('PUT /net-worth/:entryId', () => {
      const setupForPut = async (): Promise<
        {
          resPost: Response;
        } & AsyncReturnType<typeof setup>
      > => {
        const results = await setup();
        const resPost = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth'))
          .send(results.entry);

        return { ...results, resPost };
      };

      it('should update the date', async () => {
        expect.assertions(2);
        const { entry, resPost } = await setupForPut();
        const updatedEntry = {
          ...entry,
          date: '2020-04-15',
        };

        const res = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${resPost.body.id}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('date', updatedEntry.date);
      });

      it('should update a value', async () => {
        expect.assertions(2);
        const { entry, resPost } = await setupForPut();
        const updatedEntry = {
          ...entry,
          values: [
            {
              ...entry.values[0],
              value: 30,
            },
            ...entry.values.slice(1),
          ],
        };

        const res = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${resPost.body.id}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'values',
          expect.arrayContaining(updatedEntry.values.map(expect.objectContaining)),
        );
      });

      it('should update a credit limit', async () => {
        expect.assertions(2);
        const { entry, resPost } = await setupForPut();
        const updatedEntry = {
          ...entry,
          creditLimit: [
            entry.creditLimit[0],
            {
              ...entry.creditLimit[1],
              value: 125000,
            },
          ],
        };

        const res = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${resPost.body.id}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'creditLimit',
          expect.arrayContaining(updatedEntry.creditLimit.map(expect.objectContaining)),
        );
      });

      it('should update a currency', async () => {
        expect.assertions(2);
        const { entry, resPost } = await setupForPut();
        const updatedEntry = {
          ...entry,
          currencies: [
            ...entry.currencies,
            {
              currency: 'USD',
              rate: 0.783,
            },
          ],
        };

        const res = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${resPost.body.id}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'currencies',
          expect.arrayContaining(updatedEntry.currencies.map(expect.objectContaining)),
        );
      });

      it('should update an option price', async () => {
        expect.assertions(2);
        const {
          entry,
          resPost,
          resPostSubcategoryOptions,
          resPostSubcategoryMainCC,
        } = await setupForPut();

        const updatedEntry = {
          ...entry,
          values: [
            {
              ...entry.values[0],
              subcategory: resPostSubcategoryMainCC.body.id,
              value: -103,
            },
            {
              ...entry.values[0],
              subcategory: resPostSubcategoryOptions.body.id,
              value: [
                {
                  units: 1324,
                  strikePrice: 4.53,
                  marketPrice: 19.27,
                },
              ],
            },
          ],
        };

        const res = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${resPost.body.id}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'values',
          expect.arrayContaining(updatedEntry.values.map(expect.objectContaining)),
        );
      });

      it('should not change IDs where unnecessary', async () => {
        expect.assertions(5);
        const { entry, resPost, resPostSubcategoryCurrentAccount } = await setupForPut();
        const updatedEntry = {
          ...entry,
          values: [
            ...entry.values.slice(1),
            {
              ...entry.values[0],
              subcategory: resPostSubcategoryCurrentAccount.body.id,
              value: 20311,
            },
          ],
          currencies: [
            ...entry.currencies,
            {
              currency: 'USD',
              rate: 0.796,
            },
          ],
        };

        const res = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${resPost.body.id}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);

        const entryAfter: Entry = res.body;

        expect(entryAfter.id).toBe(resPost.body.id);
        expect(entryAfter.values).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              value: 20311,
            }),
            ...(resPost.body as Entry).values
              .slice(1)
              .map(({ id }) => expect.objectContaining({ id })),
          ]),
        );

        expect(entryAfter.currencies).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              currency: 'USD',
            }),
            ...(resPost.body as Entry).currencies.map(({ id }) => expect.objectContaining({ id })),
          ]),
        );

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            date: updatedEntry.date,
            values: expect.arrayContaining(updatedEntry.values.map(expect.objectContaining)),
            creditLimit: expect.arrayContaining(
              updatedEntry.creditLimit.map(expect.objectContaining),
            ),
            currencies: expect.arrayContaining(
              updatedEntry.currencies.map(expect.objectContaining),
            ),
          }),
        );
      });

      it('should not duplicate options', async () => {
        expect.assertions(4);
        const { entry, resPost, resPostSubcategoryOptions } = await setupForPut();

        const updateOptionA = {
          ...entry,
          values: [
            ...entry.values,
            {
              ...entry.values[0],
              subcategory: resPostSubcategoryOptions.body.id,
              value: [
                {
                  units: 10,
                  strikePrice: 11,
                  marketPrice: 12,
                },
              ],
            },
          ],
        };

        const updateOptionB = {
          ...entry,
          values: [
            {
              ...entry.values[0],
              value: 11111,
            },
            ...updateOptionA.values.slice(1),
          ],
        };

        const resA = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${resPost.body.id}`))
          .send(updateOptionA);

        const resB = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${resPost.body.id}`))
          .send(updateOptionB);

        expect(resA.status).toBe(200);
        expect(resB.status).toBe(200);

        expect(resA.body).not.toStrictEqual(resB.body);

        expect((resB.body as Entry).values).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: [
                {
                  units: 10,
                  strikePrice: 11,
                  marketPrice: 12,
                },
              ],
            }),
          ]),
        );
      });
    });

    describe('DELETE /net-worth/:entryId', () => {
      const setupForDelete = async (): Promise<Response> => {
        const { entry } = await setup();
        const resPost = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth'))
          .send(entry);
        return resPost;
      };

      it('should respond with 204 no content', async () => {
        expect.assertions(2);
        const resPost = await setupForDelete();
        expect(resPost.body.id).toStrictEqual(expect.any(Number));

        const res = await global.withAuth(
          global.agent.delete(`/api/v4/data/net-worth/${resPost.body.id}`),
        );

        expect(res.status).toBe(204);
      });

      it('should respond with 404 on subsequent get requests', async () => {
        expect.assertions(1);
        const resPost = await setupForDelete();
        await global.withAuth(global.agent.delete(`/api/v4/data/net-worth/${resPost.body.id}`));

        const resAfter = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/${resPost.body.id}`),
        );

        expect(resAfter.status).toBe(404);
      });
    });
  });
});
