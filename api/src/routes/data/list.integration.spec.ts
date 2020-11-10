import { format, addDays } from 'date-fns';
import MockDate from 'mockdate';
import { Response } from 'supertest';

import db from '~api/test-utils/knex';
import { Page } from '~api/types';

describe('Standard list routes', () => {
  beforeAll(() => {
    MockDate.set(new Date('2020-04-20'));
  });
  afterAll(() => {
    MockDate.reset();
  });

  const income = {
    date: '2020-04-20',
    item: 'Salary (my job)',
    cost: 328967, // bit of a misnomer for this route :)
  };
  const incomeDelta = { item: 'Different salary (changed jobs)' };

  const bill = {
    date: '2020-04-02',
    item: 'Rent',
    cost: 174910,
  };
  const billDelta = { item: 'Mortgage', cost: 155602 };

  const food = {
    date: '2020-04-10',
    item: 'Apples',
    category: 'Fruit',
    cost: 210,
    shop: 'Tesco',
  };
  const foodDelta = { item: 'Pears' };

  const general = {
    date: '2020-04-09',
    item: 'Pills',
    category: 'Medicine',
    cost: 799,
    shop: 'Boots',
  };
  const generalDelta = { item: 'Boots', category: 'Shoes' };

  const holiday = {
    date: '2020-05-23',
    item: 'Flight',
    category: 'Australia',
    cost: 156543,
    shop: 'skyscanner.com',
  };
  const holidayDelta = { item: 'Refund', category: 'Pandemic' };

  const social = {
    date: '2020-04-07',
    item: 'Pizza',
    category: 'Remote social',
    cost: 2945,
    shop: 'Dominoes',
  };
  const socialDelta = { item: 'Garlic bread' };

  describe.each`
    page            | lastPage | testItem   | delta           | readProps
    ${Page.income}  | ${3}     | ${income}  | ${incomeDelta}  | ${{}}
    ${Page.bills}   | ${3}     | ${bill}    | ${billDelta}    | ${{}}
    ${Page.food}    | ${4}     | ${food}    | ${foodDelta}    | ${{ k: 'Fruit', s: 'Tesco' }}
    ${Page.general} | ${3}     | ${general} | ${generalDelta} | ${{ k: 'Medicine', s: 'Boots' }}
    ${Page.holiday} | ${3}     | ${holiday} | ${holidayDelta} | ${{ k: 'Australia', s: 'skyscanner.com' }}
    ${Page.social}  | ${3}     | ${social}  | ${socialDelta}  | ${{ k: 'Remote social', s: 'Dominoes' }}
  `('$page route', ({ page, lastPage, testItem, delta, readProps }) => {
    const clearDb = async (): Promise<void> => {
      await db(page).where({ item: testItem.item }).del();
      await db(page).where({ item: delta.item }).del();
    };

    beforeEach(clearDb);

    describe(`POST /${page}`, () => {
      const setup = async (): Promise<Response> => {
        const res = await global.withAuth(global.agent.post(`/api/v4/data/${page}`)).send(testItem);
        return res;
      };

      it('should respond with a 201 status', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res.status).toBe(201);
      });

      it('should respond with the inserted ID', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            id: expect.any(Number),
          }),
        );
      });

      it('should respond with the total cost', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            total: expect.any(Number),
          }),
        );
      });

      it('should respond with the weekly cost', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res.body).toStrictEqual(
          expect.objectContaining({
            weekly: expect.any(Number),
          }),
        );
      });

      it('should respond with the item on subsequent get requests', async () => {
        expect.assertions(1);
        const res = await setup();

        const resAfter = await global.withAuth(global.agent.get(`/api/v4/data/${page}`));

        expect(resAfter.body.data.data).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              I: res.body.id,
            }),
          ]),
        );
      });
    });

    describe(`GET /${page}/:page?`, () => {
      const setup = async (data: object = testItem): Promise<Response> => {
        await global.withAuth(global.agent.post(`/api/v4/data/${page}`)).send(data);
        const res = await global.withAuth(global.agent.get(`/api/v4/data/${page}`));
        return res;
      };

      it(`should get a list of ${page} data`, async () => {
        expect.assertions(2);
        const res = await setup();

        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({
          data: expect.objectContaining({
            total: expect.any(Number),
            weekly: expect.any(Number),
            olderExists: expect.any(Boolean),
            data: expect.arrayContaining([
              expect.objectContaining({
                I: expect.any(Number), // ID
                d: testItem.date,
                i: testItem.item,
                c: testItem.cost,
                ...readProps,
              }),
            ]),
          }),
        });
      });

      describe('pagination', () => {
        const baseDate = new Date('2020-04-20');

        const setupForPagination = async (): Promise<void> => {
          await Array(10)
            .fill(0)
            .reduce<Promise<void>>(
              (last, _, index) =>
                last.then(
                  async (): Promise<void> => {
                    await global.withAuth(global.agent.post(`/api/v4/data/${page}`)).send({
                      ...testItem,
                      date: format(addDays(baseDate, -index), 'yyyy-MM-dd'),
                    });
                  },
                ),
              Promise.resolve(),
            );
        };

        it('should apply an optional limit', async () => {
          expect.assertions(2);
          await setupForPagination();
          const resPage0Limit3 = await global.withAuth(
            global.agent.get(`/api/v4/data/${page}/0?limit=3`),
          );

          expect(resPage0Limit3.body.data.data).toHaveLength(3);
          expect(resPage0Limit3.body.data.olderExists).toBe(true);
        });

        it('should apply an optional page number', async () => {
          expect.assertions(1);
          await setupForPagination();
          const resPage1Limit3 = await global.withAuth(
            global.agent.get(`/api/v4/data/${page}/1?limit=3`),
          );

          expect(resPage1Limit3.body.data.data).toStrictEqual([
            expect.objectContaining({
              d: '2020-04-17',
            }),
            expect.objectContaining({
              d: '2020-04-16',
            }),
            expect.objectContaining({
              d: '2020-04-15',
            }),
          ]);
        });

        it('should set olderExists to false on the last page', async () => {
          expect.assertions(2);
          await setupForPagination();
          const resPageNextFromLast = await global.withAuth(
            global.agent.get(`/api/v4/data/${page}/${lastPage - 1}?limit=3`),
          );
          const resPageLast = await global.withAuth(
            global.agent.get(`/api/v4/data/${page}/${lastPage}?limit=3`),
          );

          expect(resPageNextFromLast.body.data.olderExists).toBe(true);
          expect(resPageLast.body.data.olderExists).toBe(false);
        });
      });
    });

    describe(`PUT /${page}`, () => {
      const modifiedItem = {
        ...testItem,
        ...delta,
      };

      const setup = async (data: object = modifiedItem): Promise<Response> => {
        const resPost = await global
          .withAuth(global.agent.post(`/api/v4/data/${page}`))
          .send(testItem);
        const res = await global.withAuth(
          global.agent.put(`/api/v4/data/${page}`).send({
            id: resPost.body.id,
            ...data,
          }),
        );
        return res;
      };

      it('should respond with a 200 status code', async () => {
        expect.assertions(1);
        const res = await setup();
        expect(res.status).toBe(200);
      });

      it('should respond with the updated total', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            total: expect.any(Number),
          }),
        );
      });

      it('should respond with the updated weekly cost', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            weekly: expect.any(Number),
          }),
        );
      });

      it('should respond with the updated item on subsequent get requests', async () => {
        expect.assertions(1);
        await setup();

        const resAfter = await global.withAuth(global.agent.get(`/api/v4/data/${page}`));

        expect(resAfter.body.data.data).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              d: modifiedItem.date,
              i: modifiedItem.item,
              c: modifiedItem.cost,
            }),
          ]),
        );
      });
    });

    describe(`DELETE /${page}`, () => {
      const setup = async (): Promise<Response> => {
        const resPost = await global
          .withAuth(global.agent.post(`/api/v4/data/${page}`))
          .send(testItem);
        const res = await global.withAuth(
          global.agent.delete(`/api/v4/data/${page}`).send({
            id: resPost.body.id,
          }),
        );
        return res;
      };

      it('should respond with a successful status code', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.status).toBe(200);
      });

      it('should respond with the updated total cost', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            total: expect.any(Number),
          }),
        );
      });

      it('should respond with the updated weekly cost', async () => {
        expect.assertions(1);
        const res = await setup();

        expect(res.body).toStrictEqual(
          expect.objectContaining({
            weekly: expect.any(Number),
          }),
        );
      });

      it('should not respond with the item on subsequent get requests', async () => {
        expect.assertions(1);
        await setup();

        const resAfter = await global.withAuth(global.agent.get(`/api/v4/data/${page}`));

        expect(resAfter.body.data.data).not.toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              date: testItem.date,
              item: testItem.item,
              cost: testItem.cost,
            }),
          ]),
        );
      });
    });
  });
});
