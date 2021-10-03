import { evaluateInfix } from 'calculator-lib';
import endOfMonth from 'date-fns/endOfMonth';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import isSameMonth from 'date-fns/isSameMonth';
import { replaceAtIndex } from 'replace-array';

import type { AccountTransaction, IncomeRates, PlanningMonth, State } from '../types';
import {
  calculateMonthlyIncomeTax,
  calculateMonthlyNIContributions,
  calculateMonthlyStudentLoanRepayment,
} from './calculations';

import { CREATE_ID } from '~client/constants/data';
import type { PlanningValue } from '~client/types/gql';

function getPastIncomeTransactionsForAccountAtMonth(
  date: Date,
  pastIncome: State['accounts'][0]['pastIncome'],
): AccountTransaction[] {
  const pastIncomeFiltered = pastIncome.filter((compare) =>
    isSameMonth(new Date(compare.date), date),
  );
  if (!pastIncomeFiltered.length) {
    return [];
  }
  return pastIncomeFiltered.reduce<AccountTransaction[]>(
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
        name: 'Salary',
        computedValue: pastIncomeFiltered.reduce<number>((sum, { gross }) => sum + gross, 0),
        isComputed: true,
        isVerified: true,
      },
    ],
  );
}

function getPredictedIncomeTransactionsForAccountAtMonth(
  rates: IncomeRates | undefined,
  date: Date,
  income: State['accounts'][0]['income'],
  manualTransactions: AccountTransaction[],
): AccountTransaction[] {
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
      const pensionContribIndividual = manualTransactions
        .filter((compare) => /^Pension/.test(compare.name))
        .reduce<number>((sum, { computedValue = 0 }) => sum - computedValue, 0);

      const { tax, pensionTaxRelief } = calculateMonthlyIncomeTax(
        taxableIncome,
        group.taxCode,
        pensionContribIndividual,
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
        taxRelief: last.taxRelief + pensionTaxRelief,
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

  return [
    {
      id: 'salary-predicted',
      name: 'Salary',
      computedValue: combinedIncomeWithDeductions.salary,
      isComputed: true,
      isVerified: false,
    },
    {
      id: 'pension-predicted',
      name: 'Pension',
      computedValue: -combinedIncomeWithDeductions.pension,
      isComputed: true,
      isVerified: false,
    },
    {
      id: 'income-tax-predicted',
      name: 'Income tax',
      computedValue: -combinedIncomeWithDeductions.incomeTax,
      isComputed: true,
      isVerified: false,
    },
    {
      id: 'ni-predicted',
      name: 'NI',
      computedValue: -combinedIncomeWithDeductions.ni,
      isComputed: true,
      isVerified: false,
    },
    {
      id: 'student-loan-predicted',
      name: 'Student loan',
      computedValue: -studentLoan,
      isComputed: true,
      isVerified: false,
    },
  ].filter((group) => group.computedValue !== 0);
}

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

function getIncomeTransactionsForAccountAtMonth(
  rates: IncomeRates | undefined,
  date: Date,
  isPast: boolean,
  account: State['accounts'][0],
  manualTransactions: AccountTransaction[],
): AccountTransaction[] {
  return sortIncomeTransactions(
    isPast
      ? getPastIncomeTransactionsForAccountAtMonth(date, account.pastIncome)
      : getPredictedIncomeTransactionsForAccountAtMonth(
          rates,
          date,
          account.income,
          manualTransactions,
        ),
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
): AccountTransaction[] {
  const isPast = isAfter(today, date);
  const manualTransactions = getManualTransactionsForAccountAtMonth(
    year,
    month,
    isPast,
    accounts[index],
  );
  return [
    ...getIncomeTransactionsForAccountAtMonth(
      rates,
      date,
      isPast,
      accounts[index],
      manualTransactions,
    ),
    ...manualTransactions,
    ...getTransferTransactionsForAccountAtMonth(year, month, isPast, accounts, index),
  ];
}
