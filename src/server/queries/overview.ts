import { sql, DatabasePoolConnectionType } from 'slonik';
import startOfMonth from 'date-fns/startOfMonth';
import format from 'date-fns/format';
import addMonths from 'date-fns/addMonths';
import isSameMonth from 'date-fns/isSameMonth';

import { withDb } from '~/server/modules/db';
import config from '~/server/config';

export interface FundValue {
  month?: Date;
  value: number;
  cost: number;
}

export interface MonthCost {
  income: number[];
  bills: number[];
  food: number[];
  general: number[];
  holiday: number[];
  social: number[];
}

export interface Overview extends MonthCost {
  startDate: string;
  pastMonths: number;
  funds: FundValue[];
}

const monthCostCategories = ['income', 'bills', 'food', 'general', 'social', 'holiday'];

const getMonthsToFill = (pastMonths: number, viewStartDate: Date): Date[] =>
  new Array(pastMonths).fill(0).map((item, index) => addMonths(viewStartDate, index));

const fillMonthValues = (
  monthsToFill: Date[],
  rows: readonly { month: string; value: number }[],
): number[] =>
  monthsToFill.map(date => {
    const row = rows.find(({ month }) => isSameMonth(new Date(month), date));
    if (!row) {
      return 0;
    }

    return row.value;
  });

async function getMonthlyTotalFundValues(
  db: DatabasePoolConnectionType,
  userId: string,
): Promise<FundValue[]> {
  const { rows } = await db.query<FundValue>(sql`
select
  fund_units.month
  ,sum(fund_units.sum_units * fc.price) as value
  ,sum(fund_units.sum_cost) as cost
from (
  select *
  from (
    select
      dates.cid
      ,dates.month
      ,f.id
      ,f.item
      ,transactions.sum_units
      ,transactions.sum_cost
      ,row_number() over (
        partition by dates.month, f.id
        order by transactions.month desc
      ) as row_number
    from (
      select
        s.cid
        ,(s.month + interval '1 month' - interval '1 day')::date as month
      from (
        select
          r.*
          ,row_number() over (partition by r.month order by r.time desc) as row_num
        from (
          select
            cid
            ,time
            ,date_trunc('month', time)::date as month
          from fund_cache_time fct
          where fct.done
        ) r
      ) s
      where s.row_num = 1
    ) dates
    cross join funds f

    inner join (
      select
        fund_id
        ,month
        ,sum_units
        ,sum_cost
      from (
        select
          fund_id
          ,"date"
          ,month
          ,units
          ,sum(units) over (
            partition by fund_id
            order by "date" asc
            rows between unbounded preceding and current row
          ) as sum_units
          ,sum(cost) over (
            partition by fund_id
            order by "date" asc
            rows between unbounded preceding and current row
          ) as sum_cost
          ,row_number() over (
            partition by fund_id, month
            order by "date" desc
          ) as row_num
        from (
          select
            fund_id
            ,"date"
            ,units
            ,cost
            ,date_trunc('month', "date")::date as month
          from funds_transactions ft
        ) r
      ) s
      where s.row_num = 1
    ) transactions
    on transactions.fund_id = f.id
      and transactions.month <= dates.month

    where f.uid = ${userId}
  ) t
  where t.row_number = 1
) fund_units
inner join funds on funds.id = fund_units.id
inner join fund_hash fh on fh.hash = md5(funds.item || ${config.funds.salt})
inner join fund_cache fc on fc.fid = fh.fid and fc.cid = fund_units.cid
group by fund_units.month
order by fund_units.month
  `);

  return rows.map(({ value, cost }) => ({ value, cost }));
}

async function getMonthlyCostValues(
  db: DatabasePoolConnectionType,
  userId: string,
  pastMonths: number,
  viewStartDate: Date,
): Promise<MonthCost> {
  const results = await Promise.all(
    monthCostCategories.map(category =>
      db.query<{ month: string; value: number }>(sql`
select
  month
  ,sum(cost) as value
from (
  select
    cost
    ,date_trunc('month', "date")::date as month
  from ${sql.identifier([category])}
  where ${sql.join(
    [
      sql`${sql.identifier([category, 'uid'])} = ${userId}`,
      sql`${sql.identifier([category, 'date'])} >= to_date(${format(
        viewStartDate,
        'yyyy-MM-dd',
      )}, 'YYYY-MM-DD')`,
    ],
    sql` AND `,
  )}
) r
group by month
order by month
  `),
    ),
  );

  const monthsToFill = getMonthsToFill(pastMonths, viewStartDate);

  return results.reduce(
    (last, { rows }, index) => ({
      ...last,
      [monthCostCategories[index]]: fillMonthValues(monthsToFill, rows),
    }),
    {
      income: [],
      bills: [],
      food: [],
      general: [],
      holiday: [],
      social: [],
    },
  );
}

export const getOverview = withDb<Overview>(
  async (db: DatabasePoolConnectionType, userId: string) => {
    const { startDate, pastMonths } = config.overview;

    const viewStartDate = startOfMonth(addMonths(new Date(), -pastMonths));

    const [funds, cost] = await Promise.all([
      getMonthlyTotalFundValues(db, userId),
      getMonthlyCostValues(db, userId, pastMonths, viewStartDate),
    ]);

    return {
      startDate,
      pastMonths,
      funds,
      ...cost,
    };
  },
);
