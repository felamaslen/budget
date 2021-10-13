import { DatabaseTransactionConnectionType, sql } from 'slonik';
import type {
  AccountRow,
  AccountRowCreditCardJoins,
  AccountRowCreditCardPaymentJoins,
  AccountRowIncomeJoins,
  AccountRowValueJoins,
} from './types';
import {
  financialDateCTE,
  planningStartDateCTE,
  planningStartDateIncludingPreviousYearCTE,
} from './utils';

export async function selectPlanningAccountsWithIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly (AccountRow & AccountRowIncomeJoins)[]> {
  const { rows } = await db.query<AccountRow & AccountRowIncomeJoins>(sql`
  SELECT ${sql.join(
    [
      sql`a.*`,
      sql`i.id AS income_id`,
      sql`i.start_date AS income_start_date`,
      sql`i.end_date AS income_end_date`,
      sql`i.salary AS income_salary`,
      sql`i.tax_code AS income_tax_code`,
      sql`i.pension_contrib AS income_pension_contrib`,
      sql`i.student_loan AS income_student_loan`,
    ],
    sql`, `,
  )}
  FROM planning_accounts a
  LEFT JOIN planning_income i ON i.account_id = a.id
  WHERE a.uid = ${uid}
  ORDER BY a.net_worth_subcategory_id, i.start_date
  `);
  return rows;
}

export async function selectPlanningAccountsWithCreditCards(
  db: DatabaseTransactionConnectionType,
  uid: number,
  year: number,
): Promise<
  readonly ({ id: number } & AccountRowCreditCardJoins & AccountRowCreditCardPaymentJoins)[]
> {
  const { rows } = await db.query<
    { id: number } & AccountRowCreditCardJoins & AccountRowCreditCardPaymentJoins
  >(sql`
  WITH start_date AS ${planningStartDateCTE(uid, year)} 
  SELECT ${sql.join(
    [
      sql`a.id`,
      sql`cc.id AS credit_card_id`,
      sql`cc.net_worth_subcategory_id AS credit_card_net_worth_subcategory_id`,
      sql`ccp.id AS credit_card_payment_id`,
      sql`ccp.year AS credit_card_payment_year`,
      sql`ccp.month AS credit_card_payment_month`,
      sql`ccp.value AS credit_card_payment_value`,
    ],
    sql`, `,
  )}
  FROM planning_accounts a
  LEFT JOIN planning_credit_cards cc ON cc.account_id = a.id
  LEFT JOIN start_date ON TRUE
  LEFT JOIN planning_credit_card_payments ccp ON ${sql.join(
    [
      sql`ccp.credit_card_id = cc.id`,
      sql`${financialDateCTE(sql`ccp.year`, sql`ccp.month`)} > start_date.date`,
    ],
    sql` AND `,
  )}
  WHERE a.uid = ${uid}
  ORDER BY a.net_worth_subcategory_id, cc.net_worth_subcategory_id, ccp.month
  `);
  return rows;
}

export async function selectPlanningAccountsWithValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  year: number,
): Promise<readonly ({ id: number } & AccountRowValueJoins)[]> {
  const { rows } = await db.query<{ id: number } & AccountRowValueJoins>(sql`
  WITH start_date AS ${planningStartDateCTE(uid, year)} 
  SELECT ${sql.join(
    [
      sql`a.id`,
      sql`v.id AS value_id`,
      sql`v.name AS value_name`,
      sql`v.year AS value_year`,
      sql`v.month AS value_month`,
      sql`v.value AS value_value`,
      sql`v.formula AS value_formula`,
      sql`v.transfer_to AS value_transfer_to`,
    ],
    sql`, `,
  )}
  FROM planning_accounts a
  LEFT JOIN start_date ON TRUE
  LEFT JOIN planning_values v ON ${sql.join(
    [
      sql`v.account_id = a.id`,
      sql`v.year <= ${year}`,
      sql`${financialDateCTE(
        sql.identifier(['v', 'year']),
        sql.identifier(['v', 'month']),
      )} >= ${planningStartDateIncludingPreviousYearCTE(year)}`,
    ],
    sql` AND `,
  )}
  WHERE a.uid = ${uid}
  ORDER BY a.net_worth_subcategory_id, v.id
  `);
  return rows;
}
