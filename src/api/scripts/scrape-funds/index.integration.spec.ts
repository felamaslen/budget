import nock, { Scope } from 'nock';
import prompts from 'prompts';
import sinon from 'sinon';
import { DatabasePoolConnectionType, sql } from 'slonik';

import { nockHLFund, nockHLShare, nockHLShareFX, nockGeneralShare } from './__tests__/nocks';
import { run } from '.';
import { nockCurrencies } from '~api/__tests__/nocks';
import { getPool } from '~api/modules/db';
import * as pubsub from '~api/modules/graphql/pubsub';

type TestFundPrice = {
  cid: number;
  time: string;
  price: number;
};

// These values come from the test data - see hl.spec.ts and vendor/*
const testPriceCTY = 424.1;
const testPriceJupiter = 130.31;
const testPriceAppleUSD = 225.82;
const testUSDGBP = 0.771546;
const testPriceSMTGeneric = 1453.0; // regularMarketPrice
const testPriceRELXGeneric = 2260.0; // regularMarketPrice

jest.mock('~api/modules/graphql/pubsub');

describe('fund scraper - integration tests', () => {
  const now = new Date('2020-02-22T20:35Z');
  let clock: sinon.SinonFakeTimers;
  const uid1 = 12345;
  const uid2 = 67891;
  let fundIds: number[];

  beforeAll(async () => {
    clock = sinon.useFakeTimers(now);
  });
  afterAll(async () => {
    clock.restore();
  });

  const clearDb = async (db: DatabasePoolConnectionType): Promise<void> => {
    await db.query(sql`DELETE FROM funds`);
    await db.query(sql`DELETE FROM fund_scrape`);
    await db.query(sql`DELETE FROM fund_cache_time`);

    await db.query(sql`DELETE FROM users`);
    await db.query(sql`
    INSERT INTO users (uid, name, pin_hash) VALUES ${sql.join(
      [
        sql`(${uid1}, ${'test-user-funds-1'}, ${'some-pin-hash'})`,
        sql`(${uid2}, ${'test-user-funds-2'}, ${'other-pin-hash'})`,
      ],
      sql`, `,
    )}
    `);

    const { rows: fundIdRows } = await db.query<{ id: number }>(sql`
    INSERT INTO funds (uid, item)
    SELECT * FROM ${sql.unnest(
      [
        [uid1, 'City of London Investment Trust ORD 25p (share)'],
        [uid1, 'Jupiter Asian Income Class I (accum.)'],
        [uid1, 'Apple Inc Com Stk NPV (share)'],
        [uid2, 'City of London Investment Trust ORD 25p (share)'],
        [uid1, 'Morgan Stanley Sterling Corporate Bond Class F (accum.)'],
        [uid1, 'Scottish Mortgage Investment Trust (SMT.L) (stock)'],
        [uid1, 'RELX options (REL.L) (stock)'],
      ],
      ['int4', 'text'],
    )}
    RETURNING id
    `);
    fundIds = fundIdRows.map((row) => row.id);

    await db.query(sql`
    INSERT INTO funds_transactions (fund_id, date, units, price)
    SELECT * FROM ${sql.unnest(
      [
        [fundIds[0], '2016-08-24', 89.095, 1122.39744],
        [fundIds[0], '2016-09-19', 894.134, 111.84],
        [fundIds[0], '2017-04-27', -883.229, 101.8988],
        [fundIds[1], '2016-11-10', 30, 6.43333],
        [fundIds[1], '2017-04-03', -23, 7.608696],
        [fundIds[2], '2017-12-10', 14, 15478.857],
        [fundIds[2], '2018-01-05', -13, 21271],
        [fundIds[3], '2016-08-07', 1032.19, 542.8468],
        [fundIds[4], '2016-09-19', 1678.42, 119.16],
        [fundIds[4], '2017-02-14', 846.38, 118.15],
        [fundIds[4], '2017-10-25', 817, 122.399],
        [fundIds[4], '2017-03-14', 1217.43, 123.21],
        [fundIds[4], '2017-09-24', -4559.23, 122.722],
        [fundIds[5], '2016-09-20', 1565, 385.31],
        [fundIds[6], '2023-07-10', 1326, 1352], // note: in the future!
      ],
      ['int4', 'date', 'float8', 'float8'],
    )}
    `);
  };

  const setupNocks = async (failures: string[] = []): Promise<Record<string, Scope | Scope[]>> => ({
    currencies: nockCurrencies(failures.includes('currencies') ? 500 : 200),
    fund: await nockHLFund(failures.includes('fund') ? 500 : 200),
    share: await nockHLShare(failures.includes('share') ? 500 : 200),
    shareFX: await nockHLShareFX(failures.includes('shareFX') ? 500 : 200),
    genericShare: await nockGeneralShare(failures.includes('genericShare') ? 500 : 200),
  });

  beforeEach(async () => {
    fundIds = [];
    await getPool().connect(clearDb);
    clock.reset();
    nock.cleanAll();
    await setupNocks();
  });

  describe('scraping prices', () => {
    const getTestFundPrice = async (fundId: number): Promise<readonly TestFundPrice[]> => {
      const result = await getPool().connect(async (db) => {
        const { rows } = await db.query<TestFundPrice>(sql`
      SELECT fct.cid, fct.time, fc.price
      FROM funds f
      INNER JOIN fund_scrape fs ON fs.item = f.item
      INNER JOIN fund_cache fc ON fc.fid = fs.fid
      INNER JOIN fund_cache_time fct ON fct.cid = fc.cid
      WHERE f.id = ${fundId}
      `);
        return rows;
      });
      return result;
    };

    beforeEach(async () => {
      process.argv = ['script', '--prices'];
    });

    it('should insert new prices for a GBX share', async () => {
      expect.assertions(1);
      await run();

      const gbxResult = await getTestFundPrice(fundIds[0]);

      expect(gbxResult).toStrictEqual([
        expect.objectContaining({
          time: new Date(now),
          price: testPriceCTY,
        }),
      ]);
    });

    it('should insert new prices for a fund', async () => {
      expect.assertions(1);
      await run();

      const fundResult = await getTestFundPrice(fundIds[1]);

      expect(fundResult).toStrictEqual([
        expect.objectContaining({
          time: new Date(now),
          price: testPriceJupiter,
        }),
      ]);
    });

    it('should insert new prices for a foreign share', async () => {
      expect.assertions(1);
      await run();

      const usdResult = await getTestFundPrice(fundIds[2]);

      expect(usdResult).toStrictEqual([
        expect.objectContaining({
          time: new Date(now),
          price: testPriceAppleUSD * testUSDGBP * 100,
        }),
      ]);
    });

    it('should insert new prices for a generic share', async () => {
      expect.assertions(1);
      await run();

      const genericShareResult = await getTestFundPrice(fundIds[5]);

      expect(genericShareResult).toStrictEqual([
        expect.objectContaining({
          time: new Date(now),
          price: testPriceSMTGeneric,
        }),
      ]);
    });

    it('should insert new prices for a share for which units will be bought in the future', async () => {
      expect.assertions(1);
      await run();

      const futureShareResult = await getTestFundPrice(fundIds[6]);

      expect(futureShareResult).toStrictEqual([
        expect.objectContaining({
          time: new Date(now),
          price: testPriceRELXGeneric,
        }),
      ]);
    });

    it('should issue an update to the pubsub topic', async () => {
      expect.assertions(1);
      const publishSpy = jest.spyOn(pubsub.pubsub, 'publish');

      await run();

      expect(publishSpy).toHaveBeenCalledTimes(1);
    });

    describe('when one or more requests fail', () => {
      const setupNocksWithFailure = async (): Promise<void> => {
        nock.cleanAll();
        await setupNocks(['share', 'shareFX']);
      };

      it('should re-throw the error', async () => {
        expect.assertions(1);
        await setupNocksWithFailure();

        await expect(run()).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Request failed with status code 500"`,
        );
      });

      it('should not add any items to the database', async () => {
        expect.assertions(3);
        await setupNocksWithFailure();

        try {
          await run();
        } catch (err) {
          // pass
        } finally {
          const gbxResult = await getTestFundPrice(fundIds[0]);
          const fundResult = await getTestFundPrice(fundIds[1]);
          const usdResult = await getTestFundPrice(fundIds[2]);

          expect(gbxResult).toHaveLength(0);
          expect(fundResult).toHaveLength(0);
          expect(usdResult).toHaveLength(0);
        }
      });
    });

    it('should skip totally sold funds', async () => {
      expect.assertions(1);
      await run();
      const soldResult = await getTestFundPrice(fundIds[4]);
      expect(soldResult).toHaveLength(0);
    });

    describe('if the fund hash already exists', () => {
      it('should not throw an error', async () => {
        expect.assertions(1);

        await run();
        clock.tick(86400);
        await setupNocks();
        await run();

        const gbxResult = await getTestFundPrice(fundIds[0]);

        expect(gbxResult).toStrictEqual([
          expect.objectContaining({
            price: testPriceCTY,
          }),
          expect.objectContaining({
            price: testPriceCTY,
          }),
        ]);
      });
    });
  });

  describe('scraping holdings', () => {
    const weightCTY: { [userId: string]: number } = {
      // (100000 + 100000 - 90000) / (100000 + 100000 - 90000 + 193 - 175 + Math.max(0, 216704 - 276523)),
      [uid1]: 0.999836,
      [uid2]: 1, // only holding
    };

    const testPreExistingCodes = [
      {
        name: 'HSBC Holdings plc Ordinary USD0.50',
        code: 'LON:HSBA',
      },
      {
        name: 'Diageo plc Ordinary 28 101/108p',
        code: 'LON:DGE',
      },
      {
        name: 'Unilever plc Ordinary 3.11p',
        code: 'LON:ULVR',
      },
      {
        name: 'Prudential plc Ordinary 5p',
        code: 'LON:PRU',
      },
    ];

    beforeEach(async () => {
      await getPool().connect(async (db) => {
        process.argv = ['script', '--holdings'];

        await db.query(sql`TRUNCATE stocks`);
        await db.query(sql`TRUNCATE stock_codes`);

        await db.query(sql`
        INSERT INTO stock_codes (name, code)
        SELECT * FROM ${sql.unnest(
          testPreExistingCodes.map((row) => [row.name, row.code]),
          ['text', 'text'],
        )}
        `);

        // This is mocking what a user might input, expecting the prompts to happen in
        // alphabetical order, per-fund
        prompts.inject([
          'LON:BP', // BP
          'LON:BATS', // British American Tobacco
          'LON:GLX', // GlaxoSmithKline
          'LON:LLOY', // Lloyds
          'LON:RDSA', // Royal Dutch Shell
          'LON:VOD', // Vodafone
          '', // AXA Framlington UK Select
          '', // J O Hambro
          '', // Jupiter UK Special Situations
          '', // Lindsell Train UK Equity
          '', // Majedie UK Equity
          '', // Marlborough Multi Cap
          '', // Marlborough UK Micro-Cap
          '', // Old Mutual Global Investors
          '', // River & Mercantile UK Dynamic
          '', // Woodford CF
        ]);
      });
    });

    it('should keep the already existing stock code cache', async () => {
      expect.assertions(1);
      await run();

      const stockCodes = await getPool().query(sql`
      SELECT * FROM stock_codes
      WHERE name = ANY(${sql.array(
        testPreExistingCodes.map(({ name }) => name),
        'text',
      )})
      ORDER BY name
      `);

      expect(stockCodes.rows).toStrictEqual([
        expect.objectContaining({
          name: 'Diageo plc Ordinary 28 101/108p',
          code: 'LON:DGE',
        }),
        expect.objectContaining({
          name: 'HSBC Holdings plc Ordinary USD0.50',
          code: 'LON:HSBA',
        }),
        expect.objectContaining({
          name: 'Prudential plc Ordinary 5p',
          code: 'LON:PRU',
        }),
        expect.objectContaining({
          name: 'Unilever plc Ordinary 3.11p',
          code: 'LON:ULVR',
        }),
      ]);
    });

    it('should add to the stock code cache where possible', async () => {
      expect.assertions(1);
      await run();

      const stockCodes = await getPool().query(sql`
      SELECT * FROM stock_codes
      WHERE name != ALL(${sql.array(
        testPreExistingCodes.map(({ name }) => name),
        'text',
      )})
        AND code IS NOT NULL
      ORDER BY name
      `);

      expect(stockCodes.rows).toStrictEqual([
        expect.objectContaining({
          name: 'BP Plc Ordinary US$0.25',
          code: 'LON:BP',
        }),
        expect.objectContaining({
          name: 'British American Tobacco plc Ordinary 25p',
          code: 'LON:BATS',
        }),
        expect.objectContaining({
          name: 'GlaxoSmithKline plc Ordinary 25p',
          code: 'LON:GLX',
        }),
        expect.objectContaining({
          name: 'Lloyds Banking Group plc Ordinary 10p',
          code: 'LON:LLOY',
        }),
        expect.objectContaining({
          name: 'Royal Dutch Shell Plc B Shares EUR0.07',
          code: 'LON:RDSA',
        }),
        expect.objectContaining({
          name: 'Vodafone Group plc USD0.20 20/21',
          code: 'LON:VOD',
        }),
      ]);
    });

    it("should cache null codes, so they don't have to be asked again", async () => {
      expect.assertions(1);

      await run();

      const stockCodes = await getPool().query(sql`
      SELECT * FROM stock_codes
      WHERE name != ALL(${sql.array(
        testPreExistingCodes.map(({ name }) => name),
        'text',
      )})
        AND code IS NULL
      ORDER BY name
      `);

      expect(stockCodes.rows).toStrictEqual([
        expect.objectContaining({
          name: 'AXA Framlington UK Select Opportunities Class ZI',
          code: null,
        }),
        expect.objectContaining({
          name: 'J O Hambro CM UK Equity Income Class B',
          code: null,
        }),
        expect.objectContaining({
          name: 'Jupiter UK Special Situations Class I',
          code: null,
        }),
        expect.objectContaining({
          name: 'Lindsell Train UK Equity Class D Accumulation Shares',
          code: null,
        }),
        expect.objectContaining({
          name: 'Majedie UK Equity Class X',
          code: null,
        }),
        expect.objectContaining({
          name: 'Marlborough Multi Cap Income Class P',
          code: null,
        }),
        expect.objectContaining({
          name: 'Marlborough UK Micro-Cap Growth Class P',
          code: null,
        }),
        expect.objectContaining({
          name: 'Old Mutual Global Investors (Offshore) UK Smaller Companies Focus Class A',
          code: null,
        }),
        expect.objectContaining({
          name: 'River &amp; Mercantile UK Dynamic Equity Class B',
          code: null,
        }),
        expect.objectContaining({
          name: 'Woodford CF Woodford Equity Income Class Z',
          code: null,
        }),
      ]);
    });

    it.each`
      userId  | position
      ${uid1} | ${1}
      ${uid2} | ${2}
    `('should update the list of weighted stocks for user $position', async ({ userId }) => {
      expect.assertions(2);

      await run();

      const stocks = await getPool().query(sql`
      SELECT * FROM stocks
      WHERE uid = ${userId}
      ORDER BY name
      `);

      expect(stocks.rows).toHaveLength(10);

      expect(stocks.rows).toStrictEqual([
        expect.objectContaining({
          name: 'BP Plc Ordinary US$0.25',
          code: 'LON:BP',
          weight: weightCTY[userId],
          subweight: 2.5,
        }),
        expect.objectContaining({
          name: 'British American Tobacco plc Ordinary 25p',
          code: 'LON:BATS',
          weight: weightCTY[userId],
          subweight: 4.94,
        }),
        expect.objectContaining({
          name: 'Diageo plc Ordinary 28 101/108p',
          code: 'LON:DGE',
          weight: weightCTY[userId],
          subweight: 2.95,
        }),
        expect.objectContaining({
          name: 'GlaxoSmithKline plc Ordinary 25p',
          code: 'LON:GLX',
          weight: weightCTY[userId],
          subweight: 2.54,
        }),
        expect.objectContaining({
          name: 'HSBC Holdings plc Ordinary USD0.50',
          code: 'LON:HSBA',
          weight: weightCTY[userId],
          subweight: 4.34,
        }),
        expect.objectContaining({
          name: 'Lloyds Banking Group plc Ordinary 10p',
          code: 'LON:LLOY',
          weight: weightCTY[userId],
          subweight: 2.53,
        }),
        expect.objectContaining({
          name: 'Prudential plc Ordinary 5p',
          code: 'LON:PRU',
          weight: weightCTY[userId],
          subweight: 2.68,
        }),
        expect.objectContaining({
          name: 'Royal Dutch Shell Plc B Shares EUR0.07',
          code: 'LON:RDSA',
          weight: weightCTY[userId],
          subweight: 2.87,
        }),
        expect.objectContaining({
          name: 'Unilever plc Ordinary 3.11p',
          code: 'LON:ULVR',
          weight: weightCTY[userId],
          subweight: 2.73,
        }),
        expect.objectContaining({
          name: 'Vodafone Group plc USD0.20 20/21',
          code: 'LON:VOD',
          weight: weightCTY[userId],
          subweight: 2.71,
        }),
      ]);
    });
  });
});
