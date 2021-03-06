import gql from 'graphql-tag';
import moize from 'moize';
import sinon from 'sinon';
import { sql } from 'slonik';

import { seedData } from '~api/__tests__/fixtures';
import { withSlonik } from '~api/modules/db';
import { App, getTestApp } from '~api/test-utils/create-server';
import { Query, Overview, OverviewOld, Maybe } from '~api/types';

describe('Overview resolver', () => {
  let clock: sinon.SinonFakeTimers;
  let app: App;
  const now = new Date('2018-04-20');
  beforeAll(
    withSlonik(async (db) => {
      clock = sinon.useFakeTimers(now);
      app = await getTestApp();

      await db.query(sql`DELETE FROM net_worth`);
      await seedData(app.uid);
    }),
  );
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
        const res = await app.gqlClient.query<Query>({ query });
        expect(res.data?.overview).toBeNull();
      });
    });

    const setup = moize.promise(
      async (): Promise<Overview | null | undefined> => {
        const res = await app.authGqlClient.query<Query>({ query });
        return res.data?.overview;
      },
    );

    it.each`
      page                     | value
      ${'income'}              | ${433201}
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

    it('should return the initial cumulative income value', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.initialCumulativeValues.income).toBe(365202);
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

    const setup = moize.promise(
      async (): Promise<Maybe<OverviewOld>> => {
        const res = await app.authGqlClient.query<Query>({ query });
        return res.data?.overviewOld ?? null;
      },
    );

    // The expected values come from the seed data in src/api/__tests__/fixtures
    const expectedStocksOctober2014Jan2015 = Math.round(1005.2 * 117.93);
    const expectedStocksFeb2015August2015 = Math.round(1005.2 * 119.27);
    const expectedStocks = [
      /* Sep-14 */ 0,
      /* Oct-14 */ expectedStocksOctober2014Jan2015,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ expectedStocksFeb2015August2015,
      /* Mar-15 */ expectedStocksFeb2015August2015,
      /* Apr-15 */ 0,
      /* May-15 */ 0,
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
    ];

    const expectedPension = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ 1054200,
      /* Apr-15 */ 0,
      /* May-15 */ 1117503,
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
    ];

    const expectedLiquidCash = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ 1050000 + Math.round(62000 * 100 * 0.113),
      /* Apr-15 */ 0,
      /* May-15 */ 996542 + Math.round(57451 * 100 * 0.116) + Math.round(105 * 100 * 0.783),
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
    ];

    const expectedCashOther = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ 1667500 + 6338760 - expectedStocksFeb2015August2015,
      /* Apr-15 */ 0,
      /* May-15 */ 0 + 6354004 - 0,
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
    ];

    const expectedInvestments = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ 6338760,
      /* Apr-15 */ 0,
      /* May-15 */ 6354004,
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
    ];

    const expectedInvestmentPurchases = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ 0,
      /* Apr-15 */ 0,
      /* May-15 */ 12300000,
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
    ];

    const expectedIlliquidEquity = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ 42500000 - 36125000,
      /* Apr-15 */ 0,
      /* May-15 */ 43500000 - 34713229,
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
    ];

    const expectedOptions = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ Math.round(993 * (2113.7 - 1350.3)),
      /* Apr-15 */ 0,
      /* May-15 */ Math.round(101 * (19.27 - 4.53)),
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
    ];

    const expectedNetWorth = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ Math.round(
        /* bank */ 1050000 +
          /* locked cash */ 1667500 +
          /* ISA */ 6338760 +
          /* fx */ 62000 * 0.113 * 100 +
          /* house */ 42500000 +
          /* pension */ 1054200 +
          /* SAYE */ Math.round(993 * 1350.3) +
          /* mortgage */ -36125000 +
          /* cc */ -16532,
      ),
      /* Apr-15 */ 0,
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
          /* cc */ -12322,
      ),
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
    ];

    const expectedIncome = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ 0,
      /* Apr-15 */ 365202,
      /* May-15 */ 0,
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
    ];

    const expectedSpending = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ 0,
      /* Apr-15 */ 0,
      /* May-15 */ 83 + 156 + 7619,
      /* Jun-15 */ 0,
      /* Jul-15 */ 0,
      /* Aug-15 */ 0,
      /* Sep-15 */ 0,
      /* Oct-15 */ 0,
      /* Nov-15 */ 0,
      /* Dec-15 */ 0,
      /* Jan-16 */ 0,
      /* Feb-16 */ 0,
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
