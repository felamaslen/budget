import { formatISO } from 'date-fns';
import { DatabaseTransactionConnectionType, sql } from 'slonik';

export type CandleStickRow = {
  id: number;
  t0: Date;
  t1: Date;
  max: number;
  min: number;
  start: number;
  end: number;
};

export async function selectCandlestickRows(
  db: DatabaseTransactionConnectionType,
  uid: number,
  minTime: Date,
  now: Date,
  resolutionNum: number,
  resolutionPeriod: string,
): Promise<readonly CandleStickRow[]> {
  const { rows } = await db.query<CandleStickRow>(sql`
  with ${sql.join(
    [
      sql`dates as (
        select generate_series(
          (${formatISO(minTime, { representation: 'date' })})::timestamptz,
          now()::timestamptz,
          (${`'${resolutionNum} ${resolutionPeriod}'`})::interval
        ) as date
      )`,
      sql`dates_idx as (
        select d.date, row_number() over() as idx
        from dates d
      )`,
      sql`date_groups as (
        select ${sql.join(
          [sql`d0.idx as id`, sql`d0.date as t0`, sql`coalesce(d1.date, now()) as t1`],
          sql`, `,
        )}
        from dates_idx d0
        left join dates_idx d1 on d1.idx = d0.idx + 1
      )`,
      sql`total_values as (
        select ${sql.join(
          [sql`d.id`, sql`d.t0`, sql`d.t1`, sql`fct.time`, sql`sum(ft.units * fc.price) as value`],
          sql`, `,
        )}
        from date_groups d
        inner join fund_cache_time fct on fct.time >= d.t0 and fct.time < d.t1
        inner join fund_cache fc on fc.cid = fct.cid
        inner join fund_scrape fs on fs.fid = fc.fid
        inner join funds f on f.uid = ${uid} and f.item = fs.item
        inner join funds_transactions ft on ft.fund_id = f.id and ft.date <= fct.time
        group by d.id, d.t0, d.t1, fct.cid
        order by d.id desc, fct.cid
      )`,
      sql`value_groups as (
        select ${sql.join(
          [
            sql`v.id`,
            sql`v.t0`,
            sql`v.t1`,
            sql`row_number() over (partition by v.id) as idx`,
            sql`max(v.value) over (partition by v.id) as max`,
            sql`min(v.value) over (partition by v.id) as min`,
            sql`first_value(v.value) over (partition by v.id order by v.time asc) as start`,
            sql`first_value(v.value) over (partition by v.id order by v.time desc) as end`,
          ],
          sql`, `,
        )}
        from total_values v
      )`,
    ],
    sql`, `,
  )}
  select id, t0, t1, "max", "min", "start", "end" from value_groups where idx = 1
  `);
  return rows;
}
