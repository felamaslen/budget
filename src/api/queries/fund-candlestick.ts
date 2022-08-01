import { formatISO } from 'date-fns';
import { DatabaseTransactionConnectionType, sql } from 'slonik';

export type CandleStickRow = {
  id: number;
  t0: Date;
  t1: Date;
  fund_id: number;
  hi: number;
  lo: number;
  p0: number;
  p1: number;
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
          [
            sql`d0.idx as id`,
            sql`d0.date as t0`,
            sql`coalesce(d1.date, now()) as t1`,
            sql`fct.cid`,
            sql`fct.time`,
          ],
          sql`, `,
        )}
      from dates_idx d0
      left join dates_idx d1 on d1.idx = d0.idx + 1
      inner join fund_cache_time fct on fct.time >= d0.date and fct.time < coalesce(d1.date, now())
      order by fct.time
    )`,
      sql`prices as (
      select ${sql.join(
        [
          sql`d.id`,
          sql`d.t0`,
          sql`d.t1`,
          sql`f.id as fund_id`,
          sql`row_number() over (partition by d.id, f.id) as idx`,
          sql`max(fc.price) over (partition by d.id, f.id) as hi`,
          sql`min(fc.price) over (partition by d.id, f.id) as lo`,
          sql`first_value(fc.price) over (partition by d.id, f.id order by d.time asc) as p0`,
          sql`first_value(fc.price) over (partition by d.id, f.id order by d.time desc) as p1`,
        ],
        sql`, `,
      )}
      from date_groups d
      inner join fund_cache fc on fc.cid = d.cid
      inner join fund_scrape fs on fs.fid = fc.fid
      inner join funds f on f.uid = 1 and f.item = fs.item
    )`,
    ],
    sql`, `,
  )}
  select id, t0, t1, fund_id, hi, lo, p0, p1
  from prices
  where idx = 1
  order by id, fund_id
  `);
  return rows;
}
