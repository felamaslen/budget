import { useDebounceCallback } from '@react-hook/debounce';
import addMonths from 'date-fns/addMonths';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import endOfMonth from 'date-fns/endOfMonth';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import isAfter from 'date-fns/isAfter';
import isSameMonth from 'date-fns/isSameMonth';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { StandardRates, StandardThresholds, startMonth } from './constants';
import { initialState } from './context';
import type {
  CreditCardRecord,
  IncomeRates,
  MonthByAccount,
  PlanningData,
  PlanningMonth,
  State,
} from './types';
import {
  getCreditCardsForAccountAtMonth,
  getDateFromYearAndMonth,
  getFinancialYearFromYearMonth,
  getTransactionsForAccountAtMonth,
  mapPlanningMonth,
} from './utils';

import { Average } from '~client/constants';
import { CREATE_ID } from '~client/constants/data';
import { useToday } from '~client/hooks';
import { arrayAverage } from '~client/modules/data';
import { getEntries, getSubcategories } from '~client/selectors';
import type { NetWorthEntryNative } from '~client/types';
import {
  NetWorthSubcategory,
  PlanningTaxRateInput,
  PlanningTaxThresholdInput,
  useReadPlanningQuery,
  useSyncPlanningMutation,
} from '~client/types/gql';
import { omitDeep } from '~shared/utils';

const isStateEqual = (s0: State, s1: State): boolean =>
  isEqual(omitDeep(s0.accounts, 'id'), omitDeep(s1.accounts, 'id')) &&
  isEqual(omitDeep(s0.parameters, 'id'), omitDeep(s1.parameters, 'id'));

export function usePlanning(): {
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  isSynced: boolean;
  isLoading: boolean;
} {
  const [state, setState] = useState<State>(initialState);
  const [isSynced, setSynced] = useState<boolean>(true);
  const lastSyncedState = useRef<State>(state);

  const [
    { data: stateInitial, fetching: fetchingInitial, error: errorInitial },
  ] = useReadPlanningQuery();

  useEffect(() => {
    setState((last) => {
      const receivedState: State = omitDeep(
        {
          accounts: stateInitial?.readPlanningAccounts?.accounts ?? last.accounts,
          parameters: stateInitial?.readPlanningParameters?.parameters ?? last.parameters,
        },
        '__typename',
      );
      lastSyncedState.current = receivedState;
      return receivedState;
    });
  }, [stateInitial]);

  const [
    { data: stateSynced, fetching: fetchingSync, error: errorSync },
    sync,
  ] = useSyncPlanningMutation();

  const isLoading = fetchingInitial || fetchingSync;
  const error = errorInitial ?? errorSync;

  const syncDebounce = useDebounceCallback(sync);

  useEffect(() => {
    if (!isStateEqual(state, lastSyncedState.current)) {
      setSynced(false);
      if (!isLoading && !error) {
        lastSyncedState.current = state;
        syncDebounce({
          input: {
            accounts: state.accounts.map((row) => omit(row, 'pastIncome')),
            parameters: state.parameters,
          },
        });
      }
    }
  }, [syncDebounce, state, isLoading, error]);

  useEffect(() => {
    setState((last) =>
      omitDeep(
        {
          parameters: stateSynced?.syncPlanning?.parameters ?? last.parameters,
          accounts: stateSynced?.syncPlanning?.accounts ?? last.accounts,
        },
        '__typename',
      ),
    );
    setSynced(true);
  }, [stateSynced]);

  return {
    state,
    setState,
    isSynced,
    isLoading,
  };
}

function filterNetWorthByMonth(
  entries: NetWorthEntryNative[],
  date: Date,
): NetWorthEntryNative | undefined {
  return entries.find((entry) => isSameMonth(entry.date, date));
}

function getNetWorthValueForSubcategoryId(
  entry: NetWorthEntryNative | undefined,
  subcategoryId: number,
): number | undefined {
  return entry?.values.find((value) => value.subcategory === subcategoryId)?.simple ?? undefined;
}

export function useRecordedMonthNetWorth(date: Date): NetWorthEntryNative | undefined {
  const entries = useSelector(getEntries);
  return filterNetWorthByMonth(entries, date);
}

function fillMonths(startDate: Date, numMonths: number): PlanningMonth[] {
  return Array(numMonths)
    .fill(0)
    .map((_, index) => {
      const date = endOfMonth(addMonths(startDate, index));
      const month = getMonth(date);
      return { date, year: getFinancialYearFromYearMonth(getYear(date), month), month };
    });
}

export function usePlanningMonths(year: number): PlanningMonth[] {
  return useMemo<PlanningMonth[]>(() => {
    const atYear = getDateFromYearAndMonth(year, startMonth);
    return fillMonths(atYear, 12);
  }, [year]);
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

export function useCreditCards(): NetWorthSubcategory[] {
  const netWorthSubcategories = useSelector(getSubcategories);
  return useMemo(() => netWorthSubcategories.filter((compare) => !!compare.hasCreditLimit), [
    netWorthSubcategories,
  ]);
}

function getCreditCardRecords(
  accounts: State['accounts'],
  creditCards: NetWorthSubcategory[],
): CreditCardRecord[] {
  return creditCards.map<CreditCardRecord>((card) => ({
    netWorthSubcategoryId: card.id,
    name: card.subcategory,
    lastRecordedPayment: mapPlanningMonth(
      accounts.reduce<Pick<PlanningMonth, 'year' | 'month'>>(
        (last, account) =>
          account.creditCards
            .find((compare) => compare.netWorthSubcategoryId === card.id)
            ?.payments.reduce<Pick<PlanningMonth, 'year' | 'month'>>(
              (next, payment) =>
                payment.year > next.year ||
                (payment.year === next.year && payment.month > next.month)
                  ? { year: payment.year, month: payment.month }
                  : next,
              last,
            ) ?? last,
        { year: 0, month: 0 },
      ),
    ),
    averageRecordedPayment:
      arrayAverage(
        accounts.reduce<number[]>(
          (last, account) =>
            (
              account.creditCards.find((compare) => compare.netWorthSubcategoryId === card.id)
                ?.payments ?? []
            ).reduce<number[]>((next, payment) => [...next, payment.value], last),
          [],
        ),
        Average.Median,
      ) || undefined,
  }));
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

    const transactions = getTransactionsForAccountAtMonth(
      today,
      incomeRates[planningMonth.year],
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

export function usePlanningData(state: State, year: number): PlanningData[] {
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
