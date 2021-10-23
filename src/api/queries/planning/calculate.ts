import { endOfMonth, formatISO } from 'date-fns';
import { DatabaseTransactionConnectionType, sql } from 'slonik';

import type {
  AverageCreditCardPaymentRow,
  LatestPlanningAccountValueRow,
  PlanningOverviewIncomeRow,
  PreviousIncomeRow,
} from './types';
import { planningStartDateCTE, planningStartDateIncludingPreviousYearCTE } from './utils';

import { PageListStandard } from '~api/types';

export async function selectLatestActualPlanningAccountValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  year: number,
): Promise<readonly LatestPlanningAccountValueRow[]> {
  const { rows } = await db.query<LatestPlanningAccountValueRow>(sql`
  WITH ${sql.join(
    [
      sql`start_date AS ${planningStartDateCTE(uid, year)}`,
      sql`filtered_net_worth AS (
        SELECT nw.id, nw.date
        FROM start_date
        LEFT JOIN net_worth nw ON nw.uid = ${uid} AND nw.date = start_date.date
        LIMIT 1
      )
      `,
    ],
    sql`, `,
  )}
  SELECT
  ${sql.join(
    [
      sql`a.id AS account_id`,
      sql`nw.date AS date`,
      sql`SUM(COALESCE(nwv.value, 0))::int4 AS value`,
    ],
    sql`, `,
  )}
  FROM planning_accounts a
  LEFT JOIN filtered_net_worth nw ON TRUE
  LEFT JOIN net_worth_values nwv ON nwv.net_worth_id = nw.id AND nwv.subcategory = a.net_worth_subcategory_id
  WHERE a.uid = ${uid}
  GROUP BY a.id, nw.date
  `);
  return rows;
}

export async function selectPlanningPreviousIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  year: number,
  accountNames: string[],
  now: Date,
): Promise<readonly PreviousIncomeRow[]> {
  const { rows } = await db.query<PreviousIncomeRow>(sql`
  WITH start_date AS ${planningStartDateCTE(uid, year)} 
  SELECT ${sql.join(
    [
      sql`list_standard.id`,
      sql`list_standard.date`,
      sql`date_part('year', list_standard.date) +
        (CASE WHEN date_part('month', list_standard.date) > 3 THEN 0
        ELSE -1 END)
        AS year`,
      sql`(date_part('month', list_standard.date) - 1) AS month`,
      sql`list_standard.item`,
      sql`list_standard.value AS gross`,
      sql`income_deductions.name AS deduction_name`,
      sql`income_deductions.value AS deduction_value`,
    ],
    sql`, `,
  )}
  FROM list_standard
  LEFT JOIN income_deductions ON income_deductions.list_id = list_standard.id
  LEFT JOIN start_date ON TRUE
  WHERE ${sql.join(
    [
      sql`uid = ${uid}`,
      sql`page = ${PageListStandard.Income}`,
      sql`item ILIKE ANY(${sql.array(
        accountNames.map((account) => `Salary (${account})`),
        'text',
      )})`,
      sql`list_standard.value > 0`,
      sql`list_standard.date >= ${planningStartDateIncludingPreviousYearCTE(year)}`,
      sql`list_standard.date <= ${formatISO(endOfMonth(now), {
        representation: 'date',
      })}`,
    ],
    sql` AND `,
  )}
  ORDER BY list_standard.date, item, income_deductions.name
  `);
  return rows;
}

export async function selectPlanningOverviewIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  startDate: string,
): Promise<readonly PlanningOverviewIncomeRow[]> {
  const { rows } = await db.query<PlanningOverviewIncomeRow>(sql`
  SELECT i.start_date, i.end_date, i.salary, i.tax_code, i.pension_contrib, i.student_loan
  FROM planning_income i
  INNER JOIN planning_accounts a ON a.id = i.account_id
  WHERE a.uid = ${uid} AND i.end_date >= ${startDate}
  `);
  return rows;
}

export async function selectAverageCreditCardPayments(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly AverageCreditCardPaymentRow[]> {
  const { rows } = await db.query<AverageCreditCardPaymentRow>(sql`
  SELECT (PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY ccp.value))::int4 AS value, ccp.credit_card_id
  FROM planning_credit_card_payments ccp
  INNER JOIN planning_credit_cards cc ON cc.id = ccp.credit_card_id
  INNER JOIN planning_accounts a ON a.id = cc.account_id
  WHERE a.uid = ${uid}
  GROUP BY ccp.credit_card_id
  `);
  return rows;
}
