import { evaluateInfix } from 'calculator-lib';
import endOfMonth from 'date-fns/endOfMonth';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import isSameMonth from 'date-fns/isSameMonth';
import { replaceAtIndex } from 'replace-array';

import { ComputedTransactionName } from '../constants';
import type { AccountTransaction, IncomeRates, PlanningData, PlanningMonth, State } from '../types';
import {
  calculateMonthlyIncomeTax,
  calculateMonthlyNIContributions,
  calculateMonthlyStudentLoanRepayment,
  calculateMonthlyTaxRelief,
} from './calculations';

import { CREATE_ID } from '~client/constants/data';
import type { IncomeDeduction, PlanningValue } from '~client/types/gql';

const isTaxDeductible = (transaction: AccountTransaction): boolean =>
  !transaction.isComputed && /^Pension/.test(transaction.name);

const isSalarySacrifice = (deduction: IncomeDeduction): boolean =>
  deduction.name === 'Pension' || /\(SalSac\)/.test(deduction.name);

function sortIncomeTransactions(income: AccountTransaction[]): AccountTransaction[] {
  return income.sort((a, b) => {
    if (a.name === 'Salary') {
      return -1;
    }
    if (b.name === 'Salary') {
      return 1;
    }
    return a.name < b.name ? -1 : 1;
  });
}

export type TransactionsWithTaxRelief = {
  transactions: AccountTransaction[];
  taxRelief: number;
};

const filterOutZero = (transaction: AccountTransaction): boolean => transaction.computedValue !== 0;

function getPastIncomeTransactionsForAccountAtMonth(
  rates: IncomeRates | undefined,
  date: Date,
  pastIncome: State['accounts'][0]['pastIncome'],
  income: State['accounts'][0]['income'],
  manualTransactions: AccountTransaction[],
): TransactionsWithTaxRelief {
  const pastIncomeFiltered = pastIncome.filter((compare) =>
    isSameMonth(new Date(compare.date), date),
  );
  if (!pastIncomeFiltered.length) {
    return { transactions: [], taxRelief: 0 };
  }

  const grossIncome = pastIncomeFiltered.reduce<number>((sum, { gross }) => sum + gross, 0);

  const transactions = sortIncomeTransactions(
    pastIncomeFiltered.reduce<AccountTransaction[]>(
      (last, { deductions }) =>
        deductions.reduce<AccountTransaction[]>((next, { name, value }) => {
          if (next.some((compare) => compare.name === name)) {
            return replaceAtIndex<AccountTransaction>(
              next,
              next.findIndex((compare) => compare.name === name),
              (prev) => ({
                ...prev,
                computedValue: (prev.value ?? 0) + value,
              }),
            );
          }
          return [
            ...next,
            {
              id: `deduction-${name}-${value}`,
              name,
              computedValue: value,
              isComputed: true,
              isVerified: true,
            },
          ];
        }, last),
      [
        {
          id: `salary-${date.toISOString()}`,
          name: ComputedTransactionName.GrossIncome,
          computedValue: grossIncome,
          isComputed: true,
          isVerified: true,
        },
      ],
    ),
  );

  const taxableIncome = pastIncomeFiltered.reduce<number>(
    (sum0, { deductions }) =>
      deductions.filter(isSalarySacrifice).reduce<number>((sum1, { value }) => sum1 + value, sum0),
    grossIncome,
  );

  const taxCode = income.find(
    (compare) =>
      !isAfter(new Date(compare.startDate), date) && !isAfter(date, new Date(compare.endDate)),
  )?.taxCode;

  const taxDeductions = manualTransactions
    .filter(isTaxDeductible)
    .reduce<number>((sum, { computedValue = 0 }) => sum - computedValue, 0);

  const taxRelief = taxCode
    ? calculateMonthlyTaxRelief(
        taxableIncome,
        taxCode,
        taxDeductions,
        rates?.taxBasicAllowance ?? 0,
        rates?.taxAdditionalThreshold ?? 0,
        rates?.taxBasicRate ?? 0,
        rates?.taxHigherRate ?? 0,
        rates?.taxAdditionalRate ?? 0,
      )
    : 0;

  return { transactions, taxRelief };
}

function getPredictedIncomeTransactionsForAccountAtMonth(
  rates: IncomeRates | undefined,
  date: Date,
  income: State['accounts'][0]['income'],
  manualTransactions: AccountTransaction[],
): TransactionsWithTaxRelief {
  const relevantIncome = income.filter(
    (group) =>
      !isBefore(endOfMonth(new Date(group.endDate)), date) &&
      !isBefore(date, endOfMonth(new Date(group.startDate))),
  );
  const combinedIncomeWithDeductions = relevantIncome.reduce<{
    salary: number;
    pension: number;
    incomeTax: number;
    taxRelief: number;
    ni: number;
  }>(
    (last, group) => {
      const pensionContribSalarySacrifice = (group.pensionContrib * group.salary) / 12;
      const taxableIncome = group.salary / 12 - pensionContribSalarySacrifice;

      const tax = calculateMonthlyIncomeTax(
        taxableIncome,
        group.taxCode,
        rates?.taxBasicAllowance ?? 0,
        rates?.taxAdditionalThreshold ?? 0,
        rates?.taxBasicRate ?? 0,
        rates?.taxHigherRate ?? 0,
        rates?.taxAdditionalRate ?? 0,
      );

      const taxDeductions = manualTransactions
        .filter(isTaxDeductible)
        .reduce<number>((sum, { computedValue = 0 }) => sum - computedValue, 0);

      const taxRelief = calculateMonthlyTaxRelief(
        taxableIncome,
        group.taxCode,
        taxDeductions,
        rates?.taxBasicAllowance ?? 0,
        rates?.taxAdditionalThreshold ?? 0,
        rates?.taxBasicRate ?? 0,
        rates?.taxHigherRate ?? 0,
        rates?.taxAdditionalRate ?? 0,
      );

      return {
        salary: last.salary + Math.round(group.salary / 12),
        pension: last.pension + Math.round(pensionContribSalarySacrifice),
        incomeTax: last.incomeTax + tax,
        taxRelief: last.taxRelief + taxRelief,
        ni:
          last.ni +
          calculateMonthlyNIContributions(
            taxableIncome,
            rates?.niPaymentThreshold ?? 0,
            rates?.niUpperEarningsLimit ?? 0,
            rates?.niLowerRate ?? 0,
            rates?.niHigherRate ?? 0,
          ),
      };
    },
    { salary: 0, pension: 0, incomeTax: 0, taxRelief: 0, ni: 0 },
  );

  const taxableIncomeFull =
    combinedIncomeWithDeductions.salary - combinedIncomeWithDeductions.pension;
  const repayStudentLoan = relevantIncome.some((group) => group.studentLoan);
  const studentLoan = repayStudentLoan
    ? calculateMonthlyStudentLoanRepayment(
        taxableIncomeFull,
        rates?.studentLoanRate ?? 0,
        Math.round((rates?.studentLoanThreshold ?? 0) / 12),
      )
    : 0;

  const transactions: AccountTransaction[] = [
    {
      id: 'salary-predicted',
      name: ComputedTransactionName.GrossIncome,
      computedValue: combinedIncomeWithDeductions.salary,
      isComputed: true,
      isVerified: false,
    },
    {
      id: 'pension-predicted',
      name: ComputedTransactionName.Pension,
      computedValue: -combinedIncomeWithDeductions.pension,
      isComputed: true,
      isVerified: false,
    },
    {
      id: 'income-tax-predicted',
      name: ComputedTransactionName.IncomeTax,
      computedValue: -combinedIncomeWithDeductions.incomeTax,
      isComputed: true,
      isVerified: false,
    },
    {
      id: 'ni-predicted',
      name: ComputedTransactionName.NI,
      computedValue: -combinedIncomeWithDeductions.ni,
      isComputed: true,
      isVerified: false,
    },
    {
      id: 'student-loan-predicted',
      name: ComputedTransactionName.StudentLoan,
      computedValue: -studentLoan,
      isComputed: true,
      isVerified: false,
    },
  ];

  return { transactions, taxRelief: combinedIncomeWithDeductions.taxRelief };
}

function getIncomeTransactionsForAccountAtMonth(
  rates: IncomeRates | undefined,
  date: Date,
  isPast: boolean,
  account: State['accounts'][0],
  manualTransactions: AccountTransaction[],
): TransactionsWithTaxRelief {
  return isPast
    ? getPastIncomeTransactionsForAccountAtMonth(
        rates,
        date,
        account.pastIncome,
        account.income,
        manualTransactions,
      )
    : getPredictedIncomeTransactionsForAccountAtMonth(
        rates,
        date,
        account.income,
        manualTransactions,
      );
}

function evaluateValue(row: Pick<PlanningValue, 'value' | 'formula'>): number | undefined {
  return row.formula ? Math.round(evaluateInfix(row.formula) * 100) : row.value ?? undefined;
}

function getManualTransactionsForAccountAtMonth(
  year: number,
  month: number,
  isPast: boolean,
  account: State['accounts'][0],
): AccountTransaction[] {
  return account.values
    .filter((row) => row.year === year && row.month === month)
    .map<AccountTransaction>((row) => ({
      id: row.id ?? `${CREATE_ID}-${row.value}-${row.formula}`,
      name: row.name,
      computedValue: evaluateValue(row),
      value: row.value ?? undefined,
      formula: row.formula ?? undefined,
      isVerified: isPast,
      isTransfer: !!row.transferToAccountId,
    }));
}

function getTransferTransactionsForAccountAtMonth(
  year: number,
  month: number,
  isPast: boolean,
  accounts: State['accounts'],
  index: number,
): AccountTransaction[] {
  if (!accounts[index].id) {
    return [];
  }
  return accounts.reduce<AccountTransaction[]>(
    (last, account) =>
      account.values
        .filter(
          (value) =>
            value.year === year &&
            value.month === month &&
            value.transferToAccountId === accounts[index].id,
        )
        .reduce<AccountTransaction[]>(
          (next, row) => [
            ...next,
            {
              id: `${row.id ?? CREATE_ID}-transfer-to`,
              name: `${account.account} transfer`,
              computedValue: -(evaluateValue(row) ?? 0) || undefined,
              isComputed: true,
              isVerified: isPast,
              isTransfer: true,
            },
          ],
          last,
        ),
    [],
  );
}

export function getTransactionsForAccountAtMonth(
  today: Date,
  rates: IncomeRates | undefined,
  accounts: State['accounts'],
  index: number,
  { year, month, date }: PlanningMonth,
): TransactionsWithTaxRelief {
  const isPast = isAfter(today, date);
  const manualTransactions = getManualTransactionsForAccountAtMonth(
    year,
    month,
    isPast,
    accounts[index],
  );

  const income = getIncomeTransactionsForAccountAtMonth(
    rates,
    date,
    isPast,
    accounts[index],
    manualTransactions,
  );

  const transactions: AccountTransaction[] = [
    ...income.transactions.filter(filterOutZero),
    ...manualTransactions,
    ...getTransferTransactionsForAccountAtMonth(year, month, isPast, accounts, index).filter(
      filterOutZero,
    ),
  ];

  return { transactions, taxRelief: income.taxRelief };
}

export function nameIncluded(name: string, names: (string | RegExp)[]): boolean {
  return names.some((compare) =>
    typeof compare === 'string' ? compare === name : compare.test(name),
  );
}

export function sumComputedTransactionsByName(
  table: PlanningData[],
  ...names: (string | RegExp)[]
): number {
  return table.reduce<number>(
    (sum0, row) =>
      row.accounts.reduce<number>(
        (sum1, account) =>
          account.transactions.reduce<number>(
            (sum2, transaction) =>
              sum2 + (nameIncluded(transaction.name, names) ? transaction.computedValue ?? 0 : 0),
            sum1,
          ),
        sum0,
      ),
    0,
  );
}
