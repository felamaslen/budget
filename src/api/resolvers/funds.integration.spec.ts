import { addHours, getUnixTime } from 'date-fns';
import gql from 'graphql-tag';
import sinon from 'sinon';

import config from '~api/config';
import { App, getTestApp } from '~api/test-utils/create-server';
import {
  Create,
  CrudResponseCreate,
  CrudResponseDelete,
  CrudResponseUpdate,
  Fund,
  FundHistory,
  FundHistoryIndividual,
  FundInput,
  FundPrices,
  Maybe,
  Mutation,
  MutationUpdateCashAllocationTargetArgs,
  MutationUpdateFundAllocationTargetsArgs,
  MutationDeleteFundArgs,
  Query,
  QueryFundHistoryArgs,
  QueryFundHistoryIndividualArgs,
  RawDate,
  StockSplit,
  Transaction,
  UpdatedFundAllocationTargets,
} from '~api/types';

describe('Funds resolver', () => {
  let app: App;
  beforeAll(async () => {
    app = await getTestApp();
  });

  type RawDateFund = Omit<FundInput, 'transactions'> & {
    id: number;
    transactions: RawDate<Transaction, 'date'>[];
    stockSplits: RawDate<StockSplit, 'date'>[];
  };

  type RawDateFundInput = Create<Omit<RawDateFund, 'stockSplits'>>;

  const fundInput: RawDateFundInput = {
    item: 'My fund',
    transactions: [{ date: '2020-04-20', units: 69, price: 949.35, fees: 1199, taxes: 1776 }],
    allocationTarget: 20,
  };

  const altFundName = 'Different fund';

  const clearDb = async (): Promise<void> => {
    await app.db('funds').where({ item: fundInput.item }).del();
    await app.db('funds').where({ item: altFundName }).del();
    await app.db('fund_cache_time').del();
    await app.db('funds_cash_target').truncate();
  };

  beforeEach(clearDb);

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
      const res = await app.authGqlClient.mutate<
        Mutation,
        { fakeId: number; input: RawDateFundInput }
      >({
        mutation,
        variables: {
          fakeId: 0,
          input: fundInput,
        },
      });
      return res.data?.createFund ?? null;
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

      const row = await app.db('funds').where({ item: fundInput.item }).first();

      expect(row).toStrictEqual(
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

      const rows = await app.db('funds_transactions').where({ fund_id: id }).select();

      expect(rows).toHaveLength(1);
      expect(rows).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            units: 69,
            price: 949.35,
            fees: 1199,
            taxes: 1776,
          }),
        ]),
      );
    });
  });

  describe('Cash allocation target', () => {
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
      it('should set the cash target in the database', async () => {
        expect.assertions(2);

        const res = await app.authGqlClient.mutate<
          Mutation,
          MutationUpdateCashAllocationTargetArgs
        >({
          mutation,
          variables: {
            target: 4500000,
          },
        });

        expect(res.data?.updateCashAllocationTarget?.error).toBeNull();

        const result = await app.db('funds_cash_target').where({ uid: app.uid }).select();

        expect(result).toStrictEqual([
          expect.objectContaining({
            allocation_target: 4500000,
          }),
        ]);
      });
    });

    describe('getter', () => {
      it('should reply with the given cash target for the current user', async () => {
        expect.assertions(2);

        const res0 = await app.authGqlClient.query<Query>({ query });

        expect(res0.data.cashAllocationTarget).toBe(0);

        await app.authGqlClient.mutate<Mutation, MutationUpdateCashAllocationTargetArgs>({
          mutation,
          variables: {
            target: 1500000,
          },
        });

        await app.authGqlClient.clearStore();
        const res1 = await app.authGqlClient.query<Query>({ query });

        expect(res1.data.cashAllocationTarget).toBe(1500000);
      });
    });
  });

  describe('Fund allocation targets', () => {
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
    ): Promise<Maybe<UpdatedFundAllocationTargets>> => {
      await app.db('funds').where({ uid: app.uid }).del();
      const [, id2, id3] = await app
        .db('funds')
        .insert([
          { uid: app.uid, item: 'Fund 1', allocation_target: 50 },
          { uid: app.uid, item: 'Fund 2', allocation_target: 30 },
          { uid: app.uid, item: 'Fund 3', allocation_target: 20 },
          { uid: app.uid, item: 'Fund 4', allocation_target: null },
          { uid: app.uid, item: 'Fund 5', allocation_target: 0 },
        ])
        .returning('id');

      const res = await app.authGqlClient.mutate<Mutation, MutationUpdateFundAllocationTargetsArgs>(
        {
          mutation,
          variables: {
            deltas: [
              { id: id2, allocationTarget: secondAllocation },
              { id: id3, allocationTarget: thirdAllocation },
            ],
          },
        },
      );
      return res.data?.updateFundAllocationTargets ?? null;
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

          const rows = await app.db('funds').where({ uid: app.uid }).select();

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
          const res = await setup(secondAllocation, thirdAllocation);

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

        const res = await setup(secondAllocation, thirdAllocation);

        const rows = await app.db('funds').where({ uid: app.uid }).select();

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
        app.authGqlClient.mutate<Mutation, { fakeId: number; input: RawDateFundInput }>({
          mutation: gql`
            mutation CreateFund($fakeId: Int!, $input: FundInput!) {
              createFund(fakeId: $fakeId, input: $input) {
                id
                error
              }
            }
          `,
          variables: {
            fakeId: 0,
            input,
          },
        }),
      ),
    );
    return res.map((r) => r.data?.createFund?.id as number);
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

      await app.db('funds_stock_splits').insert([
        {
          fund_id: id,
          date: '2020-04-20',
          ratio: 10,
        },
      ]);

      await app.authGqlClient.clearStore();
      const res = await app.authGqlClient.query<Query>({
        query,
      });

      return { res: res.data.readFunds?.items ?? null, id };
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
            expect.objectContaining({
              date: '2020-04-20',
              units: 69,
              price: 949.35,
              fees: 1199,
              taxes: 1776,
            }),
          ],
          stockSplits: [expect.objectContaining({ date: '2020-04-20', ratio: 10 })],
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
      const {
        rows: [{ fid }],
      } = await app.db.raw<{ rows: { fid: number }[] }>(
        `
        INSERT INTO fund_scrape (broker, item) VALUES ('generic', ?)
        ON CONFLICT (broker, item) DO UPDATE set broker = excluded.broker
        RETURNING fid
        `,
        [fundInput.item],
      );

      const cids = await app.db('fund_cache_time').insert(cacheTimeRows).returning('cid');

      type CacheRow = { cid: number; fid: number; price: number };

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

      await app.db('fund_cache').insert(cacheRows);

      const clock = sinon.useFakeTimers(new Date('2020-04-26T13:20:03Z'));

      await app.authGqlClient.clearStore();
      const res = await app.authGqlClient.query<Query, QueryFundHistoryArgs>({
        query,
      });

      clock.restore();

      await app.db('fund_scrape').where({ fid }).del();
      await app.db('fund_cache_time').whereIn('cid', cids).del();

      return {
        fundId: fundId as number,
        res: res.data.fundHistory ?? null,
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
      const { res } = await setup();
      expect(res?.overviewCost).toStrictEqual(expect.arrayContaining([expect.any(Number)]));
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
      const {
        rows: [{ fid }],
      } = await app.db.raw<{ rows: { fid: number }[] }>(
        `
        INSERT INTO fund_scrape (broker, item) VALUES ('generic', ?)
        ON CONFLICT (broker, item) DO UPDATE set broker = excluded.broker
        RETURNING fid
        `,
        [fundInput.item],
      );

      const [cid1, cid2] = await app
        .db('fund_cache_time')
        .insert([{ time: new Date('2020-04-20T11:20:31Z') }, { time: new Date('2020-04-21') }])
        .returning('cid');

      await app.db('fund_cache').insert([
        { fid, cid: cid1, price: 441.52 },
        { fid, cid: cid2, price: 436.81 },
      ]);

      const res = await app.authGqlClient.query<Query, QueryFundHistoryIndividualArgs>({
        query,
        variables: { id: fundId },
      });
      return res.data.fundHistoryIndividual ?? null;
    };

    it('should return the full list of prices with UNIX timestamps', async () => {
      expect.assertions(1);
      const res = await setup();

      expect(res).toStrictEqual(
        expect.objectContaining<FundHistoryIndividual>({
          values: [
            { date: getUnixTime(new Date('2020-04-20T11:20:31Z')), price: 441.52 },
            { date: getUnixTime(new Date('2020-04-21')), price: 436.81 },
          ].map(expect.objectContaining),
        }),
      );
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
        { date: '2020-04-20', units: 69, price: 42.8, fees: 87, taxes: 0 },
        { date: '2020-04-29', units: 123, price: 100.3, fees: 0, taxes: 104 },
      ],
      allocationTarget: 15,
    };

    const setup = async (
      data: RawDateFundInput = modifiedFund,
      id?: number,
    ): Promise<{
      res: Maybe<CrudResponseUpdate>;
      id: number;
    }> => {
      const [fundId] = id ? [id] : await createFunds([data]);

      const res = await app.authGqlClient.mutate<Mutation, { id: number; input: RawDateFundInput }>(
        {
          mutation,
          variables: {
            id: fundId,
            input: data,
          },
        },
      );

      return {
        id: fundId,
        res: res.data?.updateFund ?? null,
      };
    };

    it('should respond with a null error', async () => {
      expect.assertions(1);
      const { res } = await setup();

      expect(res?.error).toBeNull();
    });

    it('should update the fund and transactions in the database', async () => {
      expect.assertions(3);
      const { id } = await setup();

      const row = await app.db('funds').where({ id }).first();

      expect(row).toStrictEqual(
        expect.objectContaining({
          id,
          item: modifiedFund.item,
          allocation_target: modifiedFund.allocationTarget,
        }),
      );

      const transactionRows = await app.db('funds_transactions').where({ fund_id: id }).select();

      expect(transactionRows).toHaveLength(2);
      expect(transactionRows).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            date: new Date('2020-04-20'),
            units: 69,
            price: 42.8,
            fees: 87,
            taxes: 0,
          }),
          expect.objectContaining({
            date: new Date('2020-04-29'),
            units: 123,
            price: 100.3,
            fees: 0,
            taxes: 104,
          }),
        ]),
      );
    });

    describe('when changing the name of the fund', () => {
      it('should also update the name of the fund_cache entry', async () => {
        expect.assertions(2);

        await app
          .db('fund_scrape')
          .whereIn('item', ['My fund 1', 'My fund with changed name'])
          .del();

        const [id] = await createFunds([
          {
            ...fundInput,
            item: 'My fund 1',
          },
        ]);

        await app.db('fund_scrape').insert({
          broker: 'hl',
          fid: 12345,
          item: 'My fund 1',
        });

        await setup(
          {
            ...fundInput,
            item: 'My fund with changed name',
          },
          id,
        );

        const fundScrape = await app.db('fund_scrape').select();

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

      const res = await app.authGqlClient.mutate<Mutation, MutationDeleteFundArgs>({
        mutation,
        variables: { id },
      });

      return { id, res: res.data?.deleteFund ?? null };
    };

    it('should respond with a null error', async () => {
      expect.assertions(1);
      const { res } = await setup();

      expect(res?.error).toBeNull();
    });

    it('should delete the fund from the database', async () => {
      expect.assertions(1);
      const { id } = await setup();

      const row = await app.db('funds').where({ id }).first();
      expect(row).toBeUndefined();
    });
  });
});
