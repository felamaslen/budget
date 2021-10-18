import { groupBy, omit } from 'lodash';
import type { DatabaseTransactionConnectionType } from 'slonik';

import {
  accountRowHasBills,
  accountRowHasCreditCardPayment,
  accountRowHasIncome,
  accountRowHasJoins,
  accountRowHasValue,
  computeTaxReliefFromPreviousYear,
  getComputedTransactionsForAccount,
  getRelevantYears,
} from './utils';

import {
  AccountRowCreditCardJoins,
  AccountRowCreditCardPaymentJoins,
  LatestPlanningAccountValueRow,
  ParameterRow,
  PreviousIncomeRow,
  selectAverageCreditCardPayments,
  selectLatestActualPlanningAccountValues,
  selectPlanningAccountsWithBills,
  selectPlanningAccountsWithCreditCards,
  selectPlanningAccountsWithIncome,
  selectPlanningAccountsWithValues,
  selectPlanningPreviousIncome,
  selectRates,
  selectThresholds,
} from '~api/queries/planning';
import {
  AsyncReturnType,
  PlanningAccount,
  PlanningCreditCard,
  PlanningCreditCardPayment,
  PlanningIncome,
  PlanningParameters,
  PlanningSyncResponse,
  TaxRate,
  TaxThreshold,
} from '~api/types';

function constructAccounts(
  year: number,
  now: Date,
  accountRowsWithIncome: AsyncReturnType<typeof selectPlanningAccountsWithIncome>,
  accountRowsWithCreditCards: AsyncReturnType<typeof selectPlanningAccountsWithCreditCards>,
  averageCreditCardPaymentRows: AsyncReturnType<typeof selectAverageCreditCardPayments>,
  accountRowsWithValues: AsyncReturnType<typeof selectPlanningAccountsWithValues>,
  accountRowsWithBills: AsyncReturnType<typeof selectPlanningAccountsWithBills>,
  thresholdRows: readonly ParameterRow[],
  rateRows: readonly ParameterRow[],
  previousIncomeRows: readonly PreviousIncomeRow[],
  latestActualValues: readonly LatestPlanningAccountValueRow[],
): PlanningAccount[] {
  const accountsWithIncome = groupBy(accountRowsWithIncome, 'id');
  const creditCardsGrouped = groupBy(accountRowsWithCreditCards, 'id');
  const valuesGrouped = groupBy(
    accountRowsWithValues.filter(accountRowHasValue).filter((row) => row.value_year === year),
    'id',
  );

  return Object.entries(accountsWithIncome).map<PlanningAccount>(([accountId, incomeGroup]) => {
    const creditCards = creditCardsGrouped[accountId].filter(
      accountRowHasJoins<AccountRowCreditCardJoins, AccountRowCreditCardPaymentJoins>(
        'credit_card_id',
      ),
    );

    const { computedStartValue, computedValues, predictedCreditCardPayments } =
      getComputedTransactionsForAccount(
        {
          accountsWithIncome,
          thresholdRows,
          rateRows,
          valueRows: accountRowsWithValues.filter(accountRowHasValue),
          billsRows: incomeGroup[0].include_bills
            ? accountRowsWithBills.filter(accountRowHasBills)
            : [],
          latestActualValues,
          previousIncome: previousIncomeRows,
          creditCardPayments: creditCards
            .filter(accountRowHasCreditCardPayment)
            .filter((card) => card.id === incomeGroup[0].id),
          averageCreditCardPaymentRows,
        },
        year,
        now,
        incomeGroup,
      );

    return {
      id: incomeGroup[0].id,
      netWorthSubcategoryId: incomeGroup[0].net_worth_subcategory_id,
      account: incomeGroup[0].account,
      upperLimit: incomeGroup[0].limit_upper,
      lowerLimit: incomeGroup[0].limit_lower,
      income: incomeGroup.filter(accountRowHasIncome).map<PlanningIncome>((row) => ({
        id: row.income_id,
        startDate: new Date(row.income_start_date),
        endDate: new Date(row.income_end_date),
        salary: row.income_salary,
        taxCode: row.income_tax_code,
        pensionContrib: row.income_pension_contrib,
        studentLoan: row.income_student_loan,
      })),
      creditCards: Object.entries(groupBy(creditCards, 'credit_card_id')).map<PlanningCreditCard>(
        ([, creditCardGroup]) => ({
          id: creditCardGroup[0].credit_card_id,
          netWorthSubcategoryId: creditCardGroup[0].credit_card_net_worth_subcategory_id,
          payments: creditCardGroup
            .filter(accountRowHasCreditCardPayment)
            .filter((row) => row.credit_card_payment_year === year)
            .map<PlanningCreditCardPayment>((row) => ({
              id: row.credit_card_payment_id,
              month: row.credit_card_payment_month,
              value: row.credit_card_payment_value,
            })),
          predictedPayment: predictedCreditCardPayments[creditCardGroup[0].credit_card_id],
        }),
      ),
      values:
        valuesGrouped[accountId]?.map((row) => ({
          id: row.value_id,
          name: row.value_name,
          month: row.value_month,
          value: row.value_value,
          formula: row.value_formula,
          transferToAccountId: row.value_transfer_to,
        })) ?? [],
      computedValues,
      computedStartValue,
      includeBills: incomeGroup[0].include_bills,
    };
  });
}

const constructParameters = (
  year: number,
  thresholdRows: readonly ParameterRow[],
  rateRows: readonly ParameterRow[],
): PlanningParameters => ({
  rates: rateRows
    .filter((compare) => compare.year === year)
    .map<TaxRate>((row) => omit(row, 'id', 'uid', 'year')),
  thresholds: thresholdRows
    .filter((compare) => compare.year === year)
    .map<TaxThreshold>((row) => omit(row, 'id', 'uid', 'year')),
});

export async function getPlanningData(
  db: DatabaseTransactionConnectionType,
  uid: number,
  year: number,
  now = new Date(),
): Promise<Omit<PlanningSyncResponse, 'error' | 'year'>> {
  const [
    accountRowsWithIncome,
    accountRowsWithCreditCards,
    averageCreditCardPaymentRows,
    accountRowsWithValues,
    accountRowsWithBills,
  ] = await Promise.all([
    selectPlanningAccountsWithIncome(db, uid),
    selectPlanningAccountsWithCreditCards(db, uid, year),
    selectAverageCreditCardPayments(db, uid),
    selectPlanningAccountsWithValues(db, uid, year),
    selectPlanningAccountsWithBills(db, uid, year),
  ]);

  const accountNames = Array.from(new Set(accountRowsWithIncome.map((row) => row.account)));

  const [latestActualValues, previousIncomeRows] = await Promise.all([
    selectLatestActualPlanningAccountValues(db, uid, year),
    selectPlanningPreviousIncome(db, uid, year, accountNames, now),
  ]);

  // Always include the previous year, so as to calculate tax relief
  const relevantYears = getRelevantYears(year, previousIncomeRows);

  const [thresholdRows, rateRows] = await Promise.all([
    selectThresholds(db, uid, relevantYears),
    selectRates(db, uid, relevantYears),
  ]);

  return {
    accounts: constructAccounts(
      year,
      now,
      accountRowsWithIncome,
      accountRowsWithCreditCards,
      averageCreditCardPaymentRows,
      accountRowsWithValues,
      accountRowsWithBills,
      thresholdRows,
      rateRows,
      previousIncomeRows,
      latestActualValues,
    ),
    parameters: constructParameters(year, thresholdRows, rateRows),
    taxReliefFromPreviousYear: computeTaxReliefFromPreviousYear(
      year,
      thresholdRows,
      rateRows,
      accountRowsWithIncome,
      accountRowsWithValues,
      previousIncomeRows,
    ),
  };
}
