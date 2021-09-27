import { sql } from 'slonik';

import { selectSinglePageListSummary } from './list-cost-summary';

import { seedData, seedUser } from '~api/__tests__/fixtures';
import { getPool, withSlonik } from '~api/modules/db';
import { PageListStandard } from '~api/types';

describe('List cost summary queries', () => {
  // Most of these are covered by resolver integration tests
  let uid: number;
  beforeAll(async () => {
    uid = await seedUser();
    await seedData(uid);
  });

  afterAll(
    withSlonik(async (db) => {
      await db.query(sql`DELETE FROM users WHERE uid = ${uid}`);
    }),
  );

  describe(selectSinglePageListSummary.name, () => {
    const dates: Date[] = [new Date('2018-03-31'), new Date('2018-04-30')];
    it('should get a list (ordered by date) of values from a given page', async () => {
      expect.assertions(1);
      const db = getPool();
      const result = await selectSinglePageListSummary(db, uid, dates, PageListStandard.General);
      expect(result).toMatchInlineSnapshot(`
        Array [
          11143,
          0,
        ]
      `);
    });

    it('should remove income deductions from income values', async () => {
      expect.assertions(1);
      const db = getPool();
      const result = await selectSinglePageListSummary(db, uid, dates, PageListStandard.Income);
      expect(result[0]).toBe(433201 - (39765 + 10520));
    });
  });
});
