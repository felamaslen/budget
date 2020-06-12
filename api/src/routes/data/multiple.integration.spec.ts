import MockDate from 'mockdate';
import moize from 'moize';
import { Response } from 'supertest';
import db from '~api/test-utils/knex';

/**
 * This is a legacy route and should eventually be phased out,
 * in favour of a GraphQL implementation
 */

describe('PATCH /multiple', () => {
  const setup = moize(
    async (): Promise<Response> => {
      const resGeneral = await global.withAuth(global.agent.post('/api/v4/data/general')).send({
        date: '2020-04-20',
        item: 'Old general item',
        category: 'Old general category',
        cost: 203,
        shop: 'Old general shop',
      });

      const resHoliday = await global.withAuth(global.agent.post('/api/v4/data/holiday')).send({
        date: '2020-04-21',
        item: 'Old holiday',
        holiday: 'Somewhere',
        cost: 98672,
        shop: 'skyscanner.com',
      });

      const res = await global.withAuth(global.agent.patch('/api/v4/data/multiple')).send({
        list: [
          {
            route: 'funds',
            method: 'post',
            query: {},
            body: {
              item: 'Some created fund',
              transactions: [{ date: '2020-04-30', units: 231.75, cost: 18872 }],
            },
          },
          {
            route: 'food',
            method: 'post',
            query: {},
            body: {
              date: '2020-04-19',
              item: 'Some created food',
              category: 'Generic food',
              cost: 251,
              shop: "Sainsbury's",
            },
          },
          {
            route: 'general',
            method: 'put',
            query: {},
            body: {
              id: resGeneral.body.id,
              item: 'New general item',
            },
          },
          {
            route: 'holiday',
            method: 'delete',
            query: {},
            body: {
              id: resHoliday.body.id,
            },
          },
        ],
      });

      return res;
    },
    { isPromise: true },
  );

  const clearDb = async (): Promise<void> => {
    await db('funds').where({ item: 'Some created fund' }).del();
    await db('food').where({ item: 'Some created food' }).del();
    await db('general').where({ item: 'Old general item' }).del();
  };

  beforeAll(async () => {
    await clearDb();
    MockDate.set(new Date('2020-04-20'));
  });

  afterAll(async () => {
    MockDate.reset();
    await clearDb();
  });

  it('should create a fund', async () => {
    expect.assertions(3);

    const res = await setup();
    const resGet = await global.withAuth(global.agent.get('/api/v4/data/funds'));

    expect(resGet.body.data.data).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          i: 'Some created fund',
          tr: [{ date: '2020-04-30', units: 231.75, cost: 18872 }],
        }),
      ]),
    );

    const id = resGet.body.data.data.find((row: { i: string }) => row.i === 'Some created fund')?.I;
    expect(id).not.toBeUndefined();
    expect(id).toBe(res.body.data[0].id);
  });

  it('should create food data', async () => {
    expect.assertions(3);

    const res = await setup();
    const resGet = await global.withAuth(global.agent.get('/api/v4/data/food'));

    expect(resGet.body.data.data).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          d: '2020-04-19',
          i: 'Some created food',
          k: 'Generic food',
          c: 251,
          s: "Sainsbury's",
        }),
      ]),
    );

    const id = resGet.body.data.data.find((row: { i: string }) => row.i === 'Some created food')?.I;
    expect(id).not.toBeUndefined();
    expect(id).toBe(res.body.data[1].id);
  });

  it('should update general data', async () => {
    expect.assertions(1);

    await setup();
    const resGet = await global.withAuth(global.agent.get('/api/v4/data/general'));

    expect(resGet.body.data.data).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          d: '2020-04-20',
          i: 'New general item',
          k: 'Old general category',
          c: 203,
          s: 'Old general shop',
        }),
      ]),
    );
  });

  it('should delete holiday data', async () => {
    expect.assertions(1);

    await setup();

    const resGet = await global.withAuth(global.agent.get('/api/v4/data/holiday'));

    expect(resGet.body.data.data).not.toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          d: '2020-04-21',
          h: 'Old holiday',
          k: 'Flights',
          c: 98672,
          s: 'skyscanner.com',
        }),
      ]),
    );
  });
});
