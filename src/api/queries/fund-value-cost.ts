import { subMonths } from 'date-fns';
import {
  sql,
  DatabaseTransactionConnectionType,
  TaggedTemplateLiteralInvocationType,
} from 'slonik';
import { getEndOfMonthUnion, toLocalISO } from './date-union';

const selectAllDatesInRange = (monthEnds: Date[]): TaggedTemplateLiteralInvocationType => sql`
  select b.cid, b.time
  from (
    select ${sql.join(
      [
        sql`fct.cid`,
        sql`fct.time`,
        sql`
        row_number() OVER (
          partition by date_part('year', fct.time) * 100 + date_part('month', fct.time)
          order by fct.time desc
        ) AS scrape_num_by_month
        `,
      ],
      sql`, `,
    )}
    from fund_cache_time fct
    where fct.time > ${toLocalISO(subMonths(monthEnds[0], 1))}
  ) b
  where b.scrape_num_by_month = 1
  order by b.time DESC
`;

const selectSingleDate = (date: Date): TaggedTemplateLiteralInvocationType => sql`
  select cid, time
  from fund_cache_time
  where time <= ${date.toISOString()}
  order by time desc
  limit 1
`;

const selectRebasedFundValues = (uid: number): TaggedTemplateLiteralInvocationType => sql`
  select ${sql.join(
    [
      sql`ft.fund_id`,
      sql`(fc.price * ft.units * exp(sum(ln(coalesce(fss.ratio, 1))))) as present_value_rebased`,
      sql`c.time`,
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

  group by ft.fund_id, ft.units, fc.price, c.time
`;

export async function getMonthlyTotalFundValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  monthEnds: Date[],
): Promise<number[]> {
  const results = await db.query<{ value: number | null }>(sql`
  with ${sql.join(
    [
      sql`dates as (${getEndOfMonthUnion(monthEnds)})`,
      sql`cache_at_date AS (${selectAllDatesInRange(monthEnds)})`,
      sql`funds_rebased as (${selectRebasedFundValues(uid)})`,
    ],
    sql`, `,
  )}

  select sum(coalesce(present_value_rebased, 0))::integer as value
  from dates
  left join funds_rebased on
    date_part('year', funds_rebased.time) = date_part('year', dates.month_date)
    and date_part('month', funds_rebased.time) = date_part('month', dates.month_date)
  group by dates.month_date
  order by dates.month_date
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
      sql`cache_at_date as (${selectSingleDate(atDate)})`,
      sql`funds_rebased as (${selectRebasedFundValues(uid)})`,
    ],
    sql`, `,
  )}

  select sum(present_value_rebased)::integer as value
  from funds_rebased
  `);
  return result.rows[0]?.value;
}
