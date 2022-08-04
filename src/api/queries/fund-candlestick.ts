import { formatISO } from 'date-fns';
import { DatabaseTransactionConnectionType, sql, SqlTokenType } from 'slonik';

export type CandleStickRow = {
  idx: number;
  t0: Date;
  t1: Date;
  min: number;
  max: number;
  start: number;
  end: number;
};

function ageInPeriodsCTE(
  resolutionNum: number,
  resolutionPeriod: string,
  minDate: string,
  time: SqlTokenType,
): SqlTokenType {
  const age = sql`age(${time}, ${minDate})`;

  switch (resolutionPeriod) {
    case 'month':
      return sql`floor((${sql.join(
        [sql`extract(month from ${age})`, sql`extract(year from ${age}) * 12`],
        sql` + `,
      )}) / ${resolutionNum})`;
    case 'week':
      return sql`floor((extract(epoch from ${age})) / 604800)`;
    default:
      throw new Error(`Unhandled resolution period ${resolutionPeriod}`);
  }
}

export async function selectCandlestickMaxAge(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<Date | null> {
  const { rows } = await db.query<{ min_time: Date | null }>(sql`
  select min(fct.time) as min_time
  from fund_cache_time fct
  inner join fund_cache fc on fc.cid = fct.cid
  inner join fund_scrape fs on fs.fid = fc.fid
  inner join funds f on f.uid = ${uid} and f.item = fs.item
  inner join funds_transactions ft on ft.fund_id = f.id and ft.date <= fct.time
  having count(ft.id) > 0
  `);
  return rows[0]?.min_time ?? null;
}

export async function selectCandlestickRows(
  db: DatabaseTransactionConnectionType,
  uid: number,
  minTime: Date,
  now: Date,
  resolutionNum: number,
  resolutionPeriod: string,
): Promise<readonly CandleStickRow[]> {
  const minDate = formatISO(minTime, { representation: 'date' });

  const { rows } = await db.query<CandleStickRow>(sql`
  with ${sql.join(
    [
      sql`total_values as (
        select ${sql.join(
          [
            sql`fct.time`,
            sql`${ageInPeriodsCTE(resolutionNum, resolutionPeriod, minDate, sql`fct.time`)} as idx`,
            sql`sum(ft.units_split_adj * fc.price_split_adj)::int as value`,
          ],
          sql`, `,
        )}
        from fund_cache_time fct
        inner join fund_cache fc on fc.cid = fct.cid
        inner join fund_scrape fs on fs.fid = fc.fid
        inner join funds f on f.uid = ${uid} and f.item = fs.item
        inner join funds_transactions ft on ft.fund_id = f.id and ft.date <= fct.time
        where fct.time >= ${minDate}
        group by fct.cid
      )`,
      sql`value_groups as (
        select ${sql.join(
          [
            sql`v.idx`,
            sql`row_number() over (partition by v.idx) as id`,
            sql`min(v.time) over (partition by v.idx) as t0`,
            sql`max(v.time) over (partition by v.idx) as t1`,
            sql`min(v.value) over (partition by v.idx) as min`,
            sql`max(v.value) over (partition by v.idx) as max`,
            sql`first_value(v.value) over (partition by v.idx order by v.time asc) as start`,
            sql`first_value(v.value) over (partition by v.idx order by v.time desc) as end`,
          ],
          sql`, `,
        )}
        from total_values v
      )`,
    ],
    sql`, `,
  )}
  select idx, t0, t1, "min", "max", "start", "end"
  from value_groups
  where id = 1
  `);
  return rows;
}
