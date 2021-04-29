import nock, { Scope } from 'nock';
import prompts from 'prompts';
import sinon from 'sinon';

import { nockHLFund, nockHLShare, nockHLShareFX, nockGeneralShare } from './__tests__/nocks';
import { run } from '.';
import { nockCurrencies } from '~api/__tests__/nocks';
import * as pubsub from '~api/modules/graphql/pubsub';
import { db } from '~api/test-utils/knex';

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
const testPriceSMTGeneric = 1023.0; // regularMarketPrice

jest.mock('~api/modules/graphql/pubsub');

describe('Fund scraper - integration tests', () => {
  const now = new Date('2020-02-22T20:35Z');
  let clock: sinon.SinonFakeTimers;
  const uid1 = 12345;
  const uid2 = 67891;
  let fundIds: number[] = [];

  beforeAll(async () => {
    clock = sinon.useFakeTimers(now);
  });
  afterAll(async () => {
    clock.restore();
  });

  const clearDb = async (): Promise<void> => {
    await db('funds').select().del();
    await db('fund_scrape').select().del();
    await db('fund_cache_time').select().del();

    await db('users').select().del();
    await db('users').insert({ uid: uid1, name: 'test-user-funds-1', pin_hash: 'some-pin-hash' });
    await db('users').insert({ uid: uid2, name: 'test-user-funds-2', pin_hash: 'other-pin-hash' });

    fundIds = await db('funds')
      .insert([
        {
          uid: uid1,
          item: 'City of London Investment Trust ORD 25p (share)',
        },
        {
          uid: uid1,
          item: 'Jupiter Asian Income Class I (accum.)',
        },
        {
          uid: uid1,
          item: 'Apple Inc Com Stk NPV (share)',
        },
        {
          uid: uid2,
          item: 'City of London Investment Trust ORD 25p (share)',
        },
        {
          uid: uid1,
          item: 'Morgan Stanley Sterling Corporate Bond Class F (accum.)',
        },
        {
          uid: uid1,
          item: 'Scottish Mortgage Investment Trust (SMT.L) (stock)',
        },
      ])
      .returning('id');

    await db('funds_transactions').insert([
      { fund_id: fundIds[0], date: '2016-08-24', units: 89.095, price: 1122.39744 },
      { fund_id: fundIds[0], date: '2016-09-19', units: 894.134, price: 111.84 },
      { fund_id: fundIds[0], date: '2017-04-27', units: -883.229, price: 101.8988 },
      { fund_id: fundIds[1], date: '2016-11-10', units: 30, price: 6.43333 },
      { fund_id: fundIds[1], date: '2017-04-03', units: -23, price: 7.608696 },
      { fund_id: fundIds[2], date: '2017-12-10', units: 14, price: 15478.857 },
      { fund_id: fundIds[2], date: '2018-01-05', units: -13, price: 21271 },
      { fund_id: fundIds[3], date: '2016-08-07', units: 1032.19, price: 542.8468 },
      { fund_id: fundIds[4], date: '2016-09-19', units: 1678.42, price: 119.16 },
      { fund_id: fundIds[4], date: '2017-02-14', units: 846.38, price: 118.15 },
      { fund_id: fundIds[4], date: '2017-10-25', units: 817, price: 122.399 },
      { fund_id: fundIds[4], date: '2017-03-14', units: 1217.43, price: 123.21 },
      { fund_id: fundIds[4], date: '2017-09-24', units: -4559.23, price: 122.722 },
      { fund_id: fundIds[5], date: '2016-09-20', units: 1565, price: 385.31 },
    ]);
  };

  const setupNocks = async (failures: string[] = []): Promise<Record<string, Scope | Scope[]>> => ({
    currencies: nockCurrencies(failures.includes('currencies') ? 500 : 200),
    fund: await nockHLFund(failures.includes('fund') ? 500 : 200),
    share: await nockHLShare(failures.includes('share') ? 500 : 200),
    shareFX: await nockHLShareFX(failures.includes('shareFX') ? 500 : 200),
    genericShare: await nockGeneralShare(failures.includes('genericShare') ? 500 : 200),
  });

  beforeEach(async () => {
    await clearDb();
    clock.reset();
    nock.cleanAll();
    await setupNocks();
  });

  describe('Scraping prices', () => {
    const getTestFundPrice = async (fundId: number): Promise<TestFundPrice[]> => {
      const result = await db
        .select<TestFundPrice[]>('fct.cid', 'fct.time', 'fc.price')
        .from('funds as f')
        .innerJoin('fund_scrape as fs', 'fs.item', 'f.item')
        .innerJoin('fund_cache as fc', 'fc.fid', 'fs.fid')
        .innerJoin('fund_cache_time as fct', 'fct.cid', 'fc.cid')
        .where('f.id', fundId);

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

  describe('Scraping holdings', () => {
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
      process.argv = ['script', '--holdings'];

      await db('stocks').truncate();
      await db('stock_codes').truncate();

      await db('stock_codes').insert(testPreExistingCodes);

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

    it('should keep the already existing stock code cache', async () => {
      expect.assertions(1);
      await run();

      const stockCodes = await db('stock_codes')
        .select()
        .whereIn(
          'name',
          testPreExistingCodes.map(({ name }) => name),
        )
        .orderBy('name');

      expect(stockCodes).toStrictEqual([
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

      const stockCodes = await db('stock_codes')
        .select()
        .whereNotIn(
          'name',
          testPreExistingCodes.map(({ name }) => name),
        )
        .whereNotNull('code')
        .orderBy('name');

      expect(stockCodes).toStrictEqual([
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

      const stockCodes = await db('stock_codes')
        .select()
        .whereNotIn(
          'name',
          testPreExistingCodes.map(({ name }) => name),
        )
        .whereNull('code')
        .orderBy('name');

      expect(stockCodes).toStrictEqual([
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

      const stocks = await db('stocks').select().where({ uid: userId }).orderBy('name');

      expect(stocks).toHaveLength(10);

      expect(stocks).toStrictEqual([
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
