import { DatabaseTransactionConnectionType, sql } from 'slonik';

import type {
  AccountRow,
  PlanningCreditCardPaymentRow,
  PlanningCreditCardRow,
  PlanningIncomeRow,
  PlanningValueRow,
} from './types';
import { selectParameterRows, upsertUserParameterRowsByYear } from './utils';

import { Create } from '~shared/types';

export const upsertThresholds = upsertUserParameterRowsByYear('int4', 'thresholds');
export const upsertRates = upsertUserParameterRowsByYear('float8', 'rates');

export const selectThresholds = selectParameterRows('thresholds');
export const selectRates = selectParameterRows('rates');

export async function insertPlanningAccounts(
  db: DatabaseTransactionConnectionType,
  uid: number,
  accounts: Omit<AccountRow, 'id' | 'uid'>[],
): Promise<readonly AccountRow[]> {
  const { rows } = await db.query<AccountRow>(sql`
  INSERT INTO planning_accounts (uid, account, net_worth_subcategory_id, limit_upper, limit_lower, include_bills)
  SELECT * FROM (
    SELECT new_accounts.* FROM ${sql.unnest(
      accounts.map((account) => [
        uid,
        account.account,
        account.net_worth_subcategory_id,
        account.limit_upper,
        account.limit_lower,
        account.include_bills,
      ]),
      ['int4', 'text', 'int4', 'int4', 'int4', 'bool'],
    )} AS new_accounts(uid, account, net_worth_subcategory_id)
    INNER JOIN net_worth_subcategories nws ON nws.id = new_accounts.net_worth_subcategory_id
    INNER JOIN net_worth_categories nwc ON nwc.id = nws.category_id AND nwc.uid = ${uid}
    LEFT JOIN planning_accounts p0 ON p0.net_worth_subcategory_id = new_accounts.net_worth_subcategory_id
    WHERE p0.id IS NULL
  ) items
  ON CONFLICT (uid, account) DO UPDATE SET account = excluded.account
  RETURNING *
  `);
  return rows;
}

export async function updatePlanningAccount(
  db: DatabaseTransactionConnectionType,
  uid: number,
  account: Omit<AccountRow, 'uid'>,
): Promise<void> {
  await db.query(sql`
  UPDATE planning_accounts
  SET ${sql.join(
    [
      sql`net_worth_subcategory_id = ${account.net_worth_subcategory_id}`,
      sql`account = ${account.account}`,
      sql`limit_upper = ${account.limit_upper}`,
      sql`limit_lower = ${account.limit_lower}`,
      sql`include_bills = ${account.include_bills}`,
    ],
    sql`, `,
  )}
  WHERE uid = ${uid} AND id = ${account.id}
  `);
}

export async function deleteOldPlanningAccounts(
  db: DatabaseTransactionConnectionType,
  uid: number,
  existingAccountIds: number[],
): Promise<void> {
  await db.query(sql`
  DELETE FROM planning_accounts
  WHERE uid = ${uid} AND id != ALL(${sql.array(existingAccountIds, 'int4')})
  `);
}

export async function selectPlanningAccounts(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly AccountRow[]> {
  const { rows } = await db.query<AccountRow>(sql`
  SELECT * FROM planning_accounts
  WHERE uid = ${uid}
  ORDER BY account
  `);
  return rows;
}

export async function insertPlanningIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  rows: Create<PlanningIncomeRow>[],
): Promise<readonly PlanningIncomeRow[]> {
  const { rows: result } = await db.query<PlanningIncomeRow>(sql`
  INSERT INTO planning_income (account_id, start_date, end_date, salary, tax_code, pension_contrib, student_loan)
  SELECT * FROM (
    SELECT new_income.*
    FROM ${sql.unnest(
      rows.map((row) => [
        row.account_id,
        row.start_date,
        row.end_date,
        row.salary,
        row.tax_code,
        row.pension_contrib,
        row.student_loan,
      ]),
      ['int4', 'date', 'date', 'int4', 'text', 'float8', 'bool'],
    )} AS new_income(account_id, start_date, end_date, salary, tax_code, pension_contrib, student_loan)
    INNER JOIN planning_accounts ON planning_accounts.id = new_income.account_id AND planning_accounts.uid = ${uid}
  ) items
  RETURNING *
  `);
  return result;
}

export async function updatePlanningIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  row: PlanningIncomeRow,
): Promise<void> {
  await db.query(sql`
  UPDATE planning_income SET ${sql.join(
    [
      sql`account_id = ${row.account_id}`,
      sql`start_date = ${row.start_date as string}`,
      sql`end_date = ${row.end_date as string}`,
      sql`salary = ${row.salary}`,
      sql`tax_code = ${row.tax_code}`,
      sql`pension_contrib = ${row.pension_contrib}`,
      sql`student_loan = ${row.student_loan}`,
    ],
    sql`, `,
  )}
  FROM planning_accounts
  WHERE planning_income.id = ${row.id}
    AND planning_accounts.id = ${row.account_id}
    AND planning_accounts.uid = ${uid}
  `);
}

export async function deleteOldPlanningIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  existingIncomeIds: number[],
): Promise<void> {
  await db.query(sql`
  DELETE FROM planning_income
  USING planning_accounts
  WHERE planning_accounts.uid = ${uid}
    AND planning_accounts.id = planning_income.account_id
    AND planning_income.id != ALL(${sql.array(existingIncomeIds, 'int4')})
  `);
}

export async function selectPlanningIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly PlanningIncomeRow[]> {
  const { rows } = await db.query<PlanningIncomeRow>(sql`
  SELECT planning_income.*
  FROM planning_income
  INNER JOIN planning_accounts ON planning_accounts.id = planning_income.account_id
  WHERE planning_accounts.uid = ${uid}
  `);
  return rows;
}

export async function insertPlanningCreditCards(
  db: DatabaseTransactionConnectionType,
  uid: number,
  rows: Create<PlanningCreditCardRow>[],
): Promise<readonly PlanningCreditCardRow[]> {
  const result = await db.query<PlanningCreditCardRow>(sql`
  INSERT INTO planning_credit_cards (account_id, net_worth_subcategory_id)
  SELECT * FROM (
    SELECT new_credit_cards.*
    FROM ${sql.unnest(
      rows.map((row) => [row.account_id, row.net_worth_subcategory_id]),
      ['int4', 'int4'],
    )} AS new_credit_cards(account_id, net_worth_subcategory_id)
    INNER JOIN planning_accounts ON planning_accounts.id = new_credit_cards.account_id
      AND planning_accounts.uid = ${uid}
    INNER JOIN net_worth_subcategories nws ON nws.id = new_credit_cards.net_worth_subcategory_id
    INNER JOIN net_worth_categories nwc ON nwc.id = nws.category_id AND nwc.uid = ${uid}
  ) items
  RETURNING *
  `);
  return result.rows;
}

export async function updatePlanningCreditCard(
  db: DatabaseTransactionConnectionType,
  uid: number,
  row: PlanningCreditCardRow,
): Promise<void> {
  await db.query(sql`
  UPDATE planning_credit_cards SET ${sql.join(
    [
      sql`account_id = ${row.account_id}`,
      sql`net_worth_subcategory_id = ${row.net_worth_subcategory_id}`,
    ],
    sql`, `,
  )}
  FROM planning_accounts, net_worth_subcategories nws, net_worth_categories nwc
  WHERE planning_credit_cards.id = ${row.id}
    AND planning_accounts.id = ${row.account_id}
    AND planning_accounts.uid = ${uid}
    AND nws.id = ${row.net_worth_subcategory_id}
    AND nwc.id = nws.category_id
    AND nwc.uid = ${uid}
  `);
}

export async function deleteOldPlanningCreditCards(
  db: DatabaseTransactionConnectionType,
  uid: number,
  existingCreditCardIds: number[],
): Promise<void> {
  await db.query(sql`
  DELETE FROM planning_credit_cards
  USING planning_accounts
  WHERE planning_accounts.uid = ${uid}
    AND planning_accounts.id = planning_credit_cards.account_id
    AND planning_credit_cards.id != ALL(${sql.array(existingCreditCardIds, 'int4')})
  `);
}

export async function selectPlanningCreditCards(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly PlanningCreditCardRow[]> {
  const { rows } = await db.query<PlanningCreditCardRow>(sql`
  SELECT planning_credit_cards.*
  FROM planning_credit_cards
  INNER JOIN planning_accounts ON planning_accounts.id = planning_credit_cards.account_id
  WHERE planning_accounts.uid = ${uid}
  ORDER BY planning_credit_cards.id
  `);
  return rows;
}

export async function insertPlanningCreditCardPayments(
  db: DatabaseTransactionConnectionType,
  uid: number,
  paymentRows: Create<PlanningCreditCardPaymentRow>[],
): Promise<readonly PlanningCreditCardPaymentRow[]> {
  const { rows } = await db.query<PlanningCreditCardPaymentRow>(sql`
  INSERT INTO planning_credit_card_payments (credit_card_id, year, month, value)
  SELECT * FROM (
    SELECT payments_new.*
    FROM ${sql.unnest(
      paymentRows.map((row) => [row.credit_card_id, row.year, row.month, row.value]),
      ['int4', 'int4', 'int4', 'int4'],
    )} AS payments_new(credit_card_id, year, month, value)
    INNER JOIN planning_credit_cards ON planning_credit_cards.id = payments_new.credit_card_id
    INNER JOIN planning_accounts ON planning_accounts.id = planning_credit_cards.account_id
      AND planning_accounts.uid = ${uid}
  ) items
  RETURNING *
  `);
  return rows;
}

export async function updatePlanningCreditCardPayments(
  db: DatabaseTransactionConnectionType,
  uid: number,
  row: PlanningCreditCardPaymentRow,
): Promise<void> {
  await db.query(sql`
  UPDATE planning_credit_card_payments
  SET ${sql.join(
    [
      sql`credit_card_id = ${row.credit_card_id}`,
      sql`year = ${row.year}`,
      sql`month = ${row.month}`,
      sql`value = ${row.value}`,
    ],
    sql`, `,
  )}
  FROM planning_credit_cards, planning_accounts
  WHERE planning_credit_cards.id = ${row.credit_card_id}
    AND planning_accounts.id = planning_credit_cards.account_id
    AND planning_accounts.uid = ${uid}
    AND planning_credit_card_payments.id = ${row.id}
  `);
}

export const deleteOldPlanningCreditCardPayments =
  (year: number) =>
  async (
    db: DatabaseTransactionConnectionType,
    uid: number,
    existingPaymentIds: number[],
  ): Promise<void> => {
    await db.query(sql`
  DELETE FROM planning_credit_card_payments
  USING planning_credit_cards, planning_accounts
  WHERE planning_credit_cards.id = planning_credit_card_payments.credit_card_id
    AND planning_accounts.id = planning_credit_cards.account_id
    AND planning_accounts.uid = ${uid}
    AND planning_credit_card_payments.year = ${year}
    AND planning_credit_card_payments.id != ALL(${sql.array(existingPaymentIds, 'int4')})
  `);
  };

export async function selectPlanningCreditCardPayments(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly PlanningCreditCardPaymentRow[]> {
  const { rows } = await db.query<PlanningCreditCardPaymentRow>(sql`
  SELECT planning_credit_card_payments.*
  FROM planning_credit_card_payments
  INNER JOIN planning_credit_cards ON planning_credit_cards.id = planning_credit_card_payments.credit_card_id
  INNER JOIN planning_accounts ON planning_accounts.id = planning_credit_cards.account_id
  WHERE planning_accounts.uid = ${uid}
  ORDER BY planning_credit_card_payments.id
  `);
  return rows;
}

export async function insertPlanningValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  valueRows: Create<PlanningValueRow>[],
): Promise<readonly PlanningValueRow[]> {
  const { rows } = await db.query<PlanningValueRow>(sql`
  INSERT INTO planning_values (account_id, year, month, name, value, formula, transfer_to)
  SELECT * FROM (
    SELECT new_values.*
    FROM ${sql.unnest(
      valueRows.map((row) => [
        row.account_id,
        row.year,
        row.month,
        row.name,
        row.value,
        row.formula,
        row.transfer_to,
      ]),
      ['int4', 'int4', 'int4', 'text', 'int4', 'text', 'int4'],
    )} AS new_values(account_id, year, month, value, formula, transfer_to)
    INNER JOIN planning_accounts accounts ON accounts.id = new_values.account_id AND accounts.uid = ${uid}
  ) items
  RETURNING *
  `);
  return rows;
}

export async function updatePlanningValue(
  db: DatabaseTransactionConnectionType,
  uid: number,
  row: PlanningValueRow,
): Promise<void> {
  await db.query(sql`
  UPDATE planning_values
  SET ${sql.join(
    [
      sql`account_id = ${row.account_id}`,
      sql`year = ${row.year}`,
      sql`month = ${row.month}`,
      sql`name = ${row.name}`,
      sql`value = ${row.value}`,
      sql`formula = ${row.formula}`,
      sql`transfer_to = ${row.transfer_to}`,
    ],
    sql`, `,
  )}
  FROM planning_accounts
  WHERE planning_accounts.id = ${row.account_id}
    AND planning_accounts.uid = ${uid}
    AND planning_values.id = ${row.id}
  `);
}

export const deleteOldPlanningValues =
  (year: number) =>
  async (
    db: DatabaseTransactionConnectionType,
    uid: number,
    existingValueIds: number[],
  ): Promise<void> => {
    await db.query(sql`
  DELETE FROM planning_values
  USING planning_accounts
  WHERE planning_accounts.id = planning_values.account_id
    AND planning_accounts.uid = ${uid}
    AND planning_values.year = ${year}
    AND planning_values.id != ALL(${sql.array(existingValueIds, 'int4')})
  `);
  };

export async function selectPlanningValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly PlanningValueRow[]> {
  const { rows } = await db.query<PlanningValueRow>(sql`
  SELECT planning_values.*
  FROM planning_values
  INNER JOIN planning_accounts ON planning_accounts.id = planning_values.account_id
  WHERE planning_accounts.uid = ${uid}
  ORDER BY planning_values.id
  `);
  return rows;
}
