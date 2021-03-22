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
  atDate: Date,
): Promise<number> {
  const result = await db.query<{ value: number }>(sql`
  WITH ${sql.join(
    [
      sql`
      cache_at_date as (
        select b.cid, b.time
        from (
          select
            fct.cid
            ,fct.time
            ,row_number() over (order by fct.time desc) as scrape_num
          from fund_cache_time fct
          where fct.time <= ${atDate.toISOString()}
        ) b 
        where b.scrape_num = 1 
      )`,

      sql`
      funds_rebased as (
        select ${sql.join(
          [
            sql`ft.fund_id`,
            sql`(fc.price * ft.units * exp(sum(ln(coalesce(fss.ratio, 1))))) as present_value_rebased`,
          ],
          sql`, `,
        )}

        from cache_at_date c 
        inner join fund_cache fc on fc.cid = c.cid
        inner join fund_scrape fs on fs.fid = fc.fid

        inner join funds f on f.uid = ${uid} and fs.item = f.item
        inner join funds_transactions ft on ft.fund_id = f.id and ft.date <= c.time

        left join funds_stock_splits fss on fss.fund_id = f.id
          and fss.date > ft.date
          and fss.date <= c.time

        group by ft.fund_id, ft.units, fc.price
      )`,
    ],
    sql`, `,
  )}

  select sum(present_value_rebased) as value
  from funds_rebased
  `);
  return result.rows[0]?.value;
}
