import nock from 'nock';
import sinon from 'sinon';
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import uuidv4 from 'uuid/v4';

import config from '../../config';
import db from '~api/modules/db';
import { run } from '.';
import mockOpenExchangeRatesResponse from './__tests__/currencies.json';
// import { Holding } from './types';

type TestFundPrice = {
  cid: string;
  time: string;
  done: boolean;
  price: number;
};

const testFileFund = path.resolve(__dirname, './__tests__/fund-test-hl.html');
const testFileShare = path.resolve(__dirname, './__tests__/share-test-hl.html');
const testFileShareFX = path.resolve(__dirname, './__tests__/share-test-hl-dollar.html');

// These values come from the test data - see hl.spec.ts and __tests__/*
const testPriceCTY = 424.1;
const testPriceJupiter = 130.31;
const testPriceAppleUSD = 225.82;
const testUSDGBP = 0.771546;

describe('Fund scraper - integration tests', () => {
  const now = new Date('2020-02-22T20:35Z').toISOString();
  let clock: sinon.SinonFakeTimers;
  const uid1 = uuidv4();
  const uid2 = uuidv4();
  let fundIds: string[] = [];

  beforeAll(async () => {
    await db('funds')
      .select()
      .del();
    await db('fund_hash')
      .select()
      .del();
    await db('fund_cache_time')
      .select()
      .del();

    await db('users')
      .select()
      .del();
    await db('users').insert({ uid: uid1, name: 'test-user-funds-1', pin_hash: 'some-pin-hash' });
    await db('users').insert({ uid: uid2, name: 'test-user-funds-2', pin_hash: 'other-pin-hash' });

    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');

    clock = sinon.useFakeTimers(new Date(now).getTime());

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
      ])
      .returning('id');

    await db('funds_transactions').insert([
      { fund_id: fundIds[0], date: '2016-08-24', units: 89.095, cost: 100000 },
      { fund_id: fundIds[0], date: '2016-09-19', units: 894.134, cost: 100000 },
      { fund_id: fundIds[0], date: '2017-04-27', units: -883.229, cost: -90000 },
      { fund_id: fundIds[1], date: '2016-11-10', units: 30, cost: 193 },
      { fund_id: fundIds[1], date: '2017-04-03', units: -23, cost: -175 },
      { fund_id: fundIds[2], date: '2017-12-10', units: 14, cost: 216704 },
      { fund_id: fundIds[2], date: '2018-01-05', units: -13, cost: -276523 },
      { fund_id: fundIds[3], date: '2016-08-07', units: 1032.19, cost: 560321 },
    ]);
  });

  afterAll(async () => {
    clock.restore();
    nock.enableNetConnect();

    await db('users')
      .select()
      .del();

    await db('funds')
      .select()
      .whereIn('id', fundIds)
      .del();
  });

  beforeEach(async () => {
    nock('https://openexchangerates.org')
      .get(`/api/latest.json?app_id=${config.openExchangeRatesApiKey}`)
      .reply(200, mockOpenExchangeRatesResponse);

    nock('http://www.hl.co.uk')
      .get(
        '/funds/fund-discounts,-prices--and--factsheets/search-results/j/jupiter-asian-income-class-i-accumulation',
      )
      .reply(200, await fs.readFile(testFileFund, 'utf8'));

    nock('http://www.hl.co.uk')
      .get('/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p')
      .reply(200, await fs.readFile(testFileShare, 'utf8'));

    nock('http://www.hl.co.uk')
      .get('/shares/shares-search-results/a/apple-inc-com-stk-npv')
      .reply(200, await fs.readFile(testFileShareFX, 'utf8'));
  });

  describe('Scraping prices', () => {
    const getTestFundPrice = async (fundId: string): Promise<TestFundPrice[]> => {
      const rows = await db
        .select<TestFundPrice[]>('fct.cid', 'fct.time', 'fct.done', 'fc.price')
        .from('funds as f')
        .innerJoin('fund_hash as fh', 'fh.hash', db.raw('md5(f.item || ?)', config.data.funds.salt))
        .innerJoin('fund_cache as fc', 'fc.fid', 'fh.fid')
        .innerJoin('fund_cache_time as fct', 'fct.cid', 'fc.cid')
        .where('f.id', fundId);

      return rows;
    };

    beforeEach(async () => {
      process.argv = ['script', '--prices'];

      expect(fundIds).toHaveLength(4);
      await db('fund_cache_time').del();
    });

    it('should insert new prices for a GBX share', async () => {
      await run();

      const gbxResult = await getTestFundPrice(fundIds[0]);

      expect(gbxResult).toHaveLength(1);
      expect(gbxResult[0]).toHaveProperty('time', new Date(now));
      expect(gbxResult[0]).toHaveProperty('done', true);
      expect(gbxResult[0]).toHaveProperty('price', testPriceCTY);
    });

    it('should insert new prices for a fund', async () => {
      await run();

      const fundResult = await getTestFundPrice(fundIds[1]);

      expect(fundResult).toHaveLength(1);
      expect(fundResult[0]).toHaveProperty('time', new Date(now));
      expect(fundResult[0]).toHaveProperty('done', true);
      expect(fundResult[0]).toHaveProperty('price', testPriceJupiter);
    });

    it('should insert new prices for a foreign share', async () => {
      await run();

      const usdResult = await getTestFundPrice(fundIds[2]);

      expect(usdResult).toHaveLength(1);
      expect(usdResult[0]).toHaveProperty('time', new Date(now));
      expect(usdResult[0]).toHaveProperty('done', true);
      expect(usdResult[0]).toHaveProperty('price', testPriceAppleUSD * testUSDGBP * 100);
    });

    it('should skip funds where the request fails', async () => {
      nock.cleanAll();

      nock('http://www.hl.co.uk')
        .get(
          '/funds/fund-discounts,-prices--and--factsheets/search-results/j/jupiter-asian-income-class-i-accumulation',
        )
        .reply(200, await fs.readFile(testFileFund, 'utf8'));

      nock('http://www.hl.co.uk')
        .get('/shares/shares-search-results/c/city-of-london-investment-trust-ord-25p')
        .reply(500);

      nock('http://www.hl.co.uk')
        .get('/shares/shares-search-results/a/apple-inc-com-stk-npv')
        .reply(500);

      await run();

      const gbxResult = await getTestFundPrice(fundIds[0]);
      const fundResult = await getTestFundPrice(fundIds[1]);
      const usdResult = await getTestFundPrice(fundIds[2]);

      expect(gbxResult).toHaveLength(0);
      expect(fundResult).toHaveLength(1);
      expect(usdResult).toHaveLength(0);
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
      await run();

      const stockCodes = await db('stock_codes')
        .select()
        .whereIn(
          'name',
          testPreExistingCodes.map(({ name }) => name),
        )
        .orderBy('name');

      expect(stockCodes).toEqual([
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
      await run();

      const stockCodes = await db('stock_codes')
        .select()
        .whereNotIn(
          'name',
          testPreExistingCodes.map(({ name }) => name),
        )
        .whereNotNull('code')
        .orderBy('name');

      expect(stockCodes).toEqual([
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
      await run();

      const stockCodes = await db('stock_codes')
        .select()
        .whereNotIn(
          'name',
          testPreExistingCodes.map(({ name }) => name),
        )
        .whereNull('code')
        .orderBy('name');

      expect(stockCodes).toEqual([
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

    const testWeightedStocks = (userId: string) => async (): Promise<void> => {
      await run();

      const stocks = await db('stocks')
        .select()
        .where({ uid: userId })
        .orderBy('name');

      expect(stocks).toHaveLength(10);

      expect(stocks).toEqual([
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
    };

    it('should update the list of weighted stocks for user 1', testWeightedStocks(uid1));
    it('should update the list of weighted stocks for user 2', testWeightedStocks(uid2));
  });
});
