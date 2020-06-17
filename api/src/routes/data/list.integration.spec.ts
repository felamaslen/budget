import MockDate from 'mockdate';
import { Response } from 'supertest';

import db from '~api/test-utils/knex';
import { Page } from '~api/types';

describe('Standard list routes', () => {
  beforeAll(() => {
    MockDate.set(new Date('2020-04-20'));
  });
  afterAll(() => {
    MockDate.reset();
  });

  const income = {
    date: '2020-04-20',
    item: 'Salary (my job)',
    cost: 328967, // bit of a misnomer for this route :)
  };
  const incomeDelta = { item: 'Different salary (changed jobs)' };

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
    holiday: 'Australia',
    cost: 156543,
    shop: 'skyscanner.com',
  };
  const holidayDelta = { item: 'Refund', holiday: 'Pandemic' };

  const social = {
    date: '2020-04-07',
    item: 'Pizza',
    society: 'Remote social',
    cost: 2945,
    shop: 'Dominoes',
  };
  const socialDelta = { item: 'Garlic bread' };

  describe.each`
    page            | testItem   | delta           | readProps
    ${Page.income}  | ${income}  | ${incomeDelta}  | ${{}}
    ${Page.bills}   | ${bill}    | ${billDelta}    | ${{}}
    ${Page.food}    | ${food}    | ${foodDelta}    | ${{ k: 'Fruit', s: 'Tesco' }}
    ${Page.general} | ${general} | ${generalDelta} | ${{ k: 'Medicine', s: 'Boots' }}
    ${Page.holiday} | ${holiday} | ${holidayDelta} | ${{ h: 'Australia', s: 'skyscanner.com' }}
    ${Page.social}  | ${social}  | ${socialDelta}  | ${{ y: 'Remote social', s: 'Dominoes' }}
  `('$page route', ({ page, testItem, delta, readProps }) => {
    const clearDb = async (): Promise<void> => {
      await db(page).where({ item: testItem.item }).del();
      await db(page).where({ item: delta.item }).del();
    };

    beforeEach(clearDb);

    describe(`POST /${page}`, () => {
      const setup = async (): Promise<Response> => {
        const res = await global.withAuth(global.agent.post(`/api/v4/data/${page}`)).send(testItem);
        return res;
      };

      it('should respond with a 201 status', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res.status).toBe(201);
      });

      it('should respond with the inserted ID', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            id: expect.any(String),
          }),
        );
      });

      it('should respond with the total cost', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            total: expect.any(Number),
          }),
        );
      });

      it('should respond with the weekly cost', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            weekly: expect.any(Number),
          }),
        );
      });

      it('should respond with the item on subsequent get requests', async () => {
        expect.assertions(1);
        const res = await setup();

        const resAfter = await global.withAuth(global.agent.get(`/api/v4/data/${page}`));

        expect(resAfter.body.data.data).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              I: res.body.id,
            }),
          ]),
        );
      });
    });

    describe(`GET /${page}`, () => {
      const setup = async (data: object = testItem): Promise<Response> => {
        await global.withAuth(global.agent.post(`/api/v4/data/${page}`)).send(data);
        const res = await global.withAuth(global.agent.get(`/api/v4/data/${page}`));
        return res;
      };

      it(`should get a list of ${page} data`, async () => {
        expect.assertions(2);
        const res = await setup();

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          data: expect.objectContaining({
            total: expect.any(Number),
            weekly: expect.any(Number),
            olderExists: expect.any(Boolean),
            data: expect.arrayContaining([
              expect.objectContaining({
                I: expect.any(String), // ID
                d: testItem.date,
                i: testItem.item,
                c: testItem.cost,
                ...readProps,
              }),
            ]),
          }),
        });
      });
    });

    describe(`PUT /${page}`, () => {
      const modifiedItem = {
        ...testItem,
        ...delta,
      };

      const setup = async (data: object = modifiedItem): Promise<Response> => {
        const resPost = await global
          .withAuth(global.agent.post(`/api/v4/data/${page}`))
          .send(testItem);
        const res = await global.withAuth(
          global.agent.put(`/api/v4/data/${page}`).send({
            id: resPost.body.id,
            ...data,
          }),
        );
        return res;
      };

      it('should respond with a 200 status code', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res.status).toBe(200);
      });

      it('should respond with the updated total', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            total: expect.any(Number),
          }),
        );
      });

      it('should respond with the updated weekly cost', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            weekly: expect.any(Number),
          }),
        );
      });

      it('should respond with the updated item on subsequent get requests', async () => {
        expect.assertions(1);
        await setup();

        const resAfter = await global.withAuth(global.agent.get(`/api/v4/data/${page}`));

        expect(resAfter.body.data.data).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              d: modifiedItem.date,
              i: modifiedItem.item,
              c: modifiedItem.cost,
            }),
          ]),
        );
      });
    });

    describe(`DELETE /${page}`, () => {
      const setup = async (): Promise<Response> => {
        const resPost = await global
          .withAuth(global.agent.post(`/api/v4/data/${page}`))
          .send(testItem);
        const res = await global.withAuth(
          global.agent.delete(`/api/v4/data/${page}`).send({
            id: resPost.body.id,
          }),
        );
        return res;
      };

      it('should respond with a successful status code', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.status).toBe(200);
      });

      it('should respond with the updated total cost', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            total: expect.any(Number),
          }),
        );
      });

      it('should respond with the updated weekly cost', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            weekly: expect.any(Number),
          }),
        );
      });

      it('should not respond with the item on subsequent get requests', async () => {
        expect.assertions(1);
        await setup();

        const resAfter = await global.withAuth(global.agent.get(`/api/v4/data/${page}`));

        expect(resAfter.body.data.data).not.toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              date: testItem.date,
              item: testItem.item,
              cost: testItem.cost,
            }),
          ]),
        );
      });
    });
  });
});
