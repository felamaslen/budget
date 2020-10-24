import moize from 'moize';
import sinon from 'sinon';
import { Response } from 'supertest';

describe('Overview route', () => {
  let clock: sinon.SinonFakeTimers;
  beforeAll(() => {
    clock = sinon.useFakeTimers(new Date('2018-04-20'));
  });
  afterAll(() => {
    clock.restore();
  });

  const setup = moize(
    async (): Promise<Response> => {
      const res = await global.withAuth(global.agent.get('/api/v4/data/overview'));

      return res;
    },
    { isPromise: true },
  );

  describe('GET /data/overview', () => {
    it('should return a 200 status code', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.status).toBe(200);
    });

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
      expect(res.body.data).toStrictEqual(
        expect.objectContaining({
          cost: expect.objectContaining({
            [page]: [...Array(24).fill(0), value, ...Array(13).fill(0)],
          }),
        }),
      );
    });

    it('should omit costs for house purchases', async () => {
      expect.assertions(1);
      await global.withAuth(
        global.agent.post('/api/v4/data/general').send({
          date: '2018-03-13',
          item: 'Deposit',
          category: 'House purchase',
          cost: 5956000,
          shop: 'Some conveyancer',
        }),
      );

      const res = await global.withAuth(global.agent.get('/api/v4/data/overview'));

      expect(res.body.data.cost.general[24]).toBe(11143);
    });

    it('should return funds data', async () => {
      expect.assertions(1);
      const res = await setup();

      // see api/src/seeds/test/test-data.ts
      const aug2017ScrapedValue = Math.round(
        123 * (89.095 + 894.134 - 883.229) + 100 * 0 + 50.97 * (1678.42 + 846.38),
      );

      expect(res.body.data).toStrictEqual(
        expect.objectContaining({
          cost: expect.objectContaining({
            funds: [
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
            ],
          }),
        }),
      );
    });

    it('should return the annualised fund returns', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data).toStrictEqual(
        expect.objectContaining({
          annualisedFundReturns: expect.any(Number),
        }),
      );
    });

    it.each`
      description                 | prop                | value
      ${'current month'}          | ${'currentMonth'}   | ${4}
      ${'current year'}           | ${'currentYear'}    | ${2018}
      ${'end date'}               | ${'endYearMonth'}   | ${[2019, 4]}
      ${'future months'}          | ${'futureMonths'}   | ${12}
      ${'start date'}             | ${'startYearMonth'} | ${[2016, 3]}
      ${'old home equity values'} | ${'homeEquityOld'}  | ${[0]}
    `('should return the $description', async ({ prop, value }) => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data).toStrictEqual(
        expect.objectContaining({
          [prop]: value,
        }),
      );
    });
  });
});
