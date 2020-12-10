import { sql, DatabaseTransactionConnectionType } from 'slonik';
import { getMonthRangeUnion } from './date-union';
import config from '~api/config';
import { PageListStandard } from '~api/types';

export async function getListCostSummary(
  db: DatabaseTransactionConnectionType,
  uid: number,
  monthEnds: Date[],
  category: PageListStandard,
): Promise<number[]> {
  const results = await db.query<{
    month_cost: number;
  }>(sql`
  SELECT COALESCE(SUM(cost), 0) AS month_cost
  FROM (${getMonthRangeUnion(monthEnds)}) dates
  LEFT JOIN ${sql.identifier([category])} AS list_data ON ${sql.join(
    [
      sql`list_data.uid = ${uid}`,
      sql`list_data.date >= dates.start_date`,
      sql`list_data.date <= dates.end_date`,
    ],
    sql` AND `,
  )}
    ${
      category === PageListStandard.General
        ? sql`AND list_data.category NOT IN (${sql.join(
            config.data.overview.ignoreExpenseCategories,
            sql`, `,
          )})`
        : sql``
    }
  GROUP BY dates.start_date
  ORDER BY dates.start_date
  `);

  return results.rows.map(({ month_cost }) => month_cost);
}
