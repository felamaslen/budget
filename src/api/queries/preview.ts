import { format } from 'date-fns';
import { sql, DatabaseTransactionConnectionType } from 'slonik';

import { getDateRangeUnion } from './date-union';

import config from '~api/config';
import { PageListStandard } from '~api/types';

export type PreviewRow = {
  date: string;
  value: number;
};

export async function selectPreviewRowsStandard(
  db: DatabaseTransactionConnectionType,
  uid: number,
  page: PageListStandard,
  startDate: Date,
  endDate: Date,
): Promise<readonly PreviewRow[]> {
  const result = await db.query<PreviewRow>(sql`
  SELECT date, SUM(cost) AS value
  FROM list_standard
  WHERE ${sql.join(
    [
      sql`uid = ${uid}`,
      sql`page = ${page}`,
      sql`date >= ${format(startDate, 'yyyy-MM-dd')}`,
      sql`date <= ${format(endDate, 'yyyy-MM-dd')}`,
    ],
    sql` AND `,
  )}
  ${
    page === PageListStandard.General
      ? sql`AND category != ALL(${sql.array(
          config.data.overview.investmentPurchaseCategories,
          'text',
        )})`
      : sql``
  }
  GROUP BY date
  ORDER BY date
  `);
  return result.rows;
}

export async function selectPreviewRowsStocks(
  db: DatabaseTransactionConnectionType,
  uid: number,
  monthDays: Date[],
): Promise<readonly PreviewRow[]> {
  const result = await db.query<PreviewRow>(sql`
  WITH dates AS (${getDateRangeUnion(monthDays)})
  SELECT d.date, SUM(d.value)::integer AS value
  FROM (
    SELECT c.date, SUM(ft.units * fc.price)::integer AS value
    FROM (
      SELECT b.cid, b.date
      FROM (
        SELECT ${sql.join(
          [
            sql`fct.cid`,
            sql`dates.start_date AS date`,
            sql`
            row_number() OVER (
              PARTITION BY dates.start_date
              ORDER BY fct.time DESC
            ) AS scrape_num_by_day
            `,
          ],
          sql`, `,
        )}
        FROM dates
        INNER JOIN (
          SELECT cid, time
          FROM fund_cache_time fct
        ) fct ON fct.time::date <= dates.start_date
      ) b
      WHERE b.scrape_num_by_day = 1
      ORDER BY b.date DESC
    ) c
    INNER JOIN fund_cache fc on fc.cid = c.cid
    INNER JOIN fund_scrape fs on fs.fid = fc.fid

    INNER JOIN funds f on ${sql.join([sql`f.uid = ${uid}`, sql`fs.item = f.item`], sql` AND `)}
    INNER JOIN funds_transactions ft on ${sql.join(
      [sql`ft.fund_id = f.id`, sql`ft.date <= c.date`],
      sql` AND `,
    )}
    GROUP BY c.date, f.id, fs.fid
  ) d
  GROUP BY d.date
  `);
  return result.rows;
}
