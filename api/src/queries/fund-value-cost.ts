import { sql, DatabaseTransactionConnectionType } from 'slonik';
import { getEndOfMonthUnion } from './date-union';

export async function getMonthlyTotalFundValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  monthEnds: Date[],
): Promise<number[]> {
  const results = await db.query<{ value: number | null }>(sql`
  SELECT scraped_values.value
  FROM (
    ${getEndOfMonthUnion(monthEnds)}
  ) dates
  LEFT JOIN (
    SELECT
      d.time
      ,SUM(d.value)::integer AS value
    FROM (
      SELECT ${sql.join([sql`c.time`, sql`SUM(ft.units * fc.price)::integer AS value`], sql`, `)}
      FROM (
        SELECT b.cid, b.time
        FROM (
          SELECT ${sql.join(
            [
              sql`fct.cid`,
              sql`fct.time`,
              sql`row_number() OVER (PARTITION BY
              date_part('year', fct.time) * 100 + date_part('month', fct.time)
            ORDER BY fct.time DESC) AS scrape_num_by_month`,
            ],
            sql`, `,
          )}
          FROM fund_cache_time fct
        ) b
        WHERE b.scrape_num_by_month = 1
        ORDER BY b.time DESC
      ) c
      INNER JOIN fund_cache fc on fc.cid = c.cid
      INNER JOIN fund_scrape fs on fs.fid = fc.fid

      INNER JOIN funds f on ${sql.join([sql`f.uid = ${uid}`, sql`fs.item = f.item`], sql` AND `)}
      INNER JOIN funds_transactions ft on ${sql.join(
        [sql`ft.fund_id = f.id`, sql`ft.date <= c.time`],
        sql` AND `,
      )}
      GROUP BY c.time, f.id, fs.fid
    ) d
    GROUP BY d.time
  ) scraped_values ON ${sql.join(
    [
      sql`date_part('year', scraped_values.time) = date_part('year', dates.month_date)`,
      sql`date_part('month', scraped_values.time) = date_part('month', dates.month_date)`,
    ],
    sql` AND `,
  )}
  ORDER BY dates.month_date
  `);

  return results.rows.reduce<number[]>(
    (last, { value }) => [...last, value ?? last[last.length - 1] ?? 0],
    [],
  );
}

export async function getTotalFundValue(
  db: DatabaseTransactionConnectionType,
  uid: number,
  now: Date,
): Promise<number> {
  const result = await db.query<{ value: number }>(sql`
  SELECT COALESCE(SUM(COALESCE(ft.units * fc.price, 0)), 0)::integer AS value
  FROM (
    SELECT b.cid, b.time
    FROM (
      SELECT ${sql.join(
        [sql`fct.cid`, sql`fct.time`, sql`row_number() OVER(ORDER BY fct.time DESC) AS scrape_num`],
        sql`, `,
      )}
      FROM fund_cache_time fct
      WHERE fct.time <= ${now.toISOString()}
    ) b
    WHERE b.scrape_num = 1
  ) c
  INNER JOIN fund_cache fc on fc.cid = c.cid
  INNER JOIN fund_scrape fs on fs.fid = fc.fid

  INNER JOIN funds f on ${sql.join([sql`f.uid = ${uid}`, sql`fs.item = f.item`], sql` AND `)}
  INNER JOIN funds_transactions ft on ${sql.join(
    [sql`ft.fund_id = f.id`, sql`ft.date <= c.time`],
    sql` AND `,
  )}
  `);
  return result.rows[0]?.value;
}

export async function getTotalFundCost(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<number> {
  const {
    rows: [{ total }],
  } = await db.query(sql`
  SELECT SUM(cost) AS total
  FROM funds f
  INNER JOIN funds_transactions ft ON ft.fund_id = f.id
  WHERE uid = ${uid}
  `);
  return total;
}
