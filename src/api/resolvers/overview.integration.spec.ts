import gql from 'graphql-tag';
import moize from 'moize';
import sinon from 'sinon';

import { seedData } from '~api/__tests__/fixtures';
import { App, getTestApp } from '~api/test-utils/create-server';
import { Query, Overview, OverviewOld, Maybe } from '~api/types';

describe('Overview resolver', () => {
  let clock: sinon.SinonFakeTimers;
  let app: App;
  const now = new Date('2018-04-20');
  beforeAll(async () => {
    clock = sinon.useFakeTimers(now);
    app = await getTestApp();

    await seedData(app.uid, app.db);
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
          annualisedFundReturns
          monthly {
            stocks
            income
            bills
            food
            general
            holiday
            social
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
      page         | value
      ${'income'}  | ${433201}
      ${'bills'}   | ${76402}
      ${'food'}    | ${113401}
      ${'general'} | ${11143}
      ${'holiday'} | ${35014}
      ${'social'}  | ${61923}
    `('should return $page data', async ({ page, value }) => {
      expect.assertions(1);
      const res = await setup();
      expect(res?.monthly).toStrictEqual(
        expect.objectContaining({
          [page]: [...Array(24).fill(0), value, ...Array(13).fill(0)],
        }),
      );
    });

    it('should omit costs for house purchases', async () => {
      expect.assertions(1);
      await app.db('general').insert({
        date: new Date('2018-03-13'),
        item: 'Deposit',
        category: 'House purchase',
        cost: 5956000,
        shop: 'Some conveyancer',
      });

      const res = await app.authGqlClient.query<Query>({ query });
      expect(res.data?.overview?.monthly.general[24]).toBe(11143);
    });

    it('should return funds data', async () => {
      expect.assertions(1);
      const res = await setup();

      // see src/api/seeds/test/test-data.ts
      const aug2017ScrapedValue = Math.round(
        123 * (89.095 + 894.134 - 883.229) + 100 * 0 + 50.97 * (1678.42 + 846.38),
      );

      expect(res?.monthly.stocks).toStrictEqual([
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
        /* Sep-17 */ aug2017ScrapedValue,
        /* Oct-17 */ aug2017ScrapedValue,
        /* Nov-17 */ aug2017ScrapedValue,
        /* Dec-17 */ aug2017ScrapedValue,
        /* Jan-18 */ aug2017ScrapedValue,
        /* Feb-18 */ aug2017ScrapedValue,
        /* Mar-18 */ aug2017ScrapedValue,
        /* Apr-18 */ aug2017ScrapedValue,
      ]);
    });

    it.each`
      description                  | prop                       | value
      ${'start date'}              | ${'startDate'}             | ${'2016-03-31T23:59:59.999Z'}
      ${'end date'}                | ${'endDate'}               | ${'2019-04-30T23:59:59.999Z'}
      ${'annualised fund returns'} | ${'annualisedFundReturns'} | ${0.07}
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
          cashOther
          investments
          homeEquity
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
      /* Nov-14 */ expectedStocksOctober2014Jan2015,
      /* Dec-14 */ expectedStocksOctober2014Jan2015,
      /* Jan-15 */ expectedStocksOctober2014Jan2015,
      /* Feb-15 */ expectedStocksFeb2015August2015,
      /* Mar-15 */ expectedStocksFeb2015August2015,
      /* Apr-15 */ expectedStocksFeb2015August2015,
      /* May-15 */ expectedStocksFeb2015August2015,
      /* Jun-15 */ expectedStocksFeb2015August2015,
      /* Jul-15 */ expectedStocksFeb2015August2015,
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

    const expectedCashOther = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ 1667500,
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

    const expectedInvestments = [
      /* Sep-14 */ 0,
      /* Oct-14 */ 0,
      /* Nov-14 */ 0,
      /* Dec-14 */ 0,
      /* Jan-15 */ 0,
      /* Feb-15 */ 0,
      /* Mar-15 */ 0,
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

    const expectedHomeEquity = [
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
          /* fx */ 62000 * 0.113 * 100 +
          /* house */ 42500000 +
          /* SAYE */ 993 * 1350.3 +
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
      description                      | prop             | value
      ${'start date'}                  | ${'startDate'}   | ${'2014-09-30T23:59:59.999Z'}
      ${'stocks'}                      | ${'stocks'}      | ${expectedStocks}
      ${'pension'}                     | ${'pension'}     | ${expectedPension}
      ${'other cash'}                  | ${'cashOther'}   | ${expectedCashOther}
      ${'investments (stocks + cash)'} | ${'investments'} | ${expectedInvestments}
      ${'home equity'}                 | ${'homeEquity'}  | ${expectedHomeEquity}
      ${'options'}                     | ${'options'}     | ${expectedOptions}
      ${'net worth'}                   | ${'netWorth'}    | ${expectedNetWorth}
      ${'income'}                      | ${'income'}      | ${expectedIncome}
      ${'spending'}                    | ${'spending'}    | ${expectedSpending}
    `('should return the historical $description', async ({ prop, value }) => {
      expect.assertions(1);

      const res = await setup();

      expect(res).toStrictEqual(expect.objectContaining({ [prop]: value }));
    });
  });
});
