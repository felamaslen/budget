import gql from 'graphql-tag';
import moize from 'moize';
import sinon from 'sinon';
import { sql } from 'slonik';

import { seedData } from '~api/__tests__/fixtures';
import { getPool } from '~api/modules/db';
import { App, getTestApp, runQuery } from '~api/test-utils';
import { Overview, OverviewOld, Maybe, Query } from '~api/types';

describe('overview resolver', () => {
  let clock: sinon.SinonFakeTimers;
  let app: App;
  const now = new Date('2018-04-20');
  beforeAll(async () => {
    await getPool().connect(async (db) => {
      clock = sinon.useFakeTimers(now);
      app = await getTestApp();

      await db.query(sql`DELETE FROM net_worth`);
      await seedData(app.uid);
    });
  });
  afterAll(async () => {
    clock.restore();
  });

  describe('query Overview', () => {
    const query = gql`
      query {
        overview {
          startDate
          endDate
          monthly {
            investmentPurchases
            income
            bills
            food
            general
            holiday
            social
          }
          futureIncome
          initialCumulativeValues {
            income
            spending
          }
        }
      }
    `;

    describe('when not logged in', () => {
      it('should return null', async () => {
        expect.assertions(1);
        const res = await app.gqlClient.query<Query>(query).toPromise();
        expect(res.data?.overview).toBeNull();
      });
    });

    const setup = moize.promise(async (): Promise<Overview | null | undefined> => {
      const res = await runQuery(app, query);
      return res?.overview;
    });

    const expectedDeductedIncome = 433201 - (39765 + 10520); // check seed

    it.each`
      page                     | value
      ${'income'}              | ${expectedDeductedIncome}
      ${'bills'}               | ${76402}
      ${'food'}                | ${113401}
      ${'general'}             | ${11143}
      ${'holiday'}             | ${35014}
      ${'social'}              | ${61923}
      ${'investmentPurchases'} | ${5956000}
    `('should return $page data', async ({ page, value }) => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.monthly).toStrictEqual(
        expect.objectContaining({
          [page]: [...Array(24).fill(0), value, ...Array(13).fill(0)],
        }),
      );
    });

    it('should return the initial cumulative (deducted) income value', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.initialCumulativeValues.income).toBe(470242 - (105040 + 39872));
    });

    it('should return the initial cumulative spending value', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.initialCumulativeValues.spending).toBe(83 + 156 + 7619); // exclude house deposit of 12300000
    });

    it.each`
      description     | prop           | value
      ${'start date'} | ${'startDate'} | ${'2016-03-31'}
      ${'end date'}   | ${'endDate'}   | ${'2019-04-30'}
    `('should return the $description', async ({ prop, value }) => {
      expect.assertions(1);
      const res = await setup();
      expect(res).toStrictEqual(
        expect.objectContaining({
          [prop]: value,
        }),
      );
    });

    it('should generate future income predictions based on the combined planning data', async () => {
      expect.assertions(1);
      const res = await setup();

      // check planning data in seed; tax calculations are unit tested individually
      const expectedMonthlyNetIncomeA2018 =
        Math.round((6600000 * 0.97) / 12) - 109000 - 42996 - 29265;
      const expectedMonthlyNetIncomeB2018 = Math.round((3700000 * 0.95) / 12) - 44950 - 25586;

      const expectedMonthlyNetIncomeA2019 =
        Math.round((6600000 * 0.97) / 12) - 109000 - 48669 - 27544;
      const expectedMonthlyNetIncomeB2019 = Math.round((3700000 * 0.95) / 12) - 44950 - 28251;

      expect(res?.futureIncome).toStrictEqual([
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Apr-18
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // May-18
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Jun-18
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Jul-18
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Aug-18
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Sep-18
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Oct-18
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Nov-18
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Dec-18
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Jan-19
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Feb-19
        expectedMonthlyNetIncomeA2018 + expectedMonthlyNetIncomeB2018, // Mar-19
        expectedMonthlyNetIncomeA2019 + expectedMonthlyNetIncomeB2019, // Apr-19
        expectedMonthlyNetIncomeA2019 + expectedMonthlyNetIncomeB2019, // May-19
        expectedMonthlyNetIncomeA2019 + expectedMonthlyNetIncomeB2019, // Jun-19
        expectedMonthlyNetIncomeA2019 + expectedMonthlyNetIncomeB2019, // Jul-19
        expectedMonthlyNetIncomeA2019 + expectedMonthlyNetIncomeB2019, // Aug-19
        expectedMonthlyNetIncomeA2019 + expectedMonthlyNetIncomeB2019, // Sep-19
        expectedMonthlyNetIncomeA2019 + expectedMonthlyNetIncomeB2019, // Oct-19
        expectedMonthlyNetIncomeA2019 + expectedMonthlyNetIncomeB2019, // Nov-19
        expectedMonthlyNetIncomeA2019 + expectedMonthlyNetIncomeB2019, // Dec-19
        expectedMonthlyNetIncomeA2019, // Jan-20
        expectedMonthlyNetIncomeA2019, // Feb-20
        expectedMonthlyNetIncomeA2019, // Mar-20
        Math.round((6600000 * 0.97) / 12), // Apr-20; no rates defined so tax etc. is 0
      ]);
    });
  });

  describe('query OverviewOld', () => {
    const query = gql`
      query OverviewOld($now: Date) {
        overviewOld(now: $now) {
          startDate
          stocks
          pension
          cashLiquid
          cashOther
          investments
          investmentPurchases
          illiquidEquity
          options
          netWorth
          income
          spending
        }
      }
    `;

    const setup = moize.promise(async (): Promise<Maybe<OverviewOld>> => {
      const res = await runQuery(app, query);
      return res?.overviewOld ?? null;
    });

    // The expected values come from the seed data in src/api/__tests__/fixtures
    const expectedStocksOctober2014Jan2015 = Math.round(1005.2 * 117.93);
    const expectedStocksFeb2015August2015 = Math.round(1005.2 * 119.27);
    const expectedStocks = [
      0, // Sep-14
      expectedStocksOctober2014Jan2015, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      expectedStocksFeb2015August2015, // Feb-15
      expectedStocksFeb2015August2015, // Mar-15
      0, // Apr-15
      0, // May-15
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    const expectedPension = [
      0, // Sep-14
      0, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      0, // Feb-15
      1054200, // Mar-15
      0, // Apr-15
      1117503, // May-15
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    const expectedLiquidCash = [
      0, // Sep-14
      0, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      0, // Feb-15
      1050000 + Math.round(62000 * 100 * 0.113), // Mar-15
      0, // Apr-15
      996542 + Math.round(57451 * 100 * 0.116) + Math.round(105 * 100 * 0.783), // May-15
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    const expectedCashOther = [
      0, // Sep-14
      0, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      0, // Feb-15
      1667500 + 6338760 - expectedStocksFeb2015August2015, // Mar-15
      0, // Apr-15
      0 + 6354004 - 0, // May-15
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    const expectedInvestments = [
      0, // Sep-14
      0, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      0, // Feb-15
      6338760, // Mar-15
      0, // Apr-15
      6354004, // May-15
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    const expectedInvestmentPurchases = [
      0, // Sep-14
      0, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      0, // Feb-15
      0, // Mar-15
      0, // Apr-15
      12300000, // May-15
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    const expectedIlliquidEquity = [
      0, // Sep-14
      0, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      0, // Feb-15
      42500000 - 36125000, // Mar-15
      0, // Apr-15
      43500000 - 34713229, // May-15
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    const expectedOptions = [
      0, // Sep-14
      0, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      0, // Feb-15
      Math.round(993 * (2113.7 - 1350.3)), // Mar-15
      0, // Apr-15
      Math.round(101 * (19.27 - 4.53)), // May-15
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    const expectedNetWorth = [
      0, // Sep-14
      0, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      0, // Feb-15
      /* Mar-15 */ Math.round(
        /* bank */ 1050000 +
          /* locked cash */ 1667500 +
          /* ISA */ 6338760 +
          /* fx */ 62000 * 0.113 * 100 +
          /* house */ 42500000 +
          /* pension */ 1054200 +
          /* SAYE */ Math.round(993 * 1350.3) +
          /* mortgage */ -36125000 +
          -16532, // cc
      ),
      0, // Apr-15
      /* May-15 */ Math.round(
        /* bank */ 996542 +
          /* locked cash */ 0 +
          /* ISA */ 6354004 +
          /* fx */ Math.round(105 * 0.783 * 100) +
          Math.round(57451 * 0.116 * 100) +
          /* house */ 43500000 +
          /* pension */ 1117503 +
          /* SAYE */ 0 +
          /* mortgage */ -34713229 +
          -12322, // cc
      ),
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    const expectedIncome = [
      0, // Sep-14
      0, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      0, // Feb-15
      0, // Mar-15
      470242 - (105040 + 39872), // Apr-15
      0, // May-15
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    const expectedSpending = [
      0, // Sep-14
      0, // Oct-14
      0, // Nov-14
      0, // Dec-14
      0, // Jan-15
      0, // Feb-15
      0, // Mar-15
      0, // Apr-15
      83 + 156 + 7619, // May-15
      0, // Jun-15
      0, // Jul-15
      0, // Aug-15
      0, // Sep-15
      0, // Oct-15
      0, // Nov-15
      0, // Dec-15
      0, // Jan-16
      0, // Feb-16
    ];

    it.each`
      description                      | prop                     | value
      ${'start date'}                  | ${'startDate'}           | ${'2014-09-30'}
      ${'stocks'}                      | ${'stocks'}              | ${expectedStocks}
      ${'pension'}                     | ${'pension'}             | ${expectedPension}
      ${'liquid cash'}                 | ${'cashLiquid'}          | ${expectedLiquidCash}
      ${'other cash'}                  | ${'cashOther'}           | ${expectedCashOther}
      ${'investments (stocks + cash)'} | ${'investments'}         | ${expectedInvestments}
      ${'investment purchases'}        | ${'investmentPurchases'} | ${expectedInvestmentPurchases}
      ${'illiquid equity'}             | ${'illiquidEquity'}      | ${expectedIlliquidEquity}
      ${'options'}                     | ${'options'}             | ${expectedOptions}
      ${'net worth'}                   | ${'netWorth'}            | ${expectedNetWorth}
      ${'income'}                      | ${'income'}              | ${expectedIncome}
      ${'spending'}                    | ${'spending'}            | ${expectedSpending}
    `('should return the historical $description', async ({ prop, value }) => {
      expect.assertions(1);

      const res = await setup();

      expect(res).toStrictEqual(expect.objectContaining({ [prop]: value }));
    });
  });
});
