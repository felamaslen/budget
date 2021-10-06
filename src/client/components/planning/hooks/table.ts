import addMonths from 'date-fns/addMonths';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import endOfMonth from 'date-fns/endOfMonth';
import isAfter from 'date-fns/isAfter';
import isSameMonth from 'date-fns/isSameMonth';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { StandardRates, StandardThresholds, startMonth } from '../constants';
import type {
  CreditCardRecord,
  IncomeRates,
  MonthByAccount,
  PlanningData,
  PlanningMonth,
  State,
} from '../types';
import {
  getCreditCardRecords,
  getCreditCardsForAccountAtMonth,
  getTransactionsForAccountAtMonth,
} from '../utils';

import { useCreditCards } from './credit';
import { fillMonths, usePlanningMonths } from './months';
import { filterNetWorthByMonth } from './utils';

import { CREATE_ID } from '~client/constants/data';
import { useToday } from '~client/hooks';
import { getEntries } from '~client/selectors';
import type { NetWorthEntryNative } from '~client/types';
import type { PlanningTaxRateInput, PlanningTaxThresholdInput } from '~client/types/gql';

function getNetWorthValueForSubcategoryId(
  entry: NetWorthEntryNative | undefined,
  subcategoryId: number,
): number | undefined {
  return entry?.values.find((value) => value.subcategory === subcategoryId)?.simple ?? undefined;
}

type ParametersForYear = {
  rates: PlanningTaxRateInput[];
  thresholds: PlanningTaxThresholdInput[];
};

function getParametersForYear(state: State, year: number): ParametersForYear {
  const parameters = state.parameters.find((compare) => compare.year === year);
  const rates = parameters?.rates ?? [];
  const thresholds = parameters?.thresholds ?? [];
  return { rates, thresholds };
}

function getIncomeRatesForYear({ rates, thresholds }: ParametersForYear): IncomeRates {
  return {
    taxBasicRate: rates.find((rate) => rate.name === StandardRates.IncomeTaxBasicRate)?.value ?? 0,
    taxHigherRate:
      rates.find((rate) => rate.name === StandardRates.IncomeTaxHigherRate)?.value ?? 0,
    taxAdditionalRate:
      rates.find((rate) => rate.name === StandardRates.IncomeTaxAdditionalRate)?.value ?? 0,
    taxBasicAllowance:
      thresholds.find((threshold) => threshold.name === StandardThresholds.IncomeTaxBasicAllowance)
        ?.value ?? 0,
    taxAdditionalThreshold:
      thresholds.find(
        (threshold) => threshold.name === StandardThresholds.IncomeTaxAdditionalThreshold,
      )?.value ?? 0,

    niLowerRate: rates.find((rate) => rate.name === StandardRates.NILowerRate)?.value ?? 0,
    niHigherRate: rates.find((rate) => rate.name === StandardRates.NIHigherRate)?.value ?? 0,

    niPaymentThreshold:
      thresholds.find((threshold) => threshold.name === StandardThresholds.NIPT)?.value ?? 0,
    niUpperEarningsLimit:
      thresholds.find((threshold) => threshold.name === StandardThresholds.NIUEL)?.value ?? 0,

    studentLoanRate: rates.find((rate) => rate.name === StandardRates.StudentLoanRate)?.value ?? 0,
    studentLoanThreshold:
      thresholds.find((rate) => rate.name === StandardThresholds.StudentLoanThreshold)?.value ?? 0,
  };
}

function useIncomeRates(state: State): Record<number, IncomeRates> {
  return useMemo<Record<number, IncomeRates>>(() => {
    const years = Array.from(new Set(state.parameters.map((param) => param.year)));
    return years.reduce<Record<number, IncomeRates>>((last, year) => {
      const parameters = getParametersForYear(state, year);
      return {
        ...last,
        [year]: getIncomeRatesForYear(parameters),
      };
    }, {});
  }, [state]);
}

const getAccountReducer = (
  today: Date,
  netWorth: NetWorthEntryNative[],
  incomeRates: Record<number, IncomeRates>,
  accounts: State['accounts'],
  creditCardRecords: CreditCardRecord[],
) => (
  accumulator: PlanningData[],
  planningMonth: PlanningMonth,
  monthIndex: number,
): MonthByAccount[] =>
  accounts.map<MonthByAccount>((accountGroup, accountIndex) => {
    const start =
      monthIndex === 0
        ? getNetWorthValueForSubcategoryId(
            filterNetWorthByMonth(netWorth, addMonths(planningMonth.date, -1)),
            accountGroup.netWorthSubcategoryId,
          )
        : accumulator[accumulator.length - 1].accounts[accountIndex].endValue.computedValue;

    const startVerified =
      monthIndex === 0
        ? typeof start !== 'undefined'
        : accumulator[monthIndex - 1].accounts[accountIndex].endValue.isVerified;

    const { transactions, taxRelief } = getTransactionsForAccountAtMonth(
      today,
      incomeRates[planningMonth.year],
      accounts,
      accountIndex,
      planningMonth,
    );

    const previousYearTaxRelief =
      planningMonth.month === startMonth
        ? accumulator
            .filter((row) => row.year === planningMonth.year - 1)
            .reduce<number>((sum, row) => sum + row.accounts[accountIndex].taxRelief, 0)
        : 0;

    const creditCardValues = getCreditCardsForAccountAtMonth(
      creditCardRecords,
      planningMonth,
      accounts[accountIndex],
    );

    const recordedEnd = getNetWorthValueForSubcategoryId(
      filterNetWorthByMonth(netWorth, planningMonth.date),
      accountGroup.netWorthSubcategoryId,
    );
    const end =
      recordedEnd ??
      (typeof start === 'undefined'
        ? undefined
        : start +
          transactions.reduce<number>((sum, { computedValue = 0 }) => sum + computedValue, 0) +
          creditCardValues.reduce<number>((sum, { value = 0 }) => sum + value, 0));

    const endVerified = !!recordedEnd;

    return {
      accountGroup,
      startValue: {
        id: `${accountGroup.id ?? `${CREATE_ID}_${accountGroup.account}`}_start`,
        name: accountGroup.account,
        computedValue: start,
        isComputed: true,
        isVerified: startVerified,
      },
      creditCards: creditCardValues,
      transactions,
      taxRelief,
      previousYearTaxRelief,
      endValue: {
        id: `${accountGroup.id ?? `${CREATE_ID}_${accountGroup.account}`}_end`,
        name: accountGroup.account,
        computedValue: end,
        isComputed: true,
        isVerified: endVerified,
      },
    };
  });

const numNewInputRows = 1;

export function usePlanningTableData(state: State, year: number): PlanningData[] {
  const today = useToday();
  const planningMonths = usePlanningMonths(year);
  const netWorth = useSelector(getEntries);
  const creditCards = useCreditCards();
  const incomeRates = useIncomeRates(state);

  return useMemo<PlanningData[]>(() => {
    const creditCardRecords = getCreditCardRecords(state.accounts, creditCards);

    const latestPriorNetWorth = netWorth
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .find((entry) => !isAfter(entry.date, planningMonths[0].date));

    const startAtDate = endOfMonth(latestPriorNetWorth?.date ?? planningMonths[0].date);
    const numAdditionalMonths = Math.max(
      0,
      differenceInCalendarMonths(planningMonths[0].date, startAtDate),
    );

    const additionalMonths = fillMonths(startAtDate, numAdditionalMonths);
    const allMonths = [...additionalMonths, ...planningMonths];

    const accountReducer = getAccountReducer(
      today,
      netWorth,
      incomeRates,
      state.accounts,
      creditCardRecords,
    );

    const allReduced = allMonths.reduce<PlanningData[]>(
      (accumulator, planningMonth, monthIndex) => {
        const accounts = accountReducer(accumulator, planningMonth, monthIndex);
        const numRows = accounts.reduce<number>(
          (max, account) =>
            Math.max(
              max,
              account.creditCards.length + account.transactions.length + numNewInputRows,
            ),
          3,
        );
        return [
          ...accumulator,
          {
            ...planningMonth,
            accounts,
            numRows,
            isCurrentMonth: isSameMonth(new Date(planningMonth.year, planningMonth.month), today),
          },
        ];
      },
      [],
    );

    return allReduced.slice(numAdditionalMonths);
  }, [today, planningMonths, state.accounts, netWorth, incomeRates, creditCards]);
}
