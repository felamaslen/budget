import { getUnixTime, addHours } from 'date-fns';
import md5 from 'md5';
import MockDate from 'mockdate';
import { Response } from 'supertest';

import config from '~api/config';
import db from '~api/test-utils/knex';
import { Create, Fund } from '~api/types';

describe('Funds route', () => {
  const fund = {
    item: 'My fund',
    transactions: [{ date: '2020-04-20', units: 69, cost: 69420 }],
  };

  const altFundName = 'Different fund';

  const clearDb = async (): Promise<void> => {
    await db('funds').where({ item: fund.item }).del();
    await db('funds').where({ item: altFundName }).del();
  };

  beforeEach(clearDb);

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

    it('should reply with the fund on subsequent get requests', async () => {
      expect.assertions(1);
      await setup();
      const resAfter = await global.withAuth(global.agent.get('/api/v4/data/funds'));

      expect(resAfter.body.data.data).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            i: fund.item,
            tr: expect.arrayContaining(fund.transactions),
          }),
        ]),
      );
    });
  });

  describe('GET /funds', () => {
    const setup = async (data: Create<Fund> = fund): Promise<Response> => {
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
              tr: [{ date: '2020-04-20', units: 69, cost: 69420 }],
            }),
          ]),
        }),
      });
    });

    it("should set transactions to an empty array, if there aren't any", async () => {
      expect.assertions(1);

      const res = await setup({ item: altFundName, transactions: [] });

      expect(
        res.body.data.data.find((item: { i: string }) => item.i === altFundName),
      ).toStrictEqual(expect.objectContaining({ tr: [] }));
    });

    describe('if there are historical price data', () => {
      const numTestPrices = config.data.funds.historyResolution * 5;

      const cacheTimeRows = Array(numTestPrices)
        .fill(0)
        .map((_, index) => ({ time: addHours(new Date('2020-04-20'), -index) }))
        .reverse();

      const setupWithPrices = async (): Promise<Response> => {
        const hash = md5(`${fund.item}${config.data.funds.salt}`);
        const {
          rows: [{ fid }],
        } = await db.raw<{ rows: { fid: string }[] }>(
          `
        INSERT INTO fund_hash (broker, hash)
        VALUES ('hl', ?)
        ON CONFLICT (broker, hash) DO UPDATE set broker = excluded.broker
        RETURNING fid
        `,
          [hash],
        );

        const cids = await db('fund_cache_time').insert(cacheTimeRows).returning('cid');

        type CacheRow = { cid: string; fid: string; price: number };

        const cacheRows = cids.reduce<CacheRow[]>(
          (last, cid) => [
            ...last,
            {
              cid,
              fid,
              price: (last[last.length - 1]?.price ?? 100) * (1 + 0.05 * (2 * Math.random() - 1)),
            },
          ],
          [],
        );

        await db('fund_cache').insert(cacheRows);

        MockDate.set(new Date('2020-04-26T13:20:03Z'));
        const res = await setup();
        MockDate.reset();

        await db('fund_hash').where({ fid }).del();
        await db('fund_cache_time').whereIn('cid', cids).del();

        return res;
      };

      it('should attach price lists to the fund response', async () => {
        expect.assertions(1);
        const res = await setupWithPrices();

        expect(res.body).toStrictEqual({
          data: expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                pr: expect.arrayContaining([expect.any(Number)]),
                prStartIndex: 0,
              }),
            ]),
          }),
        });
      });

      it('should attach the list of timestamps corresponding to each displayed cached price', async () => {
        expect.assertions(3);
        const res = await setupWithPrices();

        expect(res.body).toStrictEqual({
          data: expect.objectContaining({
            cacheTimes: expect.arrayContaining([
              getUnixTime(cacheTimeRows[4].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[9].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[14].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[19].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[24].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[29].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[34].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[39].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[44].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[49].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[54].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[59].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[64].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[69].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[74].time) - getUnixTime(cacheTimeRows[0].time),
              getUnixTime(cacheTimeRows[79].time) - getUnixTime(cacheTimeRows[0].time),
            ]),
          }),
        });

        expect(res.body.data.cacheTimes[0]).toBe(0);

        expect(
          res.body.data.cacheTimes
            .slice(1)
            .every((value: number, index: number) => value > res.body.data.cacheTimes[index]),
        ).toBe(true);
      });

      it('should include the first timestamp', async () => {
        expect.assertions(2);
        const res = await setupWithPrices();

        expect(res.body).toStrictEqual({
          data: expect.objectContaining({
            startTime: getUnixTime(cacheTimeRows[0].time),
          }),
        });

        expect(res.body.data.cacheTimes[0]).toBe(0);
      });

      it('should include the last timestamp', async () => {
        expect.assertions(1);
        const res = await setupWithPrices();

        expect(res.body.data.cacheTimes[res.body.data.cacheTimes.length - 1]).toBe(
          getUnixTime(cacheTimeRows[cacheTimeRows.length - 1].time) -
            getUnixTime(cacheTimeRows[0].time),
        );
      });

      it('should include the second-to-last timestamp', async () => {
        expect.assertions(1);
        const res = await setupWithPrices();

        expect(res.body.data.cacheTimes[res.body.data.cacheTimes.length - 2]).toBe(
          getUnixTime(cacheTimeRows[cacheTimeRows.length - 2].time) -
            getUnixTime(cacheTimeRows[0].time),
        );
      });
    });
  });

  describe('PUT /funds', () => {
    const modifiedFund = {
      ...fund,
      item: altFundName,
      transactions: [
        { date: '2020-04-20', units: 69, cost: 420 },
        { date: '2020-04-29', units: 123, cost: 456 },
      ],
    };

    const setup = async (
      data: Create<Fund> = modifiedFund,
    ): Promise<{
      res: Response;
      id: string;
    }> => {
      const resPost = await global.withAuth(global.agent.post('/api/v4/data/funds')).send(fund);
      const res = await global.withAuth(
        global.agent.put('/api/v4/data/funds').send({
          id: resPost.body.id,
          ...data,
        }),
      );
      return { res, id: resPost.body.id };
    };

    it('should respond with a 200 status code', async () => {
      expect.assertions(2);
      const { res } = await setup();

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual(
        expect.objectContaining({
          total: expect.any(Number),
        }),
      );
    });

    it('should reply with the updated fund on subsequent get requests', async () => {
      expect.assertions(2);
      await setup();
      const resAfter = await global.withAuth(global.agent.get('/api/v4/data/funds'));

      expect(resAfter.body.data.data).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            i: modifiedFund.item,
            tr: expect.arrayContaining(modifiedFund.transactions),
          }),
        ]),
      );
      expect(resAfter.body.data.data).not.toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            i: fund.item,
          }),
        ]),
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

    it('should not reply with the fund on subsequent get requests', async () => {
      expect.assertions(1);
      await setup();
      const resAfter = await global.withAuth(global.agent.get('/api/v4/data/funds'));

      expect(resAfter.body.data.data).not.toStrictEqual(
        expect.arrayContaining([expect.objectContaining({ i: fund.item })]),
      );
    });
  });
});