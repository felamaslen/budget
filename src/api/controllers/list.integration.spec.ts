import { DatabaseTransactionConnectionType, sql } from 'slonik';

import { getPublishedProperties } from './list';

import { getPool } from '~api/modules/db';
import { PageListStandard } from '~api/types';

describe('List controller (integration)', () => {
  let uid: number;
  beforeAll(async () => {
    const {
      rows: [user],
    } = await getPool().query<{ uid: number }>(
      sql`INSERT INTO users (name, pin_hash) VALUES (${`test_user_${Math.floor(
        Math.random() * 100000,
      )}`}, '123') RETURNING uid`,
    );
    uid = user.uid;
  });

  afterAll(async () => {
    await getPool().query(sql`DELETE FROM users WHERE uid = ${uid}`);
  });

  const bill = {
    date: '2020-04-02',
    item: 'Rent',
    cost: 174910,
    category: 'Housing',
    shop: 'My landlord',
  };

  const food = {
    date: '2020-04-10',
    item: 'Apples',
    category: 'Fruit',
    cost: 210,
    shop: 'Tesco',
  };

  describe(getPublishedProperties.name, () => {
    describe.each`
      page                      | testItem
      ${PageListStandard.Bills} | ${bill}
      ${PageListStandard.Food}  | ${food}
    `('for the $page page', ({ page, testItem }) => {
      describe('totals', () => {
        const setupTotals = async (db: DatabaseTransactionConnectionType): Promise<void> => {
          await db.query(sql`
          INSERT INTO list_standard (page, uid, date, item, category, value, shop)
          VALUES (${page}, ${uid}, ${testItem.date}, ${testItem.item}, ${
            testItem.category
          }, ${124356}, ${testItem.shop})
          `);
        };

        it('should return the total cost', async () => {
          expect.assertions(2);

          await getPool().transaction(async (db) => {
            const publishedPropertiesBefore = await getPublishedProperties(db, uid, page);

            expect(publishedPropertiesBefore).toStrictEqual(
              expect.objectContaining({
                total: 0,
              }),
            );

            await setupTotals(db);

            const publishedPropertiesAfter = await getPublishedProperties(db, uid, page);

            expect(publishedPropertiesAfter).toStrictEqual(
              expect.objectContaining({
                total: publishedPropertiesBefore.total + 124356,
              }),
            );
          });
        });

        it('should return the weekly cost', async () => {
          expect.assertions(2);

          await getPool().transaction(async (db) => {
            await setupTotals(db);
            const publishedProperties = await getPublishedProperties(db, uid, page);

            expect(publishedProperties).toStrictEqual(
              expect.objectContaining({
                weekly: expect.any(Number),
              }),
            );

            expect(publishedProperties.weekly).toBeGreaterThan(0);
          });
        });
      });
    });
  });
});
