import { startOfMonth } from 'date-fns';
import { groupBy, uniqBy } from 'lodash';
import type { DatabaseTransactionConnectionType } from 'slonik';

import {
  AccountRowCreditCardJoins,
  AccountRowCreditCardPaymentJoins,
  AccountRowIncomeJoins,
  AccountRowValueJoins,
  AccountRowWithJoins,
  ParameterRow,
  PreviousIncomeRow,
  PreviousIncomeRowWithDeduction,
  selectPlanningAccountsWithJoins,
  selectPlanningPreviousIncome,
  selectRates,
  selectThresholds,
} from '~api/queries/planning';
import {
  IncomeDeduction,
  PlanningAccount,
  PlanningAccountsResponse,
  PlanningCreditCard,
  PlanningCreditCardPayment,
  PlanningIncome,
  PlanningParameters,
  PlanningParametersResponse,
  PlanningPastIncome,
  PlanningValue,
} from '~api/types';
import { TaxRate } from '~client/types/gql';

const filterParameterRows = (year: number, rows: readonly ParameterRow[]): TaxRate[] =>
  rows
    .filter((row) => row.year === year)
    .map<TaxRate>((row) => ({ name: row.name, value: row.value }))
    .sort((a, b) => (a.name < b.name ? -1 : 1));

export async function getPlanningParameters(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<PlanningParameters[]> {
  const [thresholdRows, rateRows] = await Promise.all([
    selectThresholds(db, uid),
    selectRates(db, uid),
  ]);

  const years = Array.from(
    new Set([...thresholdRows.map((row) => row.year), ...rateRows.map((row) => row.year)]),
  ).sort();

  const planningParameters = years.map<PlanningParameters>((year) => ({
    year,
    thresholds: filterParameterRows(year, thresholdRows),
    rates: filterParameterRows(year, rateRows),
  }));

  return planningParameters;
}

type WithRequiredJoin<
  T,
  U extends Record<string, unknown | null>,
  StillNullable extends keyof U = never
> = T extends U
  ? Omit<T, keyof U> &
      {
        [K in keyof U]: K extends StillNullable ? U[K] : NonNullable<U[K]>;
      }
  : never;

type AccountRowWithIncomeJoins = WithRequiredJoin<AccountRowWithJoins, AccountRowIncomeJoins>;
type AccountRowWithCreditCardJoins = WithRequiredJoin<
  AccountRowWithJoins,
  AccountRowCreditCardJoins
>;
type AccountRowWithCreditCardPaymentJoins = WithRequiredJoin<
  AccountRowWithJoins,
  AccountRowCreditCardPaymentJoins
>;
type AccountRowWithValueJoins = WithRequiredJoin<
  AccountRowWithJoins,
  AccountRowValueJoins,
  'value_value' | 'value_formula' | 'value_transfer_to'
>;

const isIncomeRow = (row: AccountRowWithJoins): row is AccountRowWithIncomeJoins => !!row.income_id;

const isCreditCardRow = (row: AccountRowWithJoins): row is AccountRowWithCreditCardJoins =>
  !!row.credit_card_id;

const isCreditCardPaymentRow = (
  row: AccountRowWithJoins,
): row is AccountRowWithCreditCardPaymentJoins => !!row.credit_card_payment_id;

const isValueRow = (row: AccountRowWithJoins): row is AccountRowWithValueJoins => !!row.value_id;

const isDeductionRow = (row: PreviousIncomeRow): row is PreviousIncomeRowWithDeduction =>
  !!row.deduction_name;

export async function getPlanningAccounts(
  db: DatabaseTransactionConnectionType,
  uid: number,
  now = new Date(),
): Promise<PlanningAccount[]> {
  const accountRows = await selectPlanningAccountsWithJoins(db, uid);
  const accountNames = Array.from(new Set(accountRows.map((row) => row.account)));
  const previousIncomeRows = await selectPlanningPreviousIncome(
    db,
    uid,
    startOfMonth(now),
    accountNames,
  );

  const previousIncome = Object.entries(groupBy(previousIncomeRows, 'id')).map<{
    item: string;
    pastIncome: PlanningPastIncome;
  }>(([, group]) => ({
    item: group[0].item,
    pastIncome: {
      date: group[0].date,
      gross: group[0].gross,
      deductions: group.filter(isDeductionRow).map<IncomeDeduction>((row) => ({
        name: row.deduction_name,
        value: row.deduction_value,
      })),
    },
  }));

  return Object.entries(groupBy(accountRows, 'id')).map<PlanningAccount>(([, accountGroup]) => {
    const { id, account, net_worth_subcategory_id, limit_lower, limit_upper } = accountGroup[0];

    const pastIncome = previousIncome
      .filter((compare) => compare.item.toLowerCase().includes(account.toLowerCase()))
      .map((group) => group.pastIncome);

    const income = uniqBy(accountGroup.filter(isIncomeRow), 'income_id').map<PlanningIncome>(
      (row) => ({
        id: row.income_id,
        startDate: new Date(row.income_start_date),
        endDate: new Date(row.income_end_date),
        salary: row.income_salary,
        taxCode: row.income_tax_code,
        pensionContrib: row.income_pension_contrib,
        studentLoan: row.income_student_loan,
      }),
    );

    const creditCardPaymentRows = uniqBy(
      accountGroup.filter(isCreditCardPaymentRow),
      'credit_card_payment_id',
    );

    const creditCards = uniqBy(
      accountGroup.filter(isCreditCardRow),
      'credit_card_id',
    ).map<PlanningCreditCard>((row) => {
      const payments = creditCardPaymentRows
        .filter(
          (paymentRow) => paymentRow.credit_card_payment_credit_card_id === row.credit_card_id,
        )
        .map<PlanningCreditCardPayment>((paymentRow) => ({
          id: paymentRow.credit_card_payment_id,
          year: paymentRow.credit_card_payment_year,
          month: paymentRow.credit_card_payment_month,
          value: paymentRow.credit_card_payment_value,
        }));

      return {
        id: row.credit_card_id,
        netWorthSubcategoryId: row.credit_card_net_worth_subcategory_id,
        payments,
      };
    });

    const values = uniqBy(accountGroup.filter(isValueRow), 'value_id').map<PlanningValue>(
      (row) => ({
        id: row.value_id,
        year: row.value_year,
        month: row.value_month,
        name: row.value_name,
        value: row.value_value,
        formula: row.value_formula,
        transferToAccountId: row.value_transfer_to,
      }),
    );

    return {
      id,
      account,
      netWorthSubcategoryId: net_worth_subcategory_id,
      income,
      pastIncome,
      creditCards,
      values,
      upperLimit: limit_upper,
      lowerLimit: limit_lower,
    };
  });
}

export async function readPlanningParameters(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<PlanningParametersResponse> {
  const parameters = await getPlanningParameters(db, uid);
  return { parameters };
}

export async function readPlanningAccounts(
  db: DatabaseTransactionConnectionType,
  uid: number,
): Promise<PlanningAccountsResponse> {
  const accounts = await getPlanningAccounts(db, uid);
  return { accounts };
}
