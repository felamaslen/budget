import { sql, DatabasePoolConnectionType } from 'slonik';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import addMonths from 'date-fns/addMonths';
import isSameMonth from 'date-fns/isSameMonth';
import differenceInMonths from 'date-fns/differenceInMonths';

import config from '~/server/config';
import { FundValue, MonthCost, Overview } from '~/types/overview';

const monthCostCategories = ['income', 'bills', 'food', 'general', 'social', 'holiday'];

export const getViewStartDate = (now: Date = new Date()): Date => {
  return endOfMonth(addMonths(now, -config.overview.pastMonths));
};

const fillMonths = (startDate: Date, numValues: number): Date[] =>
  new Array(numValues).fill(0).map((item, index) => addMonths(startDate, index));

const getMonthsToFill = (now: Date, extendPast = false, extendFuture = false): Date[] => {
  const startDate = extendPast ? config.overview.startDate : getViewStartDate(now);
  const numValues =
    (extendFuture ? config.overview.futureMonths : 0) +
    (extendPast ? differenceInMonths(now, startDate) : config.overview.pastMonths);

  return fillMonths(startDate, numValues);
};

function fillMonthValues<T = number>({
  now,
  rows,
  defaultValue,
  duplicateMissing = false,
  extendPast = false,
  extendFuture = false,
}: {
  now: Date;
  rows: readonly { month: string; value: T }[];
  defaultValue: T;
  duplicateMissing?: boolean;
  extendPast?: boolean;
  extendFuture?: boolean;
}): T[] {
  return getMonthsToFill(now, extendPast, extendFuture).reduce((last: T[], date, index) => {
    const row = rows.find(({ month }) => isSameMonth(new Date(month), date));
    if (!row) {
      if (duplicateMissing && index > 0) {
        return [...last, last[last.length - 1]];
      }

      return [...last, defaultValue];
    }

    return [...last, row.value];
  }, []);
}

async function getMonthlyTotalFundValues(
  db: DatabasePoolConnectionType,
  now: Date,
  userId: string,
): Promise<FundValue[]> {
  const { rows } = await db.query<FundValue<string>>(sql`
select
  fund_units.month
  ,round(sum(fund_units.sum_units * fc.price)) as value
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

  const items: readonly {
    month: string;
    value: FundValue;
  }[] = rows.map(({ month = '', value, cost }) => ({ month, value: { value, cost } }));

  return fillMonthValues<FundValue>({
    now,
    rows: items,
    defaultValue: { value: 0, cost: 0 },
    duplicateMissing: true,
    extendPast: true,
  });
}

async function getMonthlyNetWorthValues(
  db: DatabasePoolConnectionType,
  now: Date,
  userId: string,
): Promise<number[]> {
  const { rows } = await db.query<{
    month: string;
    value: number;
  }>(sql`
  select
    net_worth.month
    ,round(sum(coalesce(nwv.value, 0) + (coalesce(fxv.value, 0) * coalesce(fx.rate, 0) * 100))) as value
  from (
    select
      id
      ,date_trunc('month', "date")::date as month
    from net_worth
    where ${sql.join(
      [
        sql`net_worth.uid = ${userId}`,
        sql`date >= to_date(${format(config.overview.startDate, 'yyyy-MM-dd')}, 'YYYY-MM-DD')`,
      ],
      sql` and `,
    )}
  ) net_worth
  left join net_worth_values nwv on nwv.net_worth_id = net_worth.id
  left join net_worth_fx_values fxv on fxv.values_id = nwv.id
  left join net_worth_subcategories cat on nwv.subcategory = cat.id
  left join net_worth_currencies fx on fx.net_worth_id = net_worth.id
    and fx.currency = fxv.currency
  where nwv.skip = false or nwv.skip is null
  group by month
  order by month
  `);

  return fillMonthValues<number>({
    now,
    rows,
    defaultValue: 0,
    duplicateMissing: true,
    extendPast: true,
  });
}

const includeFutureCategories = ['income'];

async function getMonthlyCostValues(
  db: DatabasePoolConnectionType,
  now: Date,
  userId: string,
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
        getViewStartDate(now),
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

  return results.reduce(
    (last, { rows }, index) => ({
      ...last,
      [monthCostCategories[index]]: fillMonthValues<number>({
        now,
        rows,
        defaultValue: 0,
        extendFuture: includeFutureCategories.includes(monthCostCategories[index]),
      }),
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

export const getOverview = async (
  db: DatabasePoolConnectionType,
  userId: string,
): Promise<Overview<string>> => {
  const { startDate } = config.overview;

  const now = new Date();

  const [funds, netWorth, cost] = await Promise.all([
    getMonthlyTotalFundValues(db, now, userId),
    getMonthlyNetWorthValues(db, now, userId),
    getMonthlyCostValues(db, now, userId),
  ]);

  return {
    startDate: startDate.toISOString(),
    viewStartDate: getViewStartDate(now).toISOString(),
    netWorth,
    funds,
    ...cost,
  };
};
