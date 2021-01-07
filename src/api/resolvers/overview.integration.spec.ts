import gql from 'graphql-tag';
import moize from 'moize';
import sinon from 'sinon';

import { seedData } from '~api/__tests__/fixtures';
import { App, getTestApp } from '~api/test-utils/create-server';
import { Query, Overview } from '~api/types';

describe('Overview resolver', () => {
  let clock: sinon.SinonFakeTimers;
  let app: App;
  beforeAll(async () => {
    clock = sinon.useFakeTimers(new Date('2018-04-20'));
    app = await getTestApp();

    await seedData(app.uid, app.db);
  });
  afterAll(async () => {
    clock.restore();
  });

  describe('query Overview', () => {
    const overview = gql`
      query {
        overview {
          startDate
          endDate
          annualisedFundReturns
          homeEquityOld
          cost {
            funds
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
        const res = await app.gqlClient.query<Query>({
          query: overview,
        });
        expect(res.data?.overview).toBeNull();
      });
    });

    const setup = moize(
      async (): Promise<Overview | null | undefined> => {
        const res = await app.authGqlClient.query<Query>({ query: overview });
        return res.data?.overview;
      },
      { isPromise: true },
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
      expect(res?.cost).toStrictEqual(
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

      const res = await app.authGqlClient.query<Query>({ query: overview });
      expect(res.data?.overview?.cost.general[24]).toBe(11143);
    });

    it('should return funds data', async () => {
      expect.assertions(1);
      const res = await setup();

      // see src/api/seeds/test/test-data.ts
      const aug2017ScrapedValue = Math.round(
        123 * (89.095 + 894.134 - 883.229) + 100 * 0 + 50.97 * (1678.42 + 846.38),
      );

      expect(res?.cost.funds).toStrictEqual([
        /* Sep-14 */ 0,
        /* Oct-14 */ 0,
        /* Nov-14 */ 0,
        /* Dec-14 */ 0,
        /* Jan-15 */ 0,
        /* Feb-15 */ 0,
        /* Mar-15 */ 0,
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
        /* May-18 */ aug2017ScrapedValue,
        /* Jun-18 */ aug2017ScrapedValue,
        /* Jul-18 */ aug2017ScrapedValue,
        /* Aug-18 */ aug2017ScrapedValue,
        /* Sep-18 */ aug2017ScrapedValue,
        /* Oct-18 */ aug2017ScrapedValue,
        /* Nov-18 */ aug2017ScrapedValue,
        /* Dec-18 */ aug2017ScrapedValue,
        /* Jan-19 */ aug2017ScrapedValue,
        /* Feb-19 */ aug2017ScrapedValue,
        /* Mar-19 */ aug2017ScrapedValue,
        /* Apr-19 */ aug2017ScrapedValue,
      ]);
    });

    it.each`
      description                  | prop                       | value
      ${'start date'}              | ${'startDate'}             | ${'2016-03-31T23:59:59.999Z'}
      ${'end date'}                | ${'endDate'}               | ${'2019-04-30T23:59:59.999Z'}
      ${'annualised fund returns'} | ${'annualisedFundReturns'} | ${0.07}
      ${'old home equity values'}  | ${'homeEquityOld'}         | ${[0]}
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
});
