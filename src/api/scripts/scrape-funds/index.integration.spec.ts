import path from 'path';
import { gunzipSync } from 'zlib';

import { getUnixTime } from 'date-fns';
import fs from 'fs-extra';
import gql from 'graphql-tag';
import nock, { Definition } from 'nock';
import prompts from 'prompts';
import sinon from 'sinon';
import { DatabasePoolConnectionType, sql } from 'slonik';
import * as w from 'wonka';

import { run } from '.';
import { nockCurrencies } from '~api/__tests__/nocks';
import { getPool } from '~api/modules/db';
import * as pubsub from '~api/modules/graphql/pubsub';
import { App, getTestApp } from '~api/test-utils/create-server';
import { runSubscription } from '~api/test-utils/gql';
import { FundHistory, Maybe } from '~api/types';
import {
  FundPeriod,
  FundPricesUpdatedSubscription,
  FundPricesUpdatedSubscriptionVariables,
} from '~client/types/gql';

type TestFundPrice = {
  cid: number;
  time: string;
  price: number;
};

const recordNocks = process.env.NOCK_RECORD === '1';
const nockRecordingFile = path.resolve(__dirname, './__tests__/nocks.json');

declare module 'nock' {
  interface Definition {
    rawHeaders: string[];
    responseIsBinary: boolean;
  }
}

// TODO(FM): work out why nock recordings don't work with latest verison of yahoo-finance2
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('fund scraper - integration tests', () => {
  const now = new Date('2020-02-22T20:35Z');
  let app: App;
  let clock: sinon.SinonFakeTimers;
  let uid1: number;
  const uid2 = 67891;
  let fundIds: number[];

  let afterHook: null | (() => Promise<void>) = null;
  let nockRecordingKey: string;

  const enableNockRecordings = async (): Promise<void> => {
    const pending = nock.pendingMocks();
    if (pending.length) {
      throw new Error(
        `Unexpected pending mocks before running recording mode: \n\t${pending.join('\n\t')}`,
      );
    }

    if (recordNocks) {
      nock.recorder.rec({
        dont_print: true,
        output_objects: true,
      });

      afterHook = async (): Promise<void> => {
        const recorded = (nock.recorder.play() as Definition[]).filter(
          (record) => !(record.scope as string).startsWith('http://127.0.0.1'),
        );
        nock.recorder.clear();
        if (recorded.length) {
          const removeHeadersByName = (headers: string[], remove: string[]): string[] =>
            headers.reduce<string[]>(
              (prev, header, index) =>
                index % 2 === 0 && !remove.includes(header)
                  ? [...prev, header, headers[index + 1]]
                  : prev,
              [],
            );
          const removeHeaderByIndex = (headers: string[], remove: number): string[] =>
            headers.reduce<string[]>(
              (prev, header, index) =>
                index % 2 === 0 && index !== remove ? [...prev, header, headers[index + 1]] : prev,
              [],
            );

          const recordedProcessed = recorded.map((record) => {
            const rawHeaders = removeHeadersByName(record.rawHeaders, [
              'Date',
              'x-request-id',
              'Content-Length',
              'Connection',
            ]);
            const encodingHeaderIndex = rawHeaders.findIndex(
              (header, index) => index % 2 === 0 && header.toLowerCase() === 'content-encoding',
            );
            const isGzipResponse =
              Array.isArray(record.response) &&
              !record.responseIsBinary &&
              encodingHeaderIndex !== -1 &&
              rawHeaders[encodingHeaderIndex + 1] === 'gzip';

            const response = isGzipResponse
              ? gunzipSync(Buffer.from((record.response as unknown[]).join(''), 'hex')).toString(
                  'utf-8',
                )
              : record.response;

            return {
              ...record,
              response,
              rawHeaders: removeHeaderByIndex(rawHeaders, encodingHeaderIndex),
            };
          });

          let previousData = {};
          try {
            previousData = JSON.parse(await fs.readFile(nockRecordingFile, 'utf8'));
          } catch (err) {
            if ((err as { code?: string }).code !== 'ENOENT') {
              throw err;
            }
          }

          await fs.writeFile(
            nockRecordingFile,
            JSON.stringify({ ...previousData, [nockRecordingKey]: recordedProcessed }, null, 2),
            'utf-8',
          );
        }

        nock.restore();
      };
    } else {
      try {
        await fs.access(nockRecordingFile, fs.constants.R_OK);
      } catch (error) {
        if ((error as { code?: string }).code !== 'ENOENT') {
          throw error;
        }
        return;
      }

      const recording = JSON.parse(await fs.readFile(nockRecordingFile, 'utf8'));
      if (!Object.prototype.hasOwnProperty.call(recording, nockRecordingKey)) {
        return;
      }
      nock.define(recording[nockRecordingKey]);
    }
  };

  const disableNockRecordings = async (): Promise<void> => {
    nock.recorder.clear();
    nock.cleanAll();
    nock.restore();
    if (!nock.isActive()) {
      nock.activate();
    }
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
    afterHook = null;
  };

  beforeAll(async () => {
    app = await getTestApp({ subscriptions: true });
    uid1 = app.uid;
    clock = sinon.useFakeTimers(now);
  });

  afterAll(async () => {
    clock.restore();
  });

  const clearDb = async (db: DatabasePoolConnectionType): Promise<void> => {
    await db.query(sql`DELETE FROM funds`);
    await db.query(sql`DELETE FROM fund_scrape`);
    await db.query(sql`DELETE FROM fund_cache_time`);

    await db.query(sql`DELETE FROM users WHERE uid = ${uid2}`);
    await db.query(sql`
    INSERT INTO users (uid, name, pin_hash) VALUES ${sql.join(
      [sql`(${uid2}, ${'test-user-funds-2'}, ${'other-pin-hash'})`],
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

  beforeEach(async () => {
    fundIds = [];
    await getPool().connect(clearDb);
    clock.reset();
    nock.cleanAll();

    const { currentTestName } = expect.getState();
    nockRecordingKey = currentTestName;
    await enableNockRecordings();
    nockCurrencies();
  });

  afterEach(async () => {
    await afterHook?.();
    await disableNockRecordings();
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
          price: 414.5,
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
          price: 205.55,
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
          price: 13506.684276,
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
          price: 650.4,
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
          price: 2499,
        }),
      ]);
    });

    describe('subscriptions', () => {
      let publishSpy: jest.SpyInstance;
      beforeAll(async () => {
        publishSpy = jest.spyOn(pubsub.pubsub, 'publish');
      });

      const pricesSubscription = gql`
        subscription FundPricesUpdated($period: FundPeriod, $length: NonNegativeInt!) {
          fundPricesUpdated(period: $period, length: $length) {
            startTime
            cacheTimes
            prices {
              fundId
              groups {
                startIndex
                values
              }
            }
            annualisedFundReturns
            overviewCost
          }
        }
      `;

      it('should be sent to the correct pubsub topic', async () => {
        expect.assertions(2);
        await run();

        expect(publishSpy).toHaveBeenCalledTimes(1);
        expect(publishSpy).toHaveBeenCalledWith(
          pubsub.PubSubTopic.FundPricesUpdated,
          expect.anything(),
        );
      });

      it('should update prices for all authenticated clients', async () => {
        expect.assertions(3);

        await run();
        clock.tick(3600 * 1000);

        await run();
        clock.tick(3600 * 1000);

        const [subscriptionResult] = await Promise.all([
          runSubscription<FundPricesUpdatedSubscription, FundPricesUpdatedSubscriptionVariables>(
            app,
            pricesSubscription,
            {
              period: FundPeriod.Year,
              length: 4,
            },
          ),
          run(),
        ]);

        expect(subscriptionResult?.fundPricesUpdated?.startTime).toBe(getUnixTime(now));

        expect(subscriptionResult?.fundPricesUpdated?.annualisedFundReturns).toStrictEqual(
          expect.any(Number),
        );

        expect(subscriptionResult?.fundPricesUpdated?.prices).toStrictEqual<FundHistory['prices']>(
          expect.arrayContaining([
            {
              fundId: fundIds[0], // CTY
              groups: [
                {
                  startIndex: 0,
                  values: [414.5, 414.5, 414.5],
                },
              ],
            },
            {
              fundId: fundIds[5], // SMT
              groups: [
                {
                  startIndex: 0,
                  values: [650.4, 650.4, 650.4],
                },
              ],
            },
            {
              fundId: fundIds[6], // RELX
              groups: [
                {
                  startIndex: 0,
                  values: [2499, 2499, 2499],
                },
              ],
            },
          ]),
        );
      });

      it('should not send updates for anonymous clients', async () => {
        expect.assertions(1);

        const [subscriptionResult] = await Promise.all([
          new Promise<Maybe<FundPricesUpdatedSubscription>>((resolve) => {
            const { unsubscribe } = w.pipe(
              app.gqlClient.subscription<
                FundPricesUpdatedSubscription,
                FundPricesUpdatedSubscriptionVariables
              >(pricesSubscription, {
                period: FundPeriod.Year,
                length: 4,
              }),
              w.subscribe((result) => {
                unsubscribe();
                resolve(result.data ?? null);
              }),
            );
          }),

          run(),
        ]);

        expect(subscriptionResult?.fundPricesUpdated).toBeNull();
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
        await run();

        const gbxResult = await getTestFundPrice(fundIds[0]);

        expect(gbxResult).toStrictEqual([
          expect.objectContaining({
            price: 414.5,
          }),
          expect.objectContaining({
            price: 414.5,
          }),
        ]);
      });
    });
  });

  describe('scraping holdings', () => {
    const getWeightCTY = (): { [userId: string]: number } => ({
      // (100000 + 100000 - 90000) / (100000 + 100000 - 90000 + 193 - 175 + Math.max(0, 216704 - 276523)),
      [uid1]: 0.999836,
      [uid2]: 1, // only holding
    });

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
          'LON:AZN', // AstraZeneca
          'LON:BAE',
          'LON:BP',
          'LON:BATS',
          'LON:IMB', // Imperial Brands
          'LON:REL', // RELX
          'LON:SHEL', // Shell
          '', // BHP
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
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
        expect.objectContaining({ code: 'LON:AZN', name: 'AstraZeneca plc Ordinary US$0.25' }),
        expect.objectContaining({ code: 'LON:BAE', name: 'BAE Systems plc Ordinary 2.5p' }),
        expect.objectContaining({ code: 'LON:BP', name: 'BP Plc Ordinary US$0.25' }),
        expect.objectContaining({
          code: 'LON:BATS',
          name: 'British American Tobacco plc Ordinary 25p',
        }),
        expect.objectContaining({ code: 'LON:IMB', name: 'Imperial Brands Group Ordinary 10p' }),
        expect.objectContaining({ code: 'LON:REL', name: 'RELX plc Ord 14 51/116p' }),
        expect.objectContaining({ code: 'LON:SHEL', name: 'Shell plc Ordinary EUR0.07' }),
      ]);
    });

    it("should cache null codes, so they don't have to be asked again", async () => {
      expect.assertions(2);

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

      expect(stockCodes.rows).toStrictEqual(
        expect.arrayContaining([expect.objectContaining({ code: null })]),
      );

      expect(stockCodes.rows).toStrictEqual([
        expect.objectContaining({ code: null, name: 'BHP GROUP LIMITED' }),
        expect.objectContaining({ code: null, name: 'DBS GROUP HOLDINGS LTD' }),
        expect.objectContaining({ code: null, name: 'HON HAI PRECISION INDUSTRY' }),
        expect.objectContaining({ code: null, name: 'ITC LTD' }),
        expect.objectContaining({ code: null, name: 'MACQUARIE GROUP LIMITED' }),
        expect.objectContaining({ code: null, name: 'MEDIA TEK INC' }),
        expect.objectContaining({ code: null, name: 'SAMSUNG ELECTRONICS CO. LTD' }),
        expect.objectContaining({ code: null, name: 'SINGAPORE TELECOMMUNICATIONS' }),
        expect.objectContaining({ code: null, name: 'TAIWAN SEMICONDUCTOR MANUFACTURING CO.' }),
        expect.objectContaining({ code: null, name: 'WOODSIDE ENERGY GROUP LTD' }),
      ]);
    });

    it.each`
      getUserId             | position
      ${(): number => uid1} | ${1}
      ${(): number => uid2} | ${2}
    `('should update the list of weighted stocks for user $position', async ({ getUserId }) => {
      expect.assertions(2);

      const userId = getUserId();

      await run();

      const stocks = await getPool().query(sql`
        SELECT * FROM stocks
        WHERE uid = ${userId}
        ORDER BY subweight desc, name
        `);

      expect(stocks.rows).toHaveLength(10);

      const weightCTY = getWeightCTY();

      expect(stocks.rows).toStrictEqual([
        expect.objectContaining({
          name: 'Shell plc Ordinary EUR0.07',
          code: 'LON:SHEL',
          weight: weightCTY[userId],
          subweight: 4.01,
        }),
        expect.objectContaining({
          name: 'BAE Systems plc Ordinary 2.5p',
          code: 'LON:BAE',
          weight: weightCTY[userId],
          subweight: 3.83,
        }),
        expect.objectContaining({
          name: 'British American Tobacco plc Ordinary 25p',
          code: 'LON:BATS',
          weight: weightCTY[userId],
          subweight: 3.71,
        }),
        expect.objectContaining({
          name: 'Diageo plc Ordinary 28 101/108p',
          code: 'LON:DGE',
          weight: weightCTY[userId],
          subweight: 3.46,
        }),
        expect.objectContaining({
          name: 'Unilever plc Ordinary 3.11p',
          code: 'LON:ULVR',
          weight: weightCTY[userId],
          subweight: 3.43,
        }),
        expect.objectContaining({
          name: 'BP Plc Ordinary US$0.25',
          code: 'LON:BP',
          weight: weightCTY[userId],
          subweight: 3.28,
        }),
        expect.objectContaining({
          name: 'RELX plc Ord 14 51/116p',
          code: 'LON:REL',
          weight: weightCTY[userId],
          subweight: 3.28,
        }),
        expect.objectContaining({
          name: 'AstraZeneca plc Ordinary US$0.25',
          code: 'LON:AZN',
          weight: weightCTY[userId],
          subweight: 3.06,
        }),
        expect.objectContaining({
          name: 'HSBC Holdings plc Ordinary USD0.50',
          code: 'LON:HSBA',
          weight: weightCTY[userId],
          subweight: 2.99,
        }),
        expect.objectContaining({
          name: 'Imperial Brands Group Ordinary 10p',
          code: 'LON:IMB',
          weight: weightCTY[userId],
          subweight: 2.75,
        }),
      ]);
    });
  });
});
