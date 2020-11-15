import { format } from 'date-fns';
import { sql, DatabaseTransactionConnectionType } from 'slonik';

import config from '~api/config';
import { ListCalcCategory, Page } from '~api/types';

export type PreviewRow = {
  date: string;
  value: number;
};

export async function getPreviewRows(
  db: DatabaseTransactionConnectionType,
  uid: number,
  table: ListCalcCategory,
  startDate: Date,
  endDate: Date,
): Promise<readonly PreviewRow[]> {
  const result = await db.query<PreviewRow>(sql`
  SELECT date, SUM(cost) AS value
  FROM ${sql.identifier([table])}
  WHERE ${sql.join(
    [
      sql`uid = ${uid}`,
      sql`date >= ${format(startDate, 'yyyy-MM-dd')}`,
      sql`date <= ${format(endDate, 'yyyy-MM-dd')}`,
    ],
    sql` AND `,
  )}
  ${
    table === Page.general
      ? sql`AND category NOT IN (${sql.join(
          config.data.overview.ignoreExpenseCategories,
          sql`, `,
        )})`
      : sql``
  }
  GROUP BY date
  ORDER BY date
  `);

  return result.rows;
}
