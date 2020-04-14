import { Server } from 'http';
import request, { Test, SuperTest } from 'supertest';
import axios from 'axios';

import { run } from '..';
import db from '~api/modules/db';
import { Category, Subcategory } from '~api/routes/net-worth/types';

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

  beforeEach(async () => {
    await db('net_worth')
      .select()
      .del();
    await db('net_worth_subcategories')
      .select()
      .del();
    await db('net_worth_categories')
      .select()
      .del();
  });

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
});
