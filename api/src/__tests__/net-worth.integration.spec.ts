import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import sinon from 'sinon';

import config from '~api/config';
import db from '~api/modules/db';
import { Category, Subcategory, Entry } from '~api/routes/net-worth/types';

describe('Server - integration tests (net-worth)', () => {
  const clearDb = async (): Promise<void> => {
    await db('net_worth')
      .select()
      .del();
    await db('net_worth_subcategories')
      .select()
      .del();
    await db('net_worth_categories')
      .select()
      .del();
  };

  beforeEach(clearDb);
  afterEach(clearDb);

  const category: Omit<Category, 'id'> = {
    type: 'asset',
    category: 'Cash',
    color: '#33ff11',
    isOption: false,
  };

  describe('categories', () => {
    describe('POST /net-worth/categories', () => {
      it('should respond with the category', async () => {
        expect.assertions(3);
        const res = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
          .send(category);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual(expect.objectContaining(category));
        expect(res.body).toHaveProperty('id');
      });

      it('should create the category in the database', async () => {
        expect.assertions(2);
        await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
          .send(category);

        const categories = await db('net_worth_categories').select();

        expect(categories).toHaveLength(1);
        expect(categories[0]).toStrictEqual(
          expect.objectContaining({
            type: category.type,
            category: category.category,
            color: category.color,
            is_option: category.isOption,
          }),
        );
      });

      it('should accept isOption value', async () => {
        expect.assertions(3);

        const res = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/categories'))
          .send({
            ...category,
            isOption: true,
          });

        expect(res.body).toHaveProperty('isOption', true);

        const categories = await db('net_worth_categories').select();

        expect(categories).toHaveLength(1);
        expect(categories[0]).toHaveProperty('is_option', true);
      });
    });

    describe('GET /net-worth/categories/:categoryId', () => {
      let categoryId: string;

      beforeEach(async () => {
        [categoryId] = await db('net_worth_categories')
          .insert({
            type: category.type,
            category: category.category,
            color: category.color,
            is_option: category.isOption,
          })
          .returning('id');
      });

      it('should respond with the category', async () => {
        expect.assertions(3);
        expect(categoryId).toStrictEqual(expect.any(String));

        const res = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/categories/${categoryId}`),
        );

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          id: categoryId,
          ...category,
        });
      });
    });

    describe('PUT /net-worth/categories/:categoryId', () => {
      let categoryId: string;

      beforeEach(async () => {
        [categoryId] = await db('net_worth_categories')
          .insert({
            type: category.type,
            category: category.category,
            color: category.color,
            is_option: category.isOption,
          })
          .returning('id');
      });

      it('should respond with the updated category', async () => {
        expect.assertions(3);
        expect(categoryId).toStrictEqual(expect.any(String));

        const res = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/categories/${categoryId}`))
          .send({
            ...category,
            category: 'Bank',
            isOption: true,
          });

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          id: categoryId,
          ...category,
          category: 'Bank',
          isOption: true,
        });
      });

      it('should update the category in the database', async () => {
        expect.assertions(2);
        await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/categories/${categoryId}`))
          .send({
            ...category,
            category: 'Bank',
            isOption: true,
          });

        const categories = await db('net_worth_categories').select();

        expect(categories).toHaveLength(1);
        expect(categories[0]).toStrictEqual(
          expect.objectContaining({
            type: category.type,
            color: category.color,
            category: 'Bank',
            is_option: true,
          }),
        );
      });
    });

    describe('DELETE /net-worth/categories/:categoryId', () => {
      let categoryId: string;

      beforeEach(async () => {
        [categoryId] = await db('net_worth_categories')
          .insert({
            type: category.type,
            category: category.category,
            color: category.color,
            is_option: category.isOption,
          })
          .returning('id');
      });

      it('should respond with the 204 no content', async () => {
        expect.assertions(2);
        expect(categoryId).toStrictEqual(expect.any(String));

        const res = await global.withAuth(
          global.agent.delete(`/api/v4/data/net-worth/categories/${categoryId}`),
        );

        expect(res.status).toBe(204);
      });

      it('should delete the category in the database', async () => {
        expect.assertions(1);
        await global.withAuth(
          global.agent.delete(`/api/v4/data/net-worth/categories/${categoryId}`),
        );

        const categories = await db('net_worth_categories').select();

        expect(categories).toHaveLength(0);
      });
    });
  });

  describe('subcategories', () => {
    let categoryId: string;
    let subcategory: Omit<Subcategory, 'id'>;

    beforeEach(async () => {
      [categoryId] = await db('net_worth_categories')
        .insert({
          type: category.type,
          category: category.category,
          color: category.color,
          is_option: category.isOption,
        })
        .returning('id');

      subcategory = {
        categoryId,
        subcategory: 'Current account',
        hasCreditLimit: null,
        opacity: 0.8,
      };
    });

    describe('POST /net-worth/subcategories', () => {
      it('should respond with the subcategory', async () => {
        expect.assertions(3);
        const res = await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/subcategories'))
          .send(subcategory);

        expect(res.status).toBe(201);
        expect(res.body).toStrictEqual(expect.objectContaining(subcategory));
        expect(res.body).toHaveProperty('id');
      });

      it('should create the subcategory in the database', async () => {
        expect.assertions(2);
        await global
          .withAuth(global.agent.post('/api/v4/data/net-worth/subcategories'))
          .send(subcategory);

        const subcategories = await db('net_worth_subcategories').select();

        expect(subcategories).toHaveLength(1);
        expect(subcategories[0]).toStrictEqual(
          expect.objectContaining({
            category_id: categoryId,
            subcategory: subcategory.subcategory,
            has_credit_limit: subcategory.hasCreditLimit,
            opacity: subcategory.opacity,
          }),
        );
      });
    });

    describe('GET /net-worth/subcategories/:subcategoryId', () => {
      let subcategoryId: string;

      beforeEach(async () => {
        [subcategoryId] = await db('net_worth_subcategories')
          .insert({
            category_id: categoryId,
            subcategory: subcategory.subcategory,
            has_credit_limit: subcategory.hasCreditLimit,
            opacity: subcategory.opacity,
          })
          .returning('id');
      });

      it('should respond with the subcategory', async () => {
        expect.assertions(3);
        expect(categoryId).toStrictEqual(expect.any(String));

        const res = await global.withAuth(
          global.agent.get(`/api/v4/data/net-worth/subcategories/${subcategoryId}`),
        );

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          id: subcategoryId,
          ...subcategory,
        });
      });
    });

    describe('PUT /net-worth/subcategories/:subcategoryId', () => {
      let subcategoryId: string;

      beforeEach(async () => {
        [subcategoryId] = await db('net_worth_subcategories')
          .insert({
            category_id: categoryId,
            subcategory: subcategory.subcategory,
            has_credit_limit: subcategory.hasCreditLimit,
            opacity: subcategory.opacity,
          })
          .returning('id');
      });

      it('should respond with the updated subcategory', async () => {
        expect.assertions(3);
        expect(categoryId).toStrictEqual(expect.any(String));

        const res = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/subcategories/${subcategoryId}`))
          .send({
            ...subcategory,
            subcategory: 'Savings account',
          });

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          id: subcategoryId,
          ...subcategory,
          subcategory: 'Savings account',
        });
      });

      it('should update the subcategory in the database', async () => {
        expect.assertions(2);
        await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/subcategories/${subcategoryId}`))
          .send({
            ...subcategory,
            subcategory: 'Savings account',
          });

        const subcategories = await db('net_worth_subcategories').select();

        expect(subcategories).toHaveLength(1);
        expect(subcategories[0]).toStrictEqual(
          expect.objectContaining({
            category_id: categoryId,
            subcategory: 'Savings account',
            has_credit_limit: subcategory.hasCreditLimit,
            opacity: subcategory.opacity,
          }),
        );
      });
    });

    describe('DELETE /net-worth/categories/:categoryId', () => {
      let subcategoryId: string;

      beforeEach(async () => {
        [subcategoryId] = await db('net_worth_subcategories')
          .insert({
            category_id: categoryId,
            subcategory: subcategory.subcategory,
            has_credit_limit: subcategory.hasCreditLimit,
            opacity: subcategory.opacity,
          })
          .returning('id');
      });

      it('should respond with the 204 no content', async () => {
        expect.assertions(2);
        expect(categoryId).toStrictEqual(expect.any(String));

        const res = await global.withAuth(
          global.agent.delete(`/api/v4/data/net-worth/subcategories/${subcategoryId}`),
        );

        expect(res.status).toBe(204);
      });

      it('should delete the subcategory in the database', async () => {
        expect.assertions(1);
        await global.withAuth(
          global.agent.delete(`/api/v4/data/net-worth/subcategories/${subcategoryId}`),
        );

        const subcategories = await db('net_worth_subcategories').select();

        expect(subcategories).toHaveLength(0);
      });
    });
  });

  describe('entries', () => {
    type OptionalId<T extends object> = Omit<T, 'id'> & {
      id?: string;
    };

    const categoryBank: OptionalId<Category> = {
      type: 'asset',
      category: 'Bank',
      color: 'green',
    };

    const categoryOptions: OptionalId<Category> = {
      type: 'asset',
      category: 'Options',
      color: 'turquoise',
      isOption: true,
    };

    const categoryCC: OptionalId<Category> = {
      type: 'liability',
      category: 'Credit Cards',
      color: 'red',
    };

    const subcategoryCurrentAccount: OptionalId<Subcategory> = {
      categoryId: '',
      subcategory: 'Current account',
      hasCreditLimit: null,
      opacity: 0.8,
    };

    const subcategoryOptions: OptionalId<Subcategory> = {
      categoryId: '',
      subcategory: 'Company X Ord 5p',
      hasCreditLimit: null,
      opacity: 1,
    };

    const subcategoryMainCC: OptionalId<Subcategory> = {
      categoryId: '',
      subcategory: 'Main credit card',
      hasCreditLimit: true,
      opacity: 0.5,
    };

    const subcategoryTravelCC: OptionalId<Subcategory> = {
      categoryId: '',
      subcategory: 'Travel credit card',
      hasCreditLimit: true,
      opacity: 0.7,
    };

    let entry: Omit<Entry, 'id'>;

    beforeEach(async () => {
      const [categoryIdBank] = await db('net_worth_categories')
        .insert({ ...categoryBank, id: undefined })
        .returning('id');
      categoryBank.id = categoryIdBank;

      const [categoryIdOptions] = await db('net_worth_categories')
        .insert({
          type: categoryOptions.type,
          category: categoryOptions.category,
          color: categoryOptions.color,
          is_option: categoryOptions.isOption,
        })
        .returning('id');
      categoryOptions.id = categoryIdOptions;

      const [categoryIdCC] = await db('net_worth_categories')
        .insert({ ...categoryCC, id: undefined })
        .returning('id');
      categoryCC.id = categoryIdBank;

      subcategoryCurrentAccount.categoryId = categoryIdBank;
      subcategoryOptions.categoryId = categoryIdOptions;
      subcategoryMainCC.categoryId = categoryIdCC;
      subcategoryTravelCC.categoryId = categoryIdCC;

      const [subcategoryIdCurrentAccount] = await db('net_worth_subcategories')
        .insert({
          category_id: subcategoryCurrentAccount.categoryId,
          subcategory: subcategoryCurrentAccount.subcategory,
          has_credit_limit: subcategoryCurrentAccount.hasCreditLimit,
          opacity: subcategoryCurrentAccount.opacity,
        })
        .returning('id');
      const [subcategoryIdOptions] = await db('net_worth_subcategories')
        .insert({
          category_id: categoryIdOptions,
          subcategory: 'Company X Ord 5p',
          has_credit_limit: null,
          opacity: 1,
        })
        .returning('id');
      const [subcategoryIdMainCC] = await db('net_worth_subcategories')
        .insert({
          category_id: subcategoryMainCC.categoryId,
          subcategory: subcategoryMainCC.subcategory,
          has_credit_limit: subcategoryMainCC.hasCreditLimit,
          opacity: subcategoryMainCC.opacity,
        })
        .returning('id');
      const [subcategoryIdTravelCC] = await db('net_worth_subcategories')
        .insert({
          category_id: subcategoryTravelCC.categoryId,
          subcategory: subcategoryTravelCC.subcategory,
          has_credit_limit: subcategoryTravelCC.hasCreditLimit,
          opacity: subcategoryTravelCC.opacity,
        })
        .returning('id');

      subcategoryCurrentAccount.id = subcategoryIdCurrentAccount;
      subcategoryOptions.id = subcategoryIdOptions;
      subcategoryMainCC.id = subcategoryIdMainCC;
      subcategoryTravelCC.id = subcategoryIdTravelCC;

      entry = {
        date: '2020-04-14',
        values: [
          {
            subcategory: (subcategoryCurrentAccount as Subcategory).id,
            skip: null,
            value: [
              {
                value: 62000,
                currency: 'CNY',
              },
            ],
          },
          {
            subcategory: (subcategoryMainCC as Subcategory).id,
            skip: null,
            value: -15000,
          },
          {
            subcategory: (subcategoryTravelCC as Subcategory).id,
            skip: true,
            value: -1340,
          },
        ],
        creditLimit: [
          {
            subcategory: (subcategoryMainCC as Subcategory).id,
            value: 250000,
          },
          {
            subcategory: (subcategoryTravelCC as Subcategory).id,
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
    });

    describe('POST /net-worth', () => {
      it('should respond with the entry', async () => {
        expect.assertions(6);
        const res = await global.withAuth(global.agent.post('/api/v4/data/net-worth')).send(entry);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('date', '2020-04-14');
        expect(res.body).toHaveProperty(
          'values',
          expect.arrayContaining([
            expect.objectContaining(entry.values[0]),
            expect.objectContaining(entry.values[1]),
            expect.objectContaining(entry.values[2]),
          ]),
        );
        expect(res.body).toHaveProperty(
          'creditLimit',
          expect.arrayContaining(entry.creditLimit.map(expect.objectContaining)),
        );
        expect(res.body).toHaveProperty('currencies', [
          expect.objectContaining(entry.currencies[0]),
        ]);
        expect(res.body).toHaveProperty('id');
      });

      describe('sending entry with option values', () => {
        let entryWithOption: Omit<Entry, 'id'>;

        beforeEach(async () => {
          entryWithOption = {
            date: '2020-04-15',
            values: [
              {
                subcategory: (subcategoryOptions as Subcategory).id,
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
        });

        it('should add the option value to the entry', async () => {
          expect.assertions(3);

          const res = await global
            .withAuth(global.agent.post('/api/v4/data/net-worth'))
            .send(entryWithOption);

          expect(res.status).toBe(201);
          expect(res.body).toHaveProperty(
            'values',
            expect.arrayContaining([expect.objectContaining(entryWithOption.values[0])]),
          );
          expect(res.body).toHaveProperty('id');
        });
      });
    });

    describe('GET /net-worth/:entryId', () => {
      let entryId: string;

      beforeEach(async () => {
        ({
          body: { id: entryId },
        } = await global.withAuth(global.agent.post('/api/v4/data/net-worth')).send(entry));
      });

      it('should respond with the entry', async () => {
        expect.assertions(3);
        expect(entryId).toStrictEqual(expect.any(String));

        const res = await global.withAuth(global.agent.get(`/api/v4/data/net-worth/${entryId}`));

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            id: entryId,
            date: '2020-04-14',
            values: expect.arrayContaining(entry.values.map(expect.objectContaining)),
            creditLimit: expect.arrayContaining(entry.creditLimit.map(expect.objectContaining)),
            currencies: expect.arrayContaining(entry.currencies.map(expect.objectContaining)),
          }),
        );
      });
    });

    describe('GET /net-worth', () => {
      const now = new Date('2020-04-10');
      let clock: sinon.SinonFakeTimers;

      let mods: Partial<Entry>[] = [];

      beforeAll(() => {
        clock = sinon.useFakeTimers(now);
      });

      afterAll(() => {
        clock.restore();
      });

      beforeEach(async () => {
        mods = [
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
                subcategory: (subcategoryOptions as Subcategory).id,
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

        await Promise.all(
          mods.map(mod =>
            global.withAuth(global.agent.post('/api/v4/data/net-worth')).send({
              ...entry,
              ...mod,
            }),
          ),
        );
      });

      it('should get a list of net worth entries', async () => {
        expect.assertions(2);
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

      it('should put old values in their own section', async () => {
        expect.assertions(2);
        const res = await global.withAuth(global.agent.get(`/api/v4/data/net-worth`));

        const entryValueOld =
          5871 + Math.round(2040.76 * 0.113 * 100) + Math.round(1324 * 19.27) - 15000;
        const entryValueOlder = 62000 * 0.113 * 100 - 15000;

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            old: [entryValueOlder, entryValueOld],
          }),
        );
      });
    });

    describe('PUT /net-worth/:entryId', () => {
      let entryId: string;

      beforeEach(async () => {
        ({
          body: { id: entryId },
        } = await global.withAuth(global.agent.post('/api/v4/data/net-worth')).send(entry));
      });

      it('should update the date', async () => {
        expect.assertions(2);
        const updatedEntry = {
          ...entry,
          date: '2020-04-15',
        };

        const res = await global
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${entryId}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('date', updatedEntry.date);
      });

      it('should update a value', async () => {
        expect.assertions(2);
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
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${entryId}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'values',
          expect.arrayContaining(updatedEntry.values.map(expect.objectContaining)),
        );
      });

      it('should update a credit limit', async () => {
        expect.assertions(2);
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
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${entryId}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'creditLimit',
          expect.arrayContaining(updatedEntry.creditLimit.map(expect.objectContaining)),
        );
      });

      it('should update a currency', async () => {
        expect.assertions(2);
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
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${entryId}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'currencies',
          expect.arrayContaining(updatedEntry.currencies.map(expect.objectContaining)),
        );
      });

      it('should update an option price', async () => {
        expect.assertions(2);

        const updatedEntry = {
          ...entry,
          values: [
            {
              ...entry.values[0],
              subcategory: (subcategoryMainCC as Subcategory).id,
              value: -103,
            },
            {
              ...entry.values[0],
              subcategory: (subcategoryOptions as Subcategory).id,
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
          .withAuth(global.agent.put(`/api/v4/data/net-worth/${entryId}`))
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'values',
          expect.arrayContaining(updatedEntry.values.map(expect.objectContaining)),
        );
      });
    });

    describe('DELETE /net-worth/:entryId', () => {
      let entryId: string;

      beforeEach(async () => {
        ({
          body: { id: entryId },
        } = await global.withAuth(global.agent.post('/api/v4/data/net-worth')).send(entry));
      });

      it('should respond with the 204 no content', async () => {
        expect.assertions(2);
        expect(entryId).toStrictEqual(expect.any(String));

        const res = await global.withAuth(global.agent.delete(`/api/v4/data/net-worth/${entryId}`));

        expect(res.status).toBe(204);
      });

      it('should delete the entry in the database', async () => {
        expect.assertions(1);
        await global.withAuth(global.agent.delete(`/api/v4/data/net-worth/${entryId}`));

        const entries = await db('net_worth').select();

        expect(entries).toHaveLength(0);
      });
    });
  });
});
