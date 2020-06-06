import { getUnixTime } from 'date-fns';
import md5 from 'md5';
import MockDate from 'mockdate';
import { Response } from 'supertest';

import config from '~api/config';
import db from '~api/modules/db';
import { Create, FundRaw } from '~api/types';

describe('Funds route', () => {
  const fund = {
    item: 'My fund',
    transactions: [{ date: '2020-04-20', units: 69, cost: 69420 }],
  };

  const clearDb = async (): Promise<void> => {
    await db('funds').where({ item: fund.item }).del();
  };

  beforeEach(clearDb);
  afterEach(clearDb);

  describe('POST /funds', () => {
    const setup = async (): Promise<Response> => {
      const res = await global.withAuth(global.agent.post('/api/v4/data/funds')).send(fund);
      return res;
    };

    it('should respond with the fund', async () => {
      expect.assertions(2);
      const res = await setup();

      expect(res.status).toBe(201);
      expect(res.body).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          total: expect.any(Number),
        }),
      );
    });

    it('should create the fund in the database', async () => {
      expect.assertions(1);
      const res = await setup();

      const funds = await db('funds').where({ id: res.body.id }).select();

      expect(funds[0]).toStrictEqual(
        expect.objectContaining({
          item: fund.item,
        }),
      );
    });

    it('should create the transactions in the database', async () => {
      expect.assertions(1);
      const res = await setup();

      const transactions = await db('funds_transactions')
        .where({
          fund_id: res.body.id,
        })
        .select();

      expect(transactions).toStrictEqual([expect.objectContaining({ units: 69, cost: 69420 })]);
    });
  });

  describe('GET /funds', () => {
    const setup = async (data: Create<FundRaw> = fund): Promise<Response> => {
      await global.withAuth(global.agent.post('/api/v4/data/funds')).send(data);
      const res = await global.withAuth(
        global.agent.get('/api/v4/data/funds?history&period=year&length=1'),
      );
      return res;
    };

    it('should get a list of funds with their transactions', async () => {
      expect.assertions(2);
      const res = await setup();

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        data: expect.objectContaining({
          total: expect.any(Number),
          data: expect.arrayContaining([
            expect.objectContaining({
              I: expect.any(String), // fund ID
              i: 'My fund',
              tr: [{ date: new Date('2020-04-20').toISOString(), units: 69, cost: 69420 }],
            }),
          ]),
        }),
      });
    });

    it("should set transactions to an empty array, if there aren't any", async () => {
      expect.assertions(1);

      const res = await setup({ item: 'Other fund', transactions: [] });

      expect(
        res.body.data.data.find((item: { i: string }) => item.i === 'Other fund'),
      ).toStrictEqual(expect.objectContaining({ tr: [] }));
    });

    describe('if there are historical price data', () => {
      let fid: string;
      let cids: string[];
      beforeAll(async () => {
        [fid] = await db('fund_hash')
          .insert([{ broker: 'hl', hash: md5(`${fund.item}${config.data.funds.salt}`) }])
          .returning('fid');

        cids = await db('fund_cache_time')
          .insert([
            { time: new Date('2020-04-20T17:01:01Z'), done: true },
            { time: new Date('2020-04-21T17:01:01Z'), done: true },
            { time: new Date('2020-04-22T09:49:10Z'), done: true },
            { time: new Date('2020-04-22T17:01:03Z'), done: true },
            { time: new Date('2020-04-23T17:03:03Z'), done: true },
            { time: new Date('2020-04-24T17:01:01Z'), done: true },
            { time: new Date('2020-04-25T17:01:02Z'), done: true },
          ])
          .returning('cid');

        await db('fund_cache').insert([
          { cid: cids[0], fid, price: 105 },
          { cid: cids[1], fid, price: 103 },
          { cid: cids[2], fid, price: 105.6 },
          { cid: cids[3], fid, price: 110.9 },
          { cid: cids[4], fid, price: 97.2 },
          { cid: cids[5], fid, price: 91.3 },
          { cid: cids[6], fid, price: 99.87 },
        ]);

        MockDate.set(new Date('2020-04-26T13:20:03Z'));
      });

      afterAll(async () => {
        MockDate.reset();

        await db('fund_hash').where({ fid }).del();
        await db('fund_cache_time').whereIn('cid', cids).del();
      });

      it('should attach price lists to the fund response', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual({
          data: expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                pr: [105, 103, 105.6, 110.9, 97.2, 91.3, 99.87],
                prStartIndex: 0,
              }),
            ]),
          }),
        });
      });

      it('should attach the timestamp of the first cached price', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual({
          data: expect.objectContaining({
            startTime: getUnixTime(new Date('2020-04-20T17:01:01Z')),
          }),
        });
      });

      it('should attach the list of timestamps corresponding to every cached price', async () => {
        expect.assertions(2);
        const res = await setup();

        expect(res.body).toStrictEqual({
          data: expect.objectContaining({
            cacheTimes: expect.arrayContaining([
              0,
              getUnixTime(new Date('2020-04-21T17:01:01Z')) -
                getUnixTime(new Date('2020-04-20T17:01:01Z')),
              getUnixTime(new Date('2020-04-22T09:49:10Z')) -
                getUnixTime(new Date('2020-04-20T17:01:01Z')),
              getUnixTime(new Date('2020-04-22T17:01:03Z')) -
                getUnixTime(new Date('2020-04-20T17:01:01Z')),
              getUnixTime(new Date('2020-04-23T17:03:03Z')) -
                getUnixTime(new Date('2020-04-20T17:01:01Z')),
              getUnixTime(new Date('2020-04-24T17:01:01Z')) -
                getUnixTime(new Date('2020-04-20T17:01:01Z')),
              getUnixTime(new Date('2020-04-25T17:01:02Z')) -
                getUnixTime(new Date('2020-04-20T17:01:01Z')),
            ]),
          }),
        });

        expect(res.body.data.cacheTimes[0]).toBe(0);
      });
    });
  });

  describe('PUT /funds', () => {
    const modifiedFund = {
      ...fund,
      item: 'Different fund',
      transactions: [
        { date: '2020-04-20', units: 69, cost: 420 },
        { date: '2020-04-29', units: 123, cost: 456 },
      ],
    };

    beforeEach(async () => {
      await db('funds').where({ item: modifiedFund.item }).del();
      await db('funds').where({ item: fund.item }).del();
    });

    const setup = async (data: Create<FundRaw> = modifiedFund): Promise<Response> => {
      const resPost = await global.withAuth(global.agent.post('/api/v4/data/funds')).send(fund);
      const res = await global.withAuth(
        global.agent.put('/api/v4/data/funds').send({
          id: resPost.body.id,
          ...data,
        }),
      );
      return res;
    };

    it('should respond with a 200 status code', async () => {
      expect.assertions(2);
      const res = await setup();

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual(
        expect.objectContaining({
          total: expect.any(Number),
        }),
      );
    });

    it('should update the fund in the database', async () => {
      expect.assertions(2);
      await setup();

      const funds = await db('funds').select();

      expect(funds).toStrictEqual(
        expect.arrayContaining([expect.objectContaining({ item: modifiedFund.item })]),
      );
      expect(funds).not.toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: fund.item,
          }),
        ]),
      );
    });

    it('should update the transactions in the database', async () => {
      expect.assertions(2);
      await setup();

      const transactions = await db('funds_transactions').select();

      expect(transactions).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ units: 69, cost: 420 }),
          expect.objectContaining({ units: 123, cost: 456 }),
        ]),
      );
      expect(transactions).not.toStrictEqual(
        expect.arrayContaining([expect.objectContaining({ units: 69, cost: 69420 })]),
      );
    });
  });

  describe('DELETE /funds', () => {
    const setup = async (): Promise<Response> => {
      const resPost = await global.withAuth(global.agent.post('/api/v4/data/funds')).send(fund);
      const res = await global.withAuth(
        global.agent.delete('/api/v4/data/funds').send({
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

    it('should remove the fund in the database', async () => {
      expect.assertions(1);
      await setup();

      const funds = await db('funds').select();

      expect(funds).not.toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            item: fund.item,
          }),
        ]),
      );
    });
  });
});
