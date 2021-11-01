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

export enum PensionTransactionOpts {
  OnlyPension = 'ONLY_PENSION',
  NotPension = 'NOT_PENSION',
  Both = 'BOTH',
}

function getPensionCondition(
  pensionTransactionOpts: PensionTransactionOpts,
): TaggedTemplateLiteralInvocationType | undefined {
  switch (pensionTransactionOpts) {
    case PensionTransactionOpts.NotPension:
      return sql`not ft.is_pension`;
    case PensionTransactionOpts.OnlyPension:
      return sql`ft.is_pension`;
    default:
      return undefined;
  }
}

const joinFundPrices = (
  uid: number,
  pensionTransactionOpts: PensionTransactionOpts = PensionTransactionOpts.NotPension,
): TaggedTemplateLiteralInvocationType => sql`
  from cache_at_date c 
  inner join fund_cache fc on fc.cid = c.cid
  inner join fund_scrape fs on fs.fid = fc.fid

  inner join funds f on f.uid = ${uid} and fs.item = f.item
  inner join funds_transactions ft on ${sql.join(
    [
      sql`ft.fund_id = f.id`,
      sql`ft.date <= c.time`,
      getPensionCondition(pensionTransactionOpts),
    ].filter((condition): condition is TaggedTemplateLiteralInvocationType => !!condition),
    sql` and `,
  )}

  left join funds_stock_splits fss on fss.fund_id = f.id
    and fss.date > ft.date
    and fss.date <= c.time
`;

const selectRebasedFundValues = (
  uid: number,
  pensionTransactionOpts: PensionTransactionOpts,
): TaggedTemplateLiteralInvocationType => sql`
  select ${sql.join(
    [
      sql`ft.fund_id`,
      sql`(fc.price * ft.units * exp(sum(ln(coalesce(fss.ratio, 1))))) as present_value_rebased`,
      sql`c.time`,
    ],
    sql`, `,
  )}
  ${joinFundPrices(uid, pensionTransactionOpts)}
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
      sql`funds_rebased as (${selectRebasedFundValues(uid, PensionTransactionOpts.NotPension)})`,
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
  pensionTransactionOpts: PensionTransactionOpts = PensionTransactionOpts.Both,
): Promise<number> {
  const result = await db.query<{ value: number }>(sql`
  WITH ${sql.join(
    [
      sql`cache_at_date as (${selectSingleDate(atDate)})`,
      sql`funds_rebased as (${selectRebasedFundValues(uid, pensionTransactionOpts)})`,
    ],
    sql`, `,
  )}

  select sum(present_value_rebased)::integer as value
  from funds_rebased
  `);
  return result.rows[0]?.value;
}

export type UnitsAndPricesRow = {
  name: string;
  units_rebased: number;
  scraped_price: number;
};

export async function selectUnitsWithPrice(
  db: DatabaseTransactionConnectionType,
  uid: number,
  now: Date,
): Promise<readonly UnitsAndPricesRow[]> {
  const { rows } = await db.query<UnitsAndPricesRow>(sql`
  with ${sql.join(
    [
      sql`cache_at_date as (${selectSingleDate(now)})`,
      sql`units_per_transaction as (
        select ${sql.join(
          [
            sql`f.item`,
            sql`sum(ft.units * exp(ln(coalesce(fss.ratio, 1)))) as units_rebased`,
            sql`fc.price as scraped_price`,
          ],
          sql`, `,
        )}
        ${joinFundPrices(uid, PensionTransactionOpts.Both)}
        group by f.item, ft.units, fc.price
      )`,
    ],
    sql`, `,
  )}

  select ${sql.join(
    [
      sql`item as name`,
      sql`sum(units_rebased) as units_rebased`,
      sql`max(scraped_price) as scraped_price`,
    ],
    sql`, `,
  )}
  from units_per_transaction
  group by item
  `);
  return rows;
}
