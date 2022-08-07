import { formatISO } from 'date-fns';
import { DatabaseTransactionConnectionType, sql, SqlTokenType } from 'slonik';

export type CandlestickRow = {
  id: number;
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
      return sql`floor((extract(epoch from ${age})) / 604800 / ${resolutionNum})`;
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
): Promise<readonly CandlestickRow[]> {
  const minDate = formatISO(minTime, { representation: 'date' });
  const interval = sql`(${`'${resolutionNum} ${resolutionPeriod}'`})::interval`;

  const { rows } = await db.query<CandlestickRow>(sql`
  with ${sql.join(
    [
      sql`dates as (
        select generate_series(${minDate}, now(), ${interval}) as date
      )`,
      sql`dates_idx as (select date, row_number() over() as id from dates)`,
      sql`date_groups as (
        select d0.id, d0.date as t0, coalesce(d1.date, d0.date + ${interval}) as t1
        from dates_idx d0
        left join dates_idx d1 on d1.id = d0.id + 1
      )`,
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
            sql`d.id`,
            sql`d.t0`,
            sql`d.t1`,
            sql`row_number() over (partition by d.id) as idx`,
            sql`min(v.value) over (partition by d.id) as min`,
            sql`max(v.value) over (partition by d.id) as max`,
            sql`first_value(v.value) over (partition by d.id order by v.time asc) as start`,
            sql`first_value(v.value) over (partition by d.id order by v.time desc) as end`,
          ],
          sql`, `,
        )}
        from date_groups d
        inner join total_values v on v.time >= d.t0 and v.time <= d.t1
      )`,
    ],
    sql`, `,
  )}
  select id, t0, t1, "min", "max", "start", "end"
  from value_groups v
  where idx = 1
  `);
  return rows;
}
