import { formatISO } from 'date-fns';
import { DatabaseTransactionConnectionType, sql } from 'slonik';
import { PageListStandard } from '~api/types';
import { Create } from '~shared/types';

export type ParameterRow = {
  readonly id: number;
  uid: number;
  year: number;
  name: string;
  value: number;
};

export type ThresholdRow = ParameterRow;
export type RateRow = ParameterRow; // value is a float instead of int, but JS doesn't know the difference

const upsertAllUserParameterRows = (valueType: 'int4' | 'float8', tableName: string) => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  inputs: Omit<ParameterRow, 'id' | 'uid'>[],
): Promise<void> => {
  const { rows: existingIdRows } = await db.query<{ id: number }>(sql`
  INSERT INTO ${sql.identifier([`planning_${tableName}`])} (uid, year, name, value)
  SELECT * FROM ${sql.unnest(
    inputs.map((input) => [uid, input.year, input.name, input.value]),
    ['int4', 'int4', 'text', valueType],
  )}
  ON CONFLICT (uid, year, name) DO UPDATE SET value = excluded.value
  RETURNING id
  `);

  await db.query(sql`
  DELETE FROM ${sql.identifier([`planning_${tableName}`])}
  WHERE uid = ${uid} AND id != ALL(${sql.array(
    existingIdRows.map((row) => row.id),
    'int4',
  )})
  `);
};

export const upsertThresholds = upsertAllUserParameterRows('int4', 'thresholds');

export const upsertRates = upsertAllUserParameterRows('float8', 'rates');

const selectParameterRows = (tableName: string) => async (
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly ParameterRow[]> => {
  const { rows } = await db.query<ParameterRow>(sql`
  SELECT * FROM ${sql.identifier([`planning_${tableName}`])}
  WHERE uid = ${uid}
  `);
  return rows;
};

export const selectThresholds = selectParameterRows('thresholds');
export const selectRates = selectParameterRows('rates');

export type AccountRow = {
  readonly id: number;
  uid: number;
  account: string;
  net_worth_subcategory_id: number;
};

export async function insertPlanningAccounts(
  db: DatabaseTransactionConnectionType,
  uid: number,
  accounts: Omit<AccountRow, 'id' | 'uid'>[],
): Promise<readonly AccountRow[]> {
  const { rows } = await db.query<AccountRow>(sql`
  INSERT INTO planning_accounts (uid, account, net_worth_subcategory_id)
  SELECT * FROM (
    SELECT new_accounts.* FROM ${sql.unnest(
      accounts.map((account) => [uid, account.account, account.net_worth_subcategory_id]),
      ['int4', 'text', 'int4'],
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
  `);
  return rows;
}

export type AccountRowIncomeJoins = {
  income_id: number | null;
  income_start_date: string | Date | null;
  income_end_date: string | Date | null;
  income_salary: number | null;
  income_tax_code: string | null;
  income_pension_contrib: number | null;
  income_student_loan: boolean | null;
};

export type AccountRowCreditCardJoins = {
  credit_card_id: number | null;
  credit_card_net_worth_subcategory_id: number | null;
};

export type AccountRowCreditCardPaymentJoins = {
  credit_card_payment_id: number | null;
  credit_card_payment_credit_card_id: number | null;
  credit_card_payment_year: number | null;
  credit_card_payment_month: number | null;
  credit_card_payment_value: number | null;
};

export type AccountRowValueJoins = {
  value_id: number | null;
  value_name: string | null;
  value_year: number | null;
  value_month: number | null;
  value_value: number | null;
  value_formula: string | null;
  value_transfer_to: number | null;
};

export type AccountRowWithJoins = AccountRow &
  AccountRowIncomeJoins &
  AccountRowCreditCardJoins &
  AccountRowCreditCardPaymentJoins &
  AccountRowValueJoins;

export async function selectPlanningAccountsWithJoins(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<readonly AccountRowWithJoins[]> {
  const { rows } = await db.query<AccountRowWithJoins>(sql`
  SELECT ${sql.join(
    [
      sql`accounts.*`,
      sql`planning_income.id AS income_id`,
      sql`planning_income.start_date AS income_start_date `,
      sql`planning_income.end_date AS income_end_date `,
      sql`planning_income.salary AS income_salary`,
      sql`planning_income.tax_code AS income_tax_code `,
      sql`planning_income.pension_contrib AS income_pension_contrib `,
      sql`planning_income.student_loan AS income_student_loan`,
      sql`cc.id AS credit_card_id`,
      sql`cc.net_worth_subcategory_id AS credit_card_net_worth_subcategory_id`,
      sql`ccp.id AS credit_card_payment_id`,
      sql`ccp.credit_card_id AS credit_card_payment_credit_card_id`,
      sql`ccp.year AS credit_card_payment_year`,
      sql`ccp.month AS credit_card_payment_month`,
      sql`ccp.value AS credit_card_payment_value`,
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
  FROM planning_accounts accounts
  LEFT JOIN planning_income ON planning_income.account_id = accounts.id
  LEFT JOIN planning_credit_cards cc ON cc.account_id = accounts.id
  LEFT JOIN planning_credit_card_payments ccp ON ccp.credit_card_id = cc.id
  LEFT JOIN planning_values v ON v.account_id = accounts.id
  WHERE accounts.uid = ${uid}
  ORDER BY ${sql.join(
    [
      sql`accounts.net_worth_subcategory_id`,
      sql`planning_income.start_date`,
      sql`cc.id`,
      sql`ccp.year`,
      sql`ccp.month`,
      sql`v.id`,
    ],
    sql`, `,
  )}
  `);
  return rows;
}

export type PreviousIncomeRow = {
  id: number;
  date: Date;
  item: string;
  gross: number;
  deduction_name: string | null;
  deduction_value: number | null;
};

export type PreviousIncomeDeductionRow = {
  deduction_name: string;
  deduction_value: number;
};

export type PreviousIncomeRowWithDeduction = Omit<
  PreviousIncomeRow,
  keyof PreviousIncomeDeductionRow
> &
  PreviousIncomeDeductionRow;

export async function selectPlanningPreviousIncome(
  db: DatabaseTransactionConnectionType,
  uid: number,
  now: Date,
  accountNames: string[],
): Promise<readonly PreviousIncomeRow[]> {
  const { rows } = await db.query<PreviousIncomeRow>(sql`
  SELECT ${sql.join(
    [
      sql`list_standard.id`,
      sql`date`,
      sql`item`,
      sql`list_standard.value AS gross`,
      sql`income_deductions.name AS deduction_name`,
      sql`income_deductions.value AS deduction_value`,
    ],
    sql`, `,
  )}
  FROM list_standard
  LEFT JOIN income_deductions ON income_deductions.list_id = list_standard.id
  WHERE ${sql.join(
    [
      sql`uid = ${uid}`,
      sql`page = ${PageListStandard.Income}`,
      sql`item ILIKE ANY(${sql.array(
        accountNames.map((account) => `Salary (${account})`),
        'text',
      )})`,
      sql`list_standard.value > 0`,
      sql`date < ${formatISO(now, { representation: 'date' })}::date`,
    ],
    sql` AND `,
  )}
  ORDER BY date, item, income_deductions.name
  `);
  return rows;
}

export type PlanningIncomeRow = {
  id: number;
  account_id: number;
  start_date: string | Date;
  end_date: string | Date;
  salary: number;
  tax_code: string;
  pension_contrib: number;
  student_loan: boolean;
};

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

export type PlanningCreditCardRow = {
  readonly id: number;
  account_id: number;
  net_worth_subcategory_id: number;
};

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

export type PlanningCreditCardPaymentRow = {
  readonly id: number;
  credit_card_id: number;
  year: number;
  month: number;
  value: number;
};

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

export async function deleteOldPlanningCreditCardPayments(
  db: DatabaseTransactionConnectionType,
  uid: number,
  existingPaymentIds: number[],
): Promise<void> {
  await db.query(sql`
  DELETE FROM planning_credit_card_payments
  USING planning_credit_cards, planning_accounts
  WHERE planning_credit_cards.id = planning_credit_card_payments.credit_card_id
    AND planning_accounts.id = planning_credit_cards.account_id
    AND planning_accounts.uid = ${uid}
    AND planning_credit_card_payments.id != ALL(${sql.array(existingPaymentIds, 'int4')})
  `);
}

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

export type PlanningValueRow = {
  readonly id: number;
  year: number;
  month: number;
  account_id: number;
  name: string;
  value: number | null;
  formula: string | null;
  transfer_to: number | null;
};

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

export async function deleteOldPlanningValues(
  db: DatabaseTransactionConnectionType,
  uid: number,
  existingValueIds: number[],
): Promise<void> {
  await db.query(sql`
  DELETE FROM planning_values
  USING planning_accounts
  WHERE planning_accounts.id = planning_values.account_id
    AND planning_accounts.uid = ${uid}
    AND planning_values.id != ALL(${sql.array(existingValueIds, 'int4')})
  `);
}

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
