import { compose } from '@typed/compose';
import addMonths from 'date-fns/addMonths';
import isSameMonth from 'date-fns/isSameMonth';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type {
  CreditCardRecord,
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
import { usePlanningMonths } from './months';
import { filterNetWorthByMonth } from './utils';

import { CREATE_ID } from '~client/constants/data';
import { useToday } from '~client/hooks';
import { scoreColor } from '~client/modules/color';
import { getEntries } from '~client/selectors';
import { colors } from '~client/styled/variables';
import type { NetWorthEntryNative } from '~client/types';
import { PageListStandard } from '~client/types/enum';
import { NetWorthAggregate, PageNonStandard } from '~shared/constants';
import { ComputedTransactionName, StandardTransactions } from '~shared/planning';

function getNetWorthValueForSubcategoryId(
  entry: NetWorthEntryNative | undefined,
  subcategoryId: number,
): number | undefined {
  return entry?.values.find((value) => value.subcategory === subcategoryId)?.simple ?? undefined;
}

const getAccountReducer =
  (
    today: Date,
    netWorth: NetWorthEntryNative[],
    accounts: State['accounts'],
    creditCardRecords: CreditCardRecord[],
  ) =>
  (
    accumulator: PlanningData[],
    planningMonth: PlanningMonth,
    monthIndex: number,
  ): MonthByAccount[] =>
    accounts.map<MonthByAccount>((accountGroup, accountIndex) => {
      const start =
        monthIndex === 0
          ? accountGroup.computedStartValue ?? undefined
          : accumulator[accumulator.length - 1].accounts[accountIndex].endValue.computedValue;

      const startVerified =
        monthIndex === 0
          ? !!getNetWorthValueForSubcategoryId(
              filterNetWorthByMonth(netWorth, addMonths(planningMonth.date, -1)),
              accountGroup.netWorthSubcategoryId,
            )
          : accumulator[monthIndex - 1].accounts[accountIndex].endValue.isVerified;

      const transactions = getTransactionsForAccountAtMonth(
        today,
        accounts,
        accountIndex,
        planningMonth,
      );

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
          : (start ?? 0) +
            transactions.reduce<number>((sum, { computedValue = 0 }) => sum + computedValue, 0) +
            creditCardValues.reduce<number>((sum, { value = 0 }) => sum + value, 0));

      const endVerified = !!recordedEnd;

      return {
        accountGroup,
        startValue: {
          key: `${accountGroup.id ?? `${CREATE_ID}_${accountGroup.account}`}_start`,
          name: accountGroup.account,
          computedValue: start,
          isComputed: true,
          isVerified: startVerified,
        },
        creditCards: creditCardValues,
        transactions,
        endValue: {
          key: `${accountGroup.id ?? `${CREATE_ID}_${accountGroup.account}`}_end`,
          name: accountGroup.account,
          computedValue: end,
          isComputed: true,
          isVerified: endVerified,
        },
      };
    });

const numNewInputRows = 1;

const addSingleColorScale =
  (transactionName: string, color: string, isNegative = false) =>
  (data: PlanningData[]): PlanningData[] => {
    const maxValue = data.reduce<number>(
      (max0, group) =>
        group.accounts.reduce<number>(
          (max1, account) =>
            account.transactions.reduce<number>(
              (max2, transaction) =>
                transaction.name === transactionName
                  ? Math.max(max2, (isNegative ? -1 : 1) * (transaction.computedValue ?? 0))
                  : max2,
              max1,
            ),
          max0,
        ),
      0,
    );

    return data.map<PlanningData>((group) => ({
      ...group,
      accounts: group.accounts.map<PlanningData['accounts'][0]>((account) => ({
        ...account,
        transactions: account.transactions.map<PlanningData['accounts'][0]['transactions'][0]>(
          (transaction) =>
            transaction.name === transactionName
              ? {
                  ...transaction,
                  color: scoreColor(
                    color,
                    ((isNegative ? -1 : 1) * (transaction.computedValue ?? 0)) / maxValue,
                  ),
                }
              : transaction,
        ),
      })),
    }));
  };

const addColorScales = compose(
  addSingleColorScale(ComputedTransactionName.GrossIncome, colors[PageListStandard.Income].main),
  addSingleColorScale(StandardTransactions.Investments, colors[PageNonStandard.Funds].main, true),
  addSingleColorScale(
    StandardTransactions.SIPP,
    colors.netWorth.aggregate[NetWorthAggregate.pension],
    true,
  ),
);

export function usePlanningTableData(state: State): PlanningData[] {
  const today = useToday();
  const planningMonths = usePlanningMonths(state.year);
  const netWorth = useSelector(getEntries);
  const creditCards = useCreditCards();
  return useMemo<PlanningData[]>(() => {
    const creditCardRecords = getCreditCardRecords(state.accounts, creditCards);

    const accountReducer = getAccountReducer(today, netWorth, state.accounts, creditCardRecords);

    const allReduced = planningMonths.reduce<PlanningData[]>(
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

    return addColorScales(allReduced);
  }, [today, planningMonths, state.accounts, netWorth, creditCards]);
}
