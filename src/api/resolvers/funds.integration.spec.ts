import { addHours, getUnixTime } from 'date-fns';
import gql from 'graphql-tag';
import sinon from 'sinon';
import { sql } from 'slonik';
import yahooFinance from 'yahoo-finance2';

import { seedData } from '~api/__tests__/fixtures';
import config from '~api/config';
import { getPool } from '~api/modules/db';
import * as pubsub from '~api/modules/graphql/pubsub';
import { App, getTestApp, runMutation, runQuery } from '~api/test-utils';
import {
  CrudResponseCreate,
  CrudResponseDelete,
  CrudResponseUpdate,
  Fund,
  FundHistory,
  FundHistoryIndividual,
  FundInput,
  FundPrices,
  Maybe,
  MutationUpdateCashAllocationTargetArgs,
  MutationUpdateFundAllocationTargetsArgs,
  MutationDeleteFundArgs,
  QueryFundHistoryIndividualArgs,
  StockSplit,
  Transaction,
  UpdatedFundAllocationTargets,
  QueryStockPricesArgs,
  StockPrice,
  StockPricesResponse,
  StockValueResponse,
  NetWorthCashTotal,
} from '~api/types';
import {
  FundSubscription,
  MutationCreateFundArgs,
  MutationUpdateFundArgs,
} from '~client/types/gql';
import type { Create, NativeDate, RawDate } from '~shared/types';

describe('funds resolver', () => {
  let app: App;
  beforeAll(async () => {
    app = await getTestApp();
  });

  type RawDateFund = Omit<FundInput, 'stockSplits' | 'transactions'> & {
    id: number;
    transactions: RawDate<Transaction, 'date'>[];
    stockSplits: RawDate<StockSplit, 'date'>[];
  };

  type RawDateFundInput = Create<RawDateFund>;

  const fundInput: RawDateFundInput = {
    item: 'My fund',
    transactions: [
      {
        date: '2020-04-20',
        units: 69,
        price: 949.35,
        fees: 1199,
        taxes: 1776,
        drip: false,
        pension: false,
      },
    ],
    allocationTarget: 20,
    stockSplits: [
      {
        date: '2020-04-11',
        ratio: 8,
      },
    ],
  };

  const altFundName = 'Different fund';

  let publishSpy: jest.SpyInstance;

  beforeEach(async () => {
    publishSpy = jest.spyOn(pubsub.pubsub, 'publish').mockResolvedValueOnce();
    await getPool().connect(async (db) => {
      await db.query(
        sql`DELETE FROM funds WHERE uid = ${app.uid} AND item = ANY(${sql.array(
          [fundInput.item, altFundName],
          'text',
        )})`,
      );
      await db.query(sql`DELETE FROM fund_cache_time`);
      await db.query(sql`DELETE FROM funds_cash_target WHERE uid = ${app.uid}`);

      jest.spyOn(yahooFinance, 'quote').mockResolvedValue([
        {
          symbol: 'FCSS.L',
          regularMarketPrice: 388.29,
        },
        {
          symbol: 'SMT.L',
          regularMarketPrice: 1197.23,
        },
      ]);
    });
  });

  describe('createFund', () => {
    const mutation = gql`
      mutation CreateFund($fakeId: Int!, $input: FundInput!) {
        createFund(fakeId: $fakeId, input: $input) {
          id
          error
        }
      }
    `;

    const setup = async (): Promise<Maybe<CrudResponseCreate>> => {
      const res = await runMutation<MutationCreateFundArgs>(app, mutation, {
        fakeId: 0,
        input: fundInput,
      });
      return res?.createFund ?? null;
    };

    it('should respond with a null error', async () => {
      expect.assertions(1);
      const res = await setup();

      expect(res?.error).toBeNull();
    });

    it('should create the fund in the database', async () => {
      expect.assertions(1);
      const res = await setup();

      const id = res?.id as number;

      const { rows } = await getPool().query(
        sql`SELECT * FROM funds WHERE uid = ${app.uid} AND item = ${fundInput.item} LIMIT 1`,
      );

      expect(rows[0]).toStrictEqual(
        expect.objectContaining({
          id,
          item: 'My fund',
          allocation_target: 20,
        }),
      );
    });

    it('should create the transaction rows in the database', async () => {
      expect.assertions(2);
      const res = await setup();

      const id = res?.id as number;

      const { rows } = await getPool().query(
        sql`SELECT * FROM funds_transactions WHERE fund_id = ${id}`,
      );

      expect(rows).toHaveLength(1);
      expect(rows).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            units: 69,
            price: 949.35,
            fees: 1199,
            taxes: 1776,
            is_drip: false,
          }),
        ]),
      );
    });

    it('should create stock split rows in the database', async () => {
      expect.assertions(2);
      const res = await setup();

      const id = res?.id as number;

      const { rows } = await getPool().query(
        sql`SELECT * FROM funds_stock_splits WHERE fund_id = ${id}`,
      );

      expect(rows).toHaveLength(1);
      expect(rows).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            date: new Date('2020-04-11'),
            ratio: 8,
          }),
        ]),
      );
    });

    it('should publish the created fund and updated cash total', async () => {
      expect.assertions(3);

      const res = await setup();

      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy).toHaveBeenCalledWith<[string, FundSubscription]>(
        `${pubsub.PubSubTopic.FundsChanged}.${app.uid}`,
        {
          created: {
            fakeId: 0,
            item: {
              ...fundInput,
              id: res?.id as number,
            },
          },
          overviewCost: expect.arrayContaining([expect.any(Number)]),
        },
      );
      expect(publishSpy).toHaveBeenCalledWith<[string, NetWorthCashTotal]>(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${app.uid}`,
        expect.objectContaining<NetWorthCashTotal>({
          cashInBank: expect.any(Number),
          pensionStockValue: expect.any(Number),
          nonPensionStockValue: expect.any(Number),
          stocksIncludingCash: expect.any(Number),
          incomeSince: expect.any(Number),
          spendingSince: expect.any(Number),
        }),
      );
    });
  });

  describe('cash allocation target', () => {
    const mutation = gql`
      mutation UpdateCashAllocationTarget($target: NonNegativeInt!) {
        updateCashAllocationTarget(target: $target) {
          error
        }
      }
    `;

    const query = gql`
      query CashAllocationTarget {
        cashAllocationTarget
      }
    `;

    describe('setter', () => {
      const setup = async (): Promise<Maybe<CrudResponseUpdate>> => {
        const res = await runMutation<MutationUpdateCashAllocationTargetArgs>(app, mutation, {
          target: 4500000,
        });
        return res?.updateCashAllocationTarget ?? null;
      };

      it('should set the cash target in the database', async () => {
        expect.assertions(2);

        const res = await setup();
        expect(res?.error).toBeNull();

        const { rows } = await getPool().query(
          sql`SELECT * FROM funds_cash_target WHERE uid = ${app.uid}`,
        );

        expect(rows).toStrictEqual([
          expect.objectContaining({
            allocation_target: 4500000,
          }),
        ]);
      });

      it('should publish a message to the queue', async () => {
        expect.assertions(2);

        await setup();

        expect(publishSpy).toHaveBeenCalledTimes(1);
        expect(publishSpy).toHaveBeenCalledWith(
          `${pubsub.PubSubTopic.CashAllocationTargetUpdated}.${app.uid}`,
          4500000,
        );
      });
    });

    describe('getter', () => {
      it('should reply with the given cash target for the current user', async () => {
        expect.assertions(2);

        const res0 = await runQuery(app, query);

        expect(res0?.cashAllocationTarget).toBe(0);

        await runMutation<MutationUpdateCashAllocationTargetArgs>(app, mutation, {
          target: 1500000,
        });

        const res1 = await runQuery(app, query);

        expect(res1?.cashAllocationTarget).toBe(1500000);
      });
    });
  });

  describe('fund allocation targets', () => {
    const mutation = gql`
      mutation UpdateFundAllocationTargets($deltas: [TargetDelta!]!) {
        updateFundAllocationTargets(deltas: $deltas) {
          deltas {
            id
            allocationTarget
          }
        }
      }
    `;

    const setup = async (
      secondAllocation: number,
      thirdAllocation: number,
    ): Promise<{
      res: Maybe<UpdatedFundAllocationTargets>;
      id2: number;
      id3: number;
    }> => {
      const [, id2, id3] = await getPool().transaction(async (db) => {
        await db.query(sql`DELETE FROM funds WHERE uid = ${app.uid}`);
        const { rows: idRows } = await db.query<{ id: number }>(sql`
        INSERT INTO funds (uid, item, allocation_target)
        SELECT * FROM ${sql.unnest(
          [
            [app.uid, 'Fund 1', 50],
            [app.uid, 'Fund 2', 30],
            [app.uid, 'Fund 3', 20],
            [app.uid, 'Fund 4', null],
            [app.uid, 'Fund 5', 0],
          ],
          ['int4', 'text', 'float8'],
        )}
        RETURNING id
        `);
        return idRows.map((row) => row.id);
      });

      const res = await runMutation<MutationUpdateFundAllocationTargetsArgs>(app, mutation, {
        deltas: [
          { id: id2, allocationTarget: secondAllocation },
          { id: id3, allocationTarget: thirdAllocation },
        ],
      });
      return { id2, id3, res: res?.updateFundAllocationTargets ?? null };
    };

    describe.each`
      case          | secondAllocation | thirdAllocation
      ${'exactly'}  | ${40}            | ${10}
      ${'strictly'} | ${40}            | ${5}
    `(
      'when the target values $case fit in the remaining allocation',
      ({ secondAllocation, thirdAllocation }) => {
        it('should set the allocations accordingly in the database', async () => {
          expect.assertions(1);
          await setup(secondAllocation, thirdAllocation);

          const { rows } = await getPool().query(sql`SELECT * FROM funds WHERE uid = ${app.uid}`);

          expect(rows).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({ item: 'Fund 1', allocation_target: 50 }),
              expect.objectContaining({ item: 'Fund 2', allocation_target: secondAllocation }),
              expect.objectContaining({ item: 'Fund 3', allocation_target: thirdAllocation }),
              expect.objectContaining({ item: 'Fund 4', allocation_target: null }),
              expect.objectContaining({ item: 'Fund 5', allocation_target: 0 }),
            ]),
          );
        });

        it('should return the updated delta', async () => {
          expect.assertions(1);
          const { res } = await setup(secondAllocation, thirdAllocation);

          expect(res).toStrictEqual(
            expect.objectContaining({
              deltas: expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(Number),
                  allocationTarget: secondAllocation,
                }),
                expect.objectContaining({
                  id: expect.any(Number),
                  allocationTarget: thirdAllocation,
                }),
              ]),
            }),
          );
        });

        it('should publish a message to the queue', async () => {
          expect.assertions(2);

          const { id2, id3 } = await setup(secondAllocation, thirdAllocation);

          expect(publishSpy).toHaveBeenCalledTimes(1);
          expect(publishSpy).toHaveBeenCalledWith(
            `${pubsub.PubSubTopic.FundAllocationTargetsUpdated}.${app.uid}`,
            {
              deltas: expect.arrayContaining([
                { id: id2, allocationTarget: secondAllocation },
                { id: id3, allocationTarget: thirdAllocation },
              ]),
            },
          );
        });
      },
    );

    describe('when the target values do not fit in the remaining allocation', () => {
      it('should reduce the targets proportionately', async () => {
        expect.assertions(2);

        const secondAllocation = 40;
        const thirdAllocation = 25;

        // Remaining allocation is 50, after the first fund

        const expectedSecondAllocation = 31; // 50 * 40 / 65
        const expectedThirdAllocation = 19; // 50 * 25 / 65

        const { res } = await setup(secondAllocation, thirdAllocation);

        const { rows } = await getPool().query(sql`SELECT * FROM funds WHERE uid = ${app.uid}`);

        expect(rows).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({ item: 'Fund 1', allocation_target: 50 }),
            expect.objectContaining({
              item: 'Fund 2',
              allocation_target: expectedSecondAllocation,
            }),
            expect.objectContaining({ item: 'Fund 3', allocation_target: expectedThirdAllocation }),
            expect.objectContaining({ item: 'Fund 4', allocation_target: null }),
            expect.objectContaining({ item: 'Fund 5', allocation_target: 0 }),
          ]),
        );

        expect(res).toStrictEqual(
          expect.objectContaining({
            deltas: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                allocationTarget: expectedSecondAllocation,
              }),
              expect.objectContaining({
                id: expect.any(Number),
                allocationTarget: expectedThirdAllocation,
              }),
            ]),
          }),
        );
      });
    });
  });

  const createFunds = async (fundInputs: RawDateFundInput[]): Promise<number[]> => {
    const res = await Promise.all(
      fundInputs.map((input) =>
        runMutation<MutationCreateFundArgs>(
          app,
          gql`
            mutation CreateFund($fakeId: Int!, $input: FundInput!) {
              createFund(fakeId: $fakeId, input: $input) {
                id
                error
              }
            }
          `,
          {
            fakeId: 0,
            input,
          },
        ),
      ),
    );
    return res.map((r) => r?.createFund?.id as number);
  };

  describe('readFunds', () => {
    const query = gql`
      query ReadFunds {
        readFunds {
          items {
            id
            item
            allocationTarget
            transactions {
              date
              units
              price
              fees
              taxes
              drip
              pension
            }
            stockSplits {
              date
              ratio
            }
          }
        }
      }
    `;

    const setup = async (
      fund: RawDateFundInput = fundInput,
    ): Promise<{
      id: number;
      res: Maybe<Fund[]>;
    }> => {
      const [id] = await createFunds([fund]);

      const res = await runQuery(app, query);
      return { res: res?.readFunds?.items ?? null, id };
    };

    it('should get a list of funds with their transactions and splits', async () => {
      expect.assertions(1);
      const { id, res } = await setup();

      expect(res?.find((item) => item.id === id)).toStrictEqual(
        expect.objectContaining<RawDateFund>({
          id,
          item: 'My fund',
          allocationTarget: 20,
          transactions: [
            expect.objectContaining<RawDate<Transaction, 'date'>>({
              date: '2020-04-20',
              units: 69,
              price: 949.35,
              fees: 1199,
              taxes: 1776,
              drip: false,
              pension: false,
            }),
          ],
          stockSplits: [expect.objectContaining({ date: '2020-04-11', ratio: 8 })],
        }),
      );
    });

    describe('when there are no transactions', () => {
      it('should set transactions to an empty array', async () => {
        expect.assertions(1);

        const { res, id } = await setup({ ...fundInput, transactions: [] });

        const row = res?.find((item) => item.id === id);

        expect(row?.transactions).toStrictEqual([]);
      });
    });

    describe('when there is no allocation target', () => {
      it('should set allocationTarget to null', async () => {
        expect.assertions(1);

        const { res, id } = await setup({ ...fundInput, allocationTarget: null });

        const row = res?.find((item) => item.id === id);

        expect(row?.allocationTarget).toBeNull();
      });
    });
  });

  describe('fundHistory', () => {
    const query = gql`
      query FundHistory($period: FundPeriod, $length: NonNegativeInt) {
        fundHistory(period: $period, length: $length) {
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

    const numTestPrices = config.data.funds.historyResolution * 5;

    const cacheTimeRows = Array(numTestPrices)
      .fill(0)
      .map((_, index) => ({ time: addHours(new Date('2020-04-20'), -index) }))
      .reverse();

    const setup = async (): Promise<{
      fundId: number;
      res: Maybe<FundHistory>;
    }> => {
      const [fundId] = await createFunds([fundInput]);
      const { cids, fid } = await getPool().transaction(async (db) => {
        const { rows } = await db.query<{ fid: number }>(sql`
        INSERT INTO fund_scrape (broker, item) VALUES (${'generic'}, ${fundInput.item})
        ON CONFLICT (broker, item) DO UPDATE set broker = excluded.broker
        RETURNING fid
        `);
        const cacheFid = rows[0].fid;

        const { rows: cidRows } = await db.query<{ cid: number }>(sql`
        INSERT INTO fund_cache_time (time)
        SELECT * FROM ${sql.unnest(
          cacheTimeRows.map((row) => [row.time.toISOString()]),
          ['timestamptz'],
        )}
        RETURNING cid
        `);
        const cacheIds = cidRows.map((row) => row.cid);

        await db.query(sql`
        INSERT INTO fund_cache (cid, fid, price)
        SELECT * FROM ${sql.unnest(
          cacheIds.reduce<[number, number, number][]>(
            (last, cid) => [
              ...last,
              [
                cid,
                cacheFid,
                (last[last.length - 1]?.[2] ?? 100) * (1 + 0.05 * (2 * Math.random() - 1)),
              ],
            ],
            [],
          ),
          ['int4', 'int4', 'float8'],
        )}
        `);

        return { cids: cacheIds, fid: cacheFid };
      });

      const clock = sinon.useFakeTimers(new Date('2020-04-26T13:20:03Z'));

      const res = await runQuery(app, query);

      clock.restore();

      await getPool().transaction(async (db) => {
        await db.query(sql`DELETE FROM fund_scrape WHERE fid = ${fid}`);
        await db.query(
          sql`DELETE FROM fund_cache_time WHERE cid = ANY(${sql.array(cids, 'int4')})`,
        );
      });

      return {
        fundId: fundId as number,
        res: res?.fundHistory ?? null,
      };
    };

    it('should include the first timestamp', async () => {
      expect.assertions(1);
      const { res } = await setup();

      expect(res?.startTime).toBe(getUnixTime(cacheTimeRows[0].time));
    });

    it('should return the list of timestamps corresponding to each displayed cached price', async () => {
      expect.assertions(3);
      const { res } = await setup();

      expect(res?.cacheTimes?.[0]).toBe(0);

      expect(res?.cacheTimes).toStrictEqual(
        expect.arrayContaining([
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
      );

      expect(res?.cacheTimes.slice(1).every((value, index) => value > res?.cacheTimes[index])).toBe(
        true,
      );
    });

    it('should include the last timestamp', async () => {
      expect.assertions(1);
      const { res } = await setup();

      expect(res?.cacheTimes[res?.cacheTimes.length - 1]).toBe(
        getUnixTime(cacheTimeRows[cacheTimeRows.length - 1].time) -
          getUnixTime(cacheTimeRows[0].time),
      );
    });

    it('should include the second-to-last timestamp', async () => {
      expect.assertions(1);
      const { res } = await setup();

      expect(res?.cacheTimes[res?.cacheTimes.length - 2]).toBe(
        getUnixTime(cacheTimeRows[cacheTimeRows.length - 2].time) -
          getUnixTime(cacheTimeRows[0].time),
      );
    });

    it('should return the annualised fund returns', async () => {
      expect.assertions(2);
      const { res } = await setup();
      expect(res?.annualisedFundReturns).toStrictEqual(expect.any(Number));
      expect(res?.annualisedFundReturns).toMatchInlineSnapshot(`0.07`);
    });

    it('should return the overview fund values', async () => {
      expect.assertions(1);

      // see src/api/seeds/test/test-data.ts
      const aug2017ScrapedValue = Math.round(
        123 * (89.095 + 894.134 - 883.229) + 100 * 0 + 50.97 * (1678.42 + 846.38),
      );

      await seedData(app.uid);

      const clock = sinon.useFakeTimers(new Date('2018-04-20'));

      const res = await runQuery(app, query);

      clock.restore();

      expect(res?.fundHistory?.overviewCost).toStrictEqual([
        /* Mar-16 */ 0,
        /* Apr-16 */ 0,
        /* May-16 */ 0,
        /* Jun-16 */ 0,
        /* Jul-16 */ 0,
        /* Aug-16 */ 0,
        /* Sep-16 */ 0,
        /* Oct-16 */ 0,
        /* Nov-16 */ 0,
        /* Dec-16 */ 0,
        /* Jan-17 */ 0,
        /* Feb-17 */ 0,
        /* Mar-17 */ 0,
        /* Apr-17 */ 0,
        /* May-17 */ 0,
        /* Jun-17 */ 0,
        /* Jul-17 */ 0,
        /* Aug-17 */ aug2017ScrapedValue,
        /* Sep-17 */ 0,
        /* Oct-17 */ 0,
        /* Nov-17 */ 0,
        /* Dec-17 */ 0,
        /* Jan-18 */ 0,
        /* Feb-18 */ 0,
        /* Mar-18 */ 0,
        /* Apr-18 */ 0,
      ]);
    });

    it('should not include pension transactions', async () => {
      expect.assertions(2);

      await seedData(app.uid);

      const clock = sinon.useFakeTimers(new Date('2018-04-20'));

      const resPrevious = await runQuery(app, query);

      await getPool().connect(async (db) => {
        const fundIdRows = await db.query<{ id: number }>(sql`
        SELECT id FROM funds WHERE uid = ${app.uid}
        `);
        await db.query(sql`
        INSERT INTO funds_transactions (fund_id, date, units, price, fees, taxes, is_drip, is_pension)
        SELECT * FROM ${sql.unnest(
          fundIdRows.rows.map((row) => [row.id, '2014-01-01', 10000, 10000, 0, 0, false, true]),
          ['int4', 'date', 'float8', 'float8', 'int4', 'int4', 'bool', 'bool'],
        )}
        `);
      });

      const res = await runQuery(app, query);

      clock.restore();

      expect(res?.fundHistory?.overviewCost).toStrictEqual(resPrevious?.fundHistory?.overviewCost);
      expect(res?.fundHistory?.overviewCost).toMatchInlineSnapshot(`
        Array [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          140989,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ]
      `);
    });

    it('should return the prices for each fund', async () => {
      expect.assertions(1);
      const { res, fundId } = await setup();

      expect(res?.prices).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining<FundPrices>({
            fundId,
            groups: [
              expect.objectContaining({
                startIndex: 0,
                values: expect.arrayContaining([expect.any(Number)]),
              }),
            ],
          }),
        ]),
      );
    });
  });

  describe('fundHistoryIndividual', () => {
    const query = gql`
      query FundHistoryIndividual($id: NonNegativeInt!) {
        fundHistoryIndividual(id: $id) {
          values {
            date
            price
          }
        }
      }
    `;

    const setup = async (): Promise<Maybe<FundHistoryIndividual>> => {
      const [fundId] = await createFunds([fundInput]);
      await getPool().transaction(async (db) => {
        const { rows: fundScrapeRows } = await db.query<{ fid: number }>(sql`
        INSERT INTO fund_scrape (broker, item) VALUES (${'generic'}, ${fundInput.item})
        ON CONFLICT (broker, item) DO UPDATE set broker = excluded.broker
        RETURNING fid
        `);
        const fid = fundScrapeRows[0].fid;

        const { rows: cacheTimeRows } = await db.query<{ cid: number }>(sql`
        INSERT INTO fund_cache_time (time) VALUES ${sql.join(
          [sql`(${'2020-04-20T11:20:31Z'})`, sql`(${'2020-04-21Z'})`],
          sql`, `,
        )}
        RETURNING cid
        `);
        const [cid1, cid2] = cacheTimeRows.map((row) => row.cid);

        await db.query(sql`
        INSERT INTO fund_cache (fid, cid, price) VALUES ${sql.join(
          [sql`(${fid}, ${cid1}, ${441.52})`, sql`(${fid}, ${cid2}, ${436.81})`],
          sql`, `,
        )}
        `);
      });

      const res = await runQuery<QueryFundHistoryIndividualArgs>(app, query, { id: fundId });
      return res?.fundHistoryIndividual ?? null;
    };

    it('should return the full list of prices with UNIX timestamps', async () => {
      expect.assertions(1);
      const res = await setup();

      expect(res).toStrictEqual(
        expect.objectContaining<FundHistoryIndividual>({
          values: expect.arrayContaining(
            [
              { date: getUnixTime(new Date('2020-04-20T11:20:31Z')), price: 441.52 },
              { date: getUnixTime(new Date('2020-04-21')), price: 436.81 },
            ].map(expect.objectContaining),
          ),
        }),
      );
    });
  });

  describe('stockPrices', () => {
    const query = gql`
      query StockPrices($codes: [String!]!) {
        stockPrices(codes: $codes) {
          error
          prices {
            code
            price
          }
          refreshTime
        }
      }
    `;

    const setup = async (): Promise<Maybe<NativeDate<StockPricesResponse, 'refreshTime'>>> => {
      await seedData(app.uid);
      const clock = sinon.useFakeTimers(new Date('2020-04-26T13:20:03Z'));
      const res = await runQuery<QueryStockPricesArgs>(app, query, {
        codes: ['FCSS.L', 'SMT.L'],
      });
      clock.restore();
      return res?.stockPrices ?? null;
    };

    it('should return the latest prices', async () => {
      expect.assertions(2);
      const res = await setup();
      expect(res?.prices).toHaveLength(2);
      expect(res?.prices).toStrictEqual(
        expect.arrayContaining<StockPrice>(
          [
            { code: 'FCSS.L', price: 388.29 },
            { code: 'SMT.L', price: 1197.23 },
          ].map(expect.objectContaining),
        ),
      );
    });

    it('should set and return the refresh time', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.refreshTime).toMatchInlineSnapshot(`"2020-04-26T13:20:03.000Z"`);
    });
  });

  describe('stockValue', () => {
    const query = gql`
      query StockValue {
        stockValue {
          latestValue
          previousValue
          refreshTime
        }
      }
    `;

    const setup = async (): Promise<Maybe<NativeDate<StockValueResponse, 'refreshTime'>>> => {
      await seedData(app.uid);
      const clock = sinon.useFakeTimers(new Date('2020-04-26T13:20:03Z'));
      const res = await runQuery(app, query);
      clock.restore();
      return res?.stockValue ?? null;
    };

    it('should return the latest value (including pension)', async () => {
      expect.assertions(2);
      // check fixtures to verify these expected values
      const expectedValue = Math.round(
        1197.23 * (1005.2 + 1004 - 1005.2 + 89.095 + 894.134 - 883.229),
      );
      const res = await setup();
      expect(res?.latestValue).toBeCloseTo(expectedValue);
      expect(res?.latestValue).toMatchInlineSnapshot(`1321742`);
    });

    it('should return the previous value (including pension)', async () => {
      expect.assertions(2);
      const res = await setup();
      // check fixtures to verify these expected values
      const expectedValue = Math.round(
        127.39 * (1005.2 + 1004 - 1005.2 + 89.095 + 894.134 - 883.229),
      );
      expect(res?.previousValue).toBeCloseTo(expectedValue);
      expect(res?.previousValue).toMatchInlineSnapshot(`140639`);
    });

    it('should set and return the refresh time', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.refreshTime).toMatchInlineSnapshot(`"2020-04-26T13:20:03.000Z"`);
    });
  });

  describe('updateFund', () => {
    const mutation = gql`
      mutation UpdateFund($id: Int!, $input: FundInput!) {
        updateFund(id: $id, input: $input) {
          error
        }
      }
    `;

    const modifiedFund: RawDateFundInput = {
      ...fundInput,
      item: altFundName,
      transactions: [
        {
          date: '2020-04-20',
          units: 69,
          price: 42.8,
          fees: 87,
          taxes: 0,
          drip: true,
          pension: false,
        },
        {
          date: '2020-04-29',
          units: 123,
          price: 100.3,
          fees: 0,
          taxes: 104,
          drip: false,
          pension: true,
        },
      ],
      allocationTarget: 15,
      stockSplits: [
        {
          date: '2020-04-09',
          ratio: 12,
        },
      ],
    };

    const setup = async (
      data: RawDateFundInput = modifiedFund,
      id?: number,
    ): Promise<{
      res: Maybe<CrudResponseUpdate>;
      id: number;
    }> => {
      const [fundId] = id ? [id] : await createFunds([data]);

      publishSpy.mockClear();
      const res = await runMutation<MutationUpdateFundArgs>(app, mutation, {
        id: fundId,
        input: data,
      });

      return {
        id: fundId,
        res: res?.updateFund ?? null,
      };
    };

    it('should respond with a null error', async () => {
      expect.assertions(1);
      const { res } = await setup();

      expect(res?.error).toBeNull();
    });

    it('should update the fund, transactions and stock splits in the database', async () => {
      expect.assertions(5);
      const { id } = await setup();

      const [
        {
          rows: [row],
        },
        { rows: transactionRows },
        { rows: stockSplitRows },
      ] = await getPool().connect(async (db) =>
        Promise.all([
          db.query(sql`SELECT * FROM funds WHERE id = ${id}`),
          db.query(sql`SELECT ft.* FROM funds_transactions ft WHERE ft.fund_id = ${id}`),
          db.query(sql`SELECT ss.* FROM funds_stock_splits ss WHERE ss.fund_id = ${id}`),
        ]),
      );

      expect(row).toStrictEqual(
        expect.objectContaining({
          id,
          item: modifiedFund.item,
          allocation_target: modifiedFund.allocationTarget,
        }),
      );

      expect(transactionRows).toHaveLength(2);
      expect(transactionRows).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            date: new Date('2020-04-20'),
            units: 69,
            price: 42.8,
            fees: 87,
            taxes: 0,
            is_drip: true,
            is_pension: false,
          }),
          expect.objectContaining({
            date: new Date('2020-04-29'),
            units: 123,
            price: 100.3,
            fees: 0,
            taxes: 104,
            is_drip: false,
            is_pension: true,
          }),
        ]),
      );

      expect(stockSplitRows).toHaveLength(1);
      expect(stockSplitRows).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            date: new Date('2020-04-09'),
            ratio: 12,
          }),
        ]),
      );
    });

    it('should publish to the pubsub topic', async () => {
      expect.assertions(3);

      const { id } = await setup();

      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy).toHaveBeenCalledWith<[string, FundSubscription]>(
        `${pubsub.PubSubTopic.FundsChanged}.${app.uid}`,
        {
          updated: {
            ...modifiedFund,
            id,
          },
          overviewCost: expect.arrayContaining([expect.any(Number)]),
        },
      );
      expect(publishSpy).toHaveBeenCalledWith<[string, NetWorthCashTotal]>(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${app.uid}`,
        expect.objectContaining<NetWorthCashTotal>({
          cashInBank: expect.any(Number),
          nonPensionStockValue: expect.any(Number),
          pensionStockValue: expect.any(Number),
          stocksIncludingCash: expect.any(Number),
          incomeSince: expect.any(Number),
          spendingSince: expect.any(Number),
        }),
      );
    });

    describe('when changing the name of the fund', () => {
      it('should also update the name of the fund_cache entry', async () => {
        expect.assertions(2);

        await getPool().query(
          sql`DELETE FROM fund_scrape WHERE item = ANY(${sql.array(
            ['My fund 1', 'My fund with changed name'],
            'text',
          )})`,
        );

        const [id] = await createFunds([
          {
            ...fundInput,
            item: 'My fund 1',
          },
        ]);

        await getPool().query(
          sql`INSERT INTO fund_scrape (broker, fid, item) VALUES (${'hl'}, ${12345}, ${'My fund 1'})`,
        );

        await setup(
          {
            ...fundInput,
            item: 'My fund with changed name',
          },
          id,
        );

        const { rows: fundScrape } = await getPool().query(sql`SELECT * FROM fund_scrape`);

        expect(fundScrape).toStrictEqual(
          expect.arrayContaining([
            {
              broker: 'hl',
              fid: 12345,
              item: 'My fund with changed name',
            },
          ]),
        );

        expect(fundScrape).not.toStrictEqual(
          expect.arrayContaining([
            {
              broker: 'hl',
              fid: 12345,
              item: 'My fund 1',
            },
          ]),
        );
      });
    });
  });

  describe('deleteFund', () => {
    const mutation = gql`
      mutation DeleteFund($id: Int!) {
        deleteFund(id: $id) {
          error
        }
      }
    `;

    const setup = async (): Promise<{
      id: number;
      res: Maybe<CrudResponseDelete>;
    }> => {
      const [id] = await createFunds([fundInput]);

      publishSpy.mockClear();
      const res = await runMutation<MutationDeleteFundArgs>(app, mutation, { id });

      return { id, res: res?.deleteFund ?? null };
    };

    it('should respond with a null error', async () => {
      expect.assertions(1);
      const { res } = await setup();

      expect(res?.error).toBeNull();
    });

    it('should delete the fund from the database', async () => {
      expect.assertions(1);
      const { id } = await setup();

      const { rowCount } = await getPool().query(sql`SELECT * FROM funds WHERE id = ${id}`);
      expect(rowCount).toBe(0);
    });

    it('should publish to the pubsub topic', async () => {
      expect.assertions(3);

      const { id } = await setup();

      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy).toHaveBeenCalledWith<[string, FundSubscription]>(
        `${pubsub.PubSubTopic.FundsChanged}.${app.uid}`,
        {
          deleted: id,
          overviewCost: expect.arrayContaining([expect.any(Number)]),
        },
      );
      expect(publishSpy).toHaveBeenCalledWith<[string, NetWorthCashTotal]>(
        `${pubsub.PubSubTopic.NetWorthCashTotalUpdated}.${app.uid}`,
        expect.objectContaining<NetWorthCashTotal>({
          cashInBank: expect.any(Number),
          pensionStockValue: expect.any(Number),
          nonPensionStockValue: expect.any(Number),
          stocksIncludingCash: expect.any(Number),
          incomeSince: expect.any(Number),
          spendingSince: expect.any(Number),
        }),
      );
    });
  });
});
