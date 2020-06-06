import moize from 'moize';
import sinon from 'sinon';
import { Response } from 'supertest';

describe('Analysis route', () => {
  let clock: sinon.SinonFakeTimers;
  beforeAll(() => {
    clock = sinon.useFakeTimers(new Date('2018-04-20'));
  });
  afterAll(() => {
    clock.restore();
  });

  describe('GET /data/analysis/year/category', () => {
    const setup = moize(
      async (): Promise<Response> => {
        const res = await global.withAuth(global.agent.get(`/api/v4/data/analysis/year/category`));

        return res;
      },
      {
        isPromise: true,
      },
    );

    it('should return a 200 status code', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.status).toBe(200);
    });

    it('should return cost data', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data.cost).toStrictEqual(
        expect.arrayContaining([
          [
            'bills',
            expect.arrayContaining([
              ['Rent', 72500],
              ['Electricity', 3902],
            ]),
          ],
          [
            'food',
            expect.arrayContaining([
              ['Food', 111162],
              ['Snacks', 2239],
            ]),
          ],
          ['general', expect.arrayContaining([['Foo', 11143]])],
          ['holiday', expect.arrayContaining([['a country', 35014]])],
          ['social', expect.arrayContaining([['Bar', 61923]])],
        ]),
      );
    });

    it('should return a description', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data.description).toMatchInlineSnapshot(`"2018"`);
    });

    it('should return a saved number', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data.saved).toMatchInlineSnapshot(`135318`);
    });

    it('should return timeline data', async () => {
      expect.assertions(3);
      const res = await setup();
      expect(res.body.data.timeline).toBeInstanceOf(Array);
      expect(res.body.data.timeline).toHaveLength(365);
      expect(res.body.data.timeline.slice(80, 90)).toMatchInlineSnapshot(`
        Array [
          Array [],
          Array [],
          Array [],
          Array [
            76402,
            113401,
            11143,
            35014,
            61923,
          ],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
        ]
      `);
    });

    describe('on leap years', () => {
      const setupLeapYear = moize(
        async (): Promise<Response> => {
          const res = await global.withAuth(
            global.agent.get(`/api/v4/data/analysis/year/category/2`),
          );

          return res;
        },
        {
          isPromise: true,
        },
      );

      it('should return data from the given year', async () => {
        expect.assertions(3);
        const res = await setupLeapYear();
        expect(res.body.data.description).toMatchInlineSnapshot(`"2016"`);
        expect(res.body.data.saved).toMatchInlineSnapshot(`0`);
        expect(res.body.data.cost).toMatchInlineSnapshot(`
          Array [
            Array [
              "bills",
              Array [],
            ],
            Array [
              "food",
              Array [],
            ],
            Array [
              "general",
              Array [],
            ],
            Array [
              "holiday",
              Array [],
            ],
            Array [
              "social",
              Array [],
            ],
          ]
        `);
      });

      it('should return 366 items in the timeline', async () => {
        expect.assertions(1);
        const res = await setupLeapYear();
        expect(res.body.data.timeline).toHaveLength(366);
      });
    });
  });

  describe('GET /data/analysis/month/shop/1', () => {
    const setup = moize(
      async (): Promise<Response> => {
        const res = await global.withAuth(global.agent.get(`/api/v4/data/analysis/month/shop/1`));

        return res;
      },
      {
        isPromise: true,
      },
    );

    it('should return cost data for the month', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data.cost).toStrictEqual(
        expect.arrayContaining([
          [
            'bills',
            expect.arrayContaining([
              ['Rent', 72500],
              ['Electricity', 3902],
            ]),
          ],
          [
            'food',
            expect.arrayContaining([
              ['Tesco', 19239],
              ['Morrisons', 91923],
            ]),
          ],
          [
            'general',
            expect.arrayContaining([
              ['Amazon', 1231],
              ['Hardware store', 9912],
            ]),
          ],
          [
            'holiday',
            expect.arrayContaining([
              ['Travel agents', 11023],
              ['Skyscanner', 23991],
            ]),
          ],
          ['social', expect.arrayContaining([['Some pub', 61923]])],
        ]),
      );
    });

    it('should return a description for the month', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data.description).toMatchInlineSnapshot(`"March 2018"`);
    });

    it('should return a saved number for the month', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data.saved).toMatchInlineSnapshot(`135318`);
    });

    it('should return timeline data', async () => {
      expect.assertions(3);
      const res = await setup();
      expect(res.body.data.timeline).toBeInstanceOf(Array);
      expect(res.body.data.timeline).toHaveLength(31); // 30 days in March
      expect(res.body.data.timeline).toMatchInlineSnapshot(`
        Array [
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [
            76402,
            113401,
            11143,
            35014,
            61923,
          ],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
          Array [],
        ]
      `);
    });
  });

  describe('GET /data/analysis/week/category/0', () => {
    const setup = moize(
      async (): Promise<Response> => {
        const res = await global.withAuth(
          global.agent.get(`/api/v4/data/analysis/week/category/0`),
        );

        return res;
      },
      {
        isPromise: true,
      },
    );

    it('should return cost data for the week', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data.cost).toMatchInlineSnapshot(`
        Array [
          Array [
            "bills",
            Array [],
          ],
          Array [
            "food",
            Array [],
          ],
          Array [
            "general",
            Array [],
          ],
          Array [
            "holiday",
            Array [],
          ],
          Array [
            "social",
            Array [],
          ],
        ]
      `);
    });

    it('should return a description for the week', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data.description).toMatchInlineSnapshot(`"Week beginning April 16, 2018"`);
    });

    it('should return a saved number for the week', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data.saved).toMatchInlineSnapshot(`0`);
    });

    it('should not return timeline data', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data.timeline).toBeNull();
    });
  });

  describe('GET /data/analysis/deep/food/month/category/1', () => {
    const setup = moize(
      async (): Promise<Response> => {
        const res = await global.withAuth(
          global.agent.get(`/api/v4/data/analysis/deep/food/month/category/1`),
        );

        return res;
      },
      {
        isPromise: true,
      },
    );

    it('should return grouped cost data for the category in the given period', async () => {
      expect.assertions(1);
      const res = await setup();
      expect(res.body.data).toStrictEqual(
        expect.objectContaining({
          items: expect.arrayContaining([
            [
              'Food',
              expect.arrayContaining([
                ['Breakfast', 19239],
                ['Lunch', 91923],
              ]),
            ],
            ['Snacks', expect.arrayContaining([['Nuts', 2239]])],
          ]),
        }),
      );
    });
  });
});
