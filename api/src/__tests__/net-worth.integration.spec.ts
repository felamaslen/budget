import sinon from 'sinon';
import { Server } from 'http';
import request, { Test, SuperTest } from 'supertest';
import axios from 'axios';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';

import { run } from '..';
import config from '~api/config';
import db from '~api/modules/db';
import { Category, Subcategory, Entry } from '~api/routes/net-worth/types';

describe('Server - integration tests (net-worth)', () => {
  let server: Server;
  let agent: SuperTest<Test>;
  let token: string;

  beforeAll(async () => {
    server = await run(4444);
    agent = request.agent(server);

    ({
      data: { apiKey: token },
    } = await axios.post('http://127.0.0.1:4444/api/v4/user/login', {
      pin: 1234,
    }));
  });

  afterAll(done => {
    server.close(done);
  });

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
  };

  describe('categories', () => {
    describe('POST /net-worth/categories', () => {
      it('should respond with the category', async () => {
        const res = await agent
          .post('/api/v4/data/net-worth/categories')
          .set('Authorization', token)
          .send(category);

        expect(res.status).toBe(201);
        expect(res.body).toEqual(expect.objectContaining(category));
        expect(res.body).toHaveProperty('id');
      });

      it('should create the category in the database', async () => {
        await agent
          .post('/api/v4/data/net-worth/categories')
          .set('Authorization', token)
          .send(category);

        const categories = await db('net_worth_categories').select();

        expect(categories).toHaveLength(1);
        expect(categories[0]).toEqual(expect.objectContaining(category));
      });
    });

    describe('GET /net-worth/categories/:categoryId', () => {
      let categoryId: string;

      beforeEach(async () => {
        [categoryId] = await db('net_worth_categories')
          .insert(category)
          .returning('id');
      });

      it('should respond with the category', async () => {
        expect(categoryId).toBeTruthy();

        const res = await agent
          .get(`/api/v4/data/net-worth/categories/${categoryId}`)
          .set('Authorization', token);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          id: categoryId,
          ...category,
        });
      });
    });

    describe('PUT /net-worth/categories/:categoryId', () => {
      let categoryId: string;

      beforeEach(async () => {
        [categoryId] = await db('net_worth_categories')
          .insert(category)
          .returning('id');
      });

      it('should respond with the updated category', async () => {
        expect(categoryId).toBeTruthy();

        const res = await agent
          .put(`/api/v4/data/net-worth/categories/${categoryId}`)
          .set('Authorization', token)
          .send({
            ...category,
            category: 'Bank',
          });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          id: categoryId,
          ...category,
          category: 'Bank',
        });
      });

      it('should update the category in the database', async () => {
        await agent
          .put(`/api/v4/data/net-worth/categories/${categoryId}`)
          .set('Authorization', token)
          .send({
            ...category,
            category: 'Bank',
          });

        const categories = await db('net_worth_categories').select();

        expect(categories).toHaveLength(1);
        expect(categories[0]).toEqual(
          expect.objectContaining({
            ...category,
            category: 'Bank',
          }),
        );
      });
    });

    describe('DELETE /net-worth/categories/:categoryId', () => {
      let categoryId: string;

      beforeEach(async () => {
        [categoryId] = await db('net_worth_categories')
          .insert(category)
          .returning('id');
      });

      it('should respond with the 204 no content', async () => {
        expect(categoryId).toBeTruthy();

        const res = await agent
          .delete(`/api/v4/data/net-worth/categories/${categoryId}`)
          .set('Authorization', token);

        expect(res.status).toBe(204);
      });

      it('should delete the category in the database', async () => {
        await agent
          .delete(`/api/v4/data/net-worth/categories/${categoryId}`)
          .set('Authorization', token);

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
        .insert(category)
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
        const res = await agent
          .post('/api/v4/data/net-worth/subcategories')
          .set('Authorization', token)
          .send(subcategory);

        expect(res.status).toBe(201);
        expect(res.body).toEqual(expect.objectContaining(subcategory));
        expect(res.body).toHaveProperty('id');
      });

      it('should create the subcategory in the database', async () => {
        await agent
          .post('/api/v4/data/net-worth/subcategories')
          .set('Authorization', token)
          .send(subcategory);

        const subcategories = await db('net_worth_subcategories').select();

        expect(subcategories).toHaveLength(1);
        expect(subcategories[0]).toEqual(
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
        expect(subcategoryId).toBeTruthy();

        const res = await agent
          .get(`/api/v4/data/net-worth/subcategories/${subcategoryId}`)
          .set('Authorization', token);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
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
        expect(subcategoryId).toBeTruthy();

        const res = await agent
          .put(`/api/v4/data/net-worth/subcategories/${subcategoryId}`)
          .set('Authorization', token)
          .send({
            ...subcategory,
            subcategory: 'Savings account',
          });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          id: subcategoryId,
          ...subcategory,
          subcategory: 'Savings account',
        });
      });

      it('should update the subcategory in the database', async () => {
        await agent
          .put(`/api/v4/data/net-worth/subcategories/${subcategoryId}`)
          .set('Authorization', token)
          .send({
            ...subcategory,
            subcategory: 'Savings account',
          });

        const subcategories = await db('net_worth_subcategories').select();

        expect(subcategories).toHaveLength(1);
        expect(subcategories[0]).toEqual(
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
        expect(subcategoryId).toBeTruthy();

        const res = await agent
          .delete(`/api/v4/data/net-worth/subcategories/${subcategoryId}`)
          .set('Authorization', token);

        expect(res.status).toBe(204);
      });

      it('should delete the subcategory in the database', async () => {
        await agent
          .delete(`/api/v4/data/net-worth/subcategories/${subcategoryId}`)
          .set('Authorization', token);

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

      const [categoryIdCC] = await db('net_worth_categories')
        .insert({ ...categoryCC, id: undefined })
        .returning('id');
      categoryCC.id = categoryIdBank;

      subcategoryCurrentAccount.categoryId = categoryIdBank;
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
      subcategoryMainCC.id = subcategoryIdMainCC;
      subcategoryTravelCC.id = subcategoryIdTravelCC;

      entry = {
        date: new Date('2020-04-14'),
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
        const res = await agent
          .post('/api/v4/data/net-worth')
          .set('Authorization', token)
          .send(entry);

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
    });

    describe('GET /net-worth/:entryId', () => {
      let entryId: string;

      beforeEach(async () => {
        ({
          body: { id: entryId },
        } = await agent
          .post('/api/v4/data/net-worth')
          .set('Authorization', token)
          .send(entry));
      });

      it('should respond with the entry', async () => {
        expect(entryId).toBeTruthy();

        const res = await agent
          .get(`/api/v4/data/net-worth/${entryId}`)
          .set('Authorization', token);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
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
        clock.reset();
      });

      beforeEach(async () => {
        mods = [
          {
            date: new Date('2020-04-14'),
          },
          { date: new Date('2020-01-31') },
          { date: new Date('2020-03-30') },
          { date: new Date('2020-02-29') },
          { date: new Date('2019-12-31') },
          { date: new Date('2019-12-18') },
          { date: new Date('2020-02-28') },
          {
            date: addMonths(now, -(config.data.overview.numLast + 1)),
            values: [
              {
                ...entry.values[0],
                value: 500000,
              },
              ...entry.values.slice(1),
            ],
          },
          { date: addMonths(now, -(config.data.overview.numLast + 3)) },
        ];

        await Promise.all(
          mods.map(mod =>
            agent
              .post('/api/v4/data/net-worth')
              .set('Authorization', token)
              .send({
                ...entry,
                ...mod,
              }),
          ),
        );
      });

      it('should get a list of net worth entries', async () => {
        const res = await agent.get(`/api/v4/data/net-worth`).set('Authorization', token);

        const expectedResults = mods.slice(0, 7).map(({ date }) =>
          expect.objectContaining({
            date: format(date || entry.date, 'yyyy-MM-dd'),
            values: expect.arrayContaining(entry.values.map(expect.objectContaining)),
            creditLimit: expect.arrayContaining(entry.creditLimit.map(expect.objectContaining)),
            currencies: expect.arrayContaining(entry.currencies.map(expect.objectContaining)),
          }),
        );

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            items: expect.arrayContaining(expectedResults),
          }),
        );
      });

      it('should put old values in their own section', async () => {
        const res = await agent.get(`/api/v4/data/net-worth`).set('Authorization', token);

        const entryValueOld = 500000 - 15000;
        const entryValueOlder = 62000 * 0.113 * 100 - 15000;

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
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
        } = await agent
          .post('/api/v4/data/net-worth')
          .set('Authorization', token)
          .send(entry));
      });

      it('should update the date', async () => {
        const updatedEntry = {
          ...entry,
          date: '2020-04-15',
        };

        const res = await agent
          .put(`/api/v4/data/net-worth/${entryId}`)
          .set('Authorization', token)
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('date', updatedEntry.date);
      });

      it('should update a value', async () => {
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

        const res = await agent
          .put(`/api/v4/data/net-worth/${entryId}`)
          .set('Authorization', token)
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'values',
          expect.arrayContaining(updatedEntry.values.map(expect.objectContaining)),
        );
      });

      it('should update a credit limit', async () => {
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

        const res = await agent
          .put(`/api/v4/data/net-worth/${entryId}`)
          .set('Authorization', token)
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'creditLimit',
          expect.arrayContaining(updatedEntry.creditLimit.map(expect.objectContaining)),
        );
      });

      it('should update a currency', async () => {
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

        const res = await agent
          .put(`/api/v4/data/net-worth/${entryId}`)
          .set('Authorization', token)
          .send(updatedEntry);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty(
          'currencies',
          expect.arrayContaining(updatedEntry.currencies.map(expect.objectContaining)),
        );
      });
    });

    describe('DELETE /net-worth/:entryId', () => {
      let entryId: string;

      beforeEach(async () => {
        ({
          body: { id: entryId },
        } = await agent
          .post('/api/v4/data/net-worth')
          .set('Authorization', token)
          .send(entry));
      });

      it('should respond with the 204 no content', async () => {
        expect(entryId).toBeTruthy();

        const res = await agent
          .delete(`/api/v4/data/net-worth/${entryId}`)
          .set('Authorization', token);

        expect(res.status).toBe(204);
      });

      it('should delete the entry in the database', async () => {
        await agent.delete(`/api/v4/data/net-worth/${entryId}`).set('Authorization', token);

        const entries = await db('net_worth').select();

        expect(entries).toHaveLength(0);
      });
    });
  });
});
