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

    it('should return funds data', async () => {
      expect.assertions(1);
      const res = await setup();
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
              /* Aug-16 */ 100000,
              /* Sep-16 */ 100000 + 100000 + 200000,
              /* Oct-16 */ 100000 + 100000 + 200000,
              /* Nov-16 */ 100000 + 100000 + 200000,
              /* Dec-16 */ 100000 + 100000 + 200000,
              /* Jan-17 */ 100000 + 100000 + 200000,
              /* Feb-17 */ 100000 + 100000 + 200000 + 100000,
              /* Mar-17 */ 100000 + 100000 + 200000 + 100000,
              /* Apr-17 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* May-17 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Jun-17 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Jul-17 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Aug-17 */ Math.round(
                123 * (89.095 + 894.134 - 883.229) + 100 * 0 + 50.97 * (1678.42 + 846.38),
              ),
              /* Sep-17 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Oct-17 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Nov-17 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Dec-17 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Jan-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Feb-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Mar-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Apr-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* May-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Jun-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Jul-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Aug-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Sep-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Oct-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Nov-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Dec-18 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Jan-19 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Feb-19 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Mar-19 */ 100000 + 100000 + 200000 + 100000 - 90000,
              /* Apr-19 */ 100000 + 100000 + 200000 + 100000 - 90000,
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
      description        | prop                | value
      ${'current month'} | ${'currentMonth'}   | ${4}
      ${'current year'}  | ${'currentYear'}    | ${2018}
      ${'end date'}      | ${'endYearMonth'}   | ${[2019, 4]}
      ${'future months'} | ${'futureMonths'}   | ${12}
      ${'start date'}    | ${'startYearMonth'} | ${[2016, 3]}
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
