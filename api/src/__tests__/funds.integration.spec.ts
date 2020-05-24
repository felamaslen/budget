import { Response } from 'supertest';

import db from '~api/modules/db';
import { FundRaw } from '~api/routes/data/funds/types';
import { Create } from '~api/types';

describe('Server - integration tests (funds)', () => {
  const clearDb = async (): Promise<void> => {
    await db('funds').del();
    await db('fund_hash').del();
  };

  beforeEach(clearDb);
  afterEach(clearDb);

  const fund = {
    item: 'My fund',
    transactions: [{ date: '2020-04-20', units: 69, cost: 69420 }],
  };

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
          total: 69420,
        }),
      );
    });

    it('should create the fund in the database', async () => {
      expect.assertions(2);
      await setup();

      const funds = await db('funds').select();

      expect(funds).toHaveLength(1);
      expect(funds[0]).toStrictEqual(
        expect.objectContaining({
          item: fund.item,
        }),
      );
    });

    it('should create the transactions in the database', async () => {
      expect.assertions(2);
      const res = await setup();

      const transactions = await db('funds_transactions').select();

      expect(transactions).toHaveLength(1);
      expect(transactions[0]).toStrictEqual(
        expect.objectContaining({
          fund_id: res.body.id,
        }),
      );
    });
  });

  describe('GET /funds', () => {
    const setup = async (data: Create<FundRaw> = fund): Promise<Response> => {
      await global.withAuth(global.agent.post('/api/v4/data/funds')).send(data);
      const res = await global.withAuth(global.agent.get('/api/v4/data/funds'));
      return res;
    };

    it('should get a list of funds with their transactions', async () => {
      expect.assertions(2);
      const res = await setup();

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        data: expect.objectContaining({
          total: 69420,
          data: [
            expect.objectContaining({
              I: expect.any(String), // fund ID
              i: 'My fund',
              tr: [{ date: new Date('2020-04-20').toISOString(), units: 69, cost: 69420 }],
            }),
          ],
        }),
      });
    });

    it("should set transactions to an empty array, if there aren't any", async () => {
      expect.assertions(1);

      const res = await setup({ item: 'Other fund', transactions: [] });

      expect(res.body.data.data[0].tr).toStrictEqual([]);
    });
  });
});
