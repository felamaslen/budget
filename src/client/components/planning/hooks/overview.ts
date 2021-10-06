import groupBy from 'lodash/groupBy';
import { useMemo } from 'react';

import { ComputedTransactionName } from '../constants';
import { usePlanningContext } from '../context';
import type { PlanningContextState } from '../types';
import { nameIncluded, sumComputedTransactionsByName } from '../utils';

export type PlanningOverviewRow = { name: string; value: number; isBold?: boolean };

type OverviewRowDef = {
  names: (string | RegExp)[];
  humanName?: string;
  isNegative?: boolean;
} & Omit<PlanningOverviewRow, 'name' | 'value'>;

const computedOverviewRowDefs: OverviewRowDef[] = [
  { names: [ComputedTransactionName.GrossIncome], humanName: 'Gross income', isBold: true },
  { names: [ComputedTransactionName.IncomeTax], humanName: 'Taxes', isNegative: true },
  { names: [ComputedTransactionName.NI], isNegative: true },
  { names: [ComputedTransactionName.StudentLoan], isNegative: true },
  {
    names: [
      ComputedTransactionName.GrossIncome,
      ComputedTransactionName.IncomeTax,
      ComputedTransactionName.NI,
      ComputedTransactionName.StudentLoan,
    ],
    humanName: 'Disposable income',
    isBold: true,
  },
  { names: ['Investments'], isBold: true, isNegative: true },
  {
    names: [ComputedTransactionName.Pension, /^Pension/],
    humanName: 'Pension contributions',
    isBold: true,
    isNegative: true,
  },
];

function useComputedRows(table: PlanningContextState['table']): PlanningOverviewRow[] {
  return useMemo<PlanningOverviewRow[]>(
    () =>
      computedOverviewRowDefs.map<PlanningOverviewRow>(
        ({ names, humanName, isNegative, isBold }) => ({
          name:
            humanName ??
            names.find((name): name is string => typeof name === 'string') ??
            '<No name>',
          value: sumComputedTransactionsByName(table, ...names) * (isNegative ? -1 : 1),
          isBold,
        }),
      ),
    [table],
  );
}

function useCustomRows(table: PlanningContextState['table']): PlanningOverviewRow[] {
  return useMemo<PlanningOverviewRow[]>(
    () =>
      Object.entries(
        groupBy(
          table.reduce<PlanningOverviewRow[]>(
            (acc0, { accounts }) =>
              accounts.reduce<PlanningOverviewRow[]>(
                (acc1, { transactions }) =>
                  transactions
                    .filter((transaction) => !transaction.isTransfer)
                    .reduce<PlanningOverviewRow[]>(
                      (acc2, { name, computedValue = 0 }) =>
                        computedOverviewRowDefs.some((compare) => nameIncluded(name, compare.names))
                          ? acc2
                          : [...acc2, { name, value: computedValue }],
                      acc1,
                    ),
                acc0,
              ),
            [],
          ),
          'name',
        ),
      )
        .filter(([, group]) => group.length > 2)
        .map<PlanningOverviewRow>(([name, group]) => ({
          name,
          value: Math.abs(group.reduce<number>((sum, row) => sum + row.value, 0)),
        }))
        .sort((a, b) => (a.name < b.name ? -1 : 1)),
    [table],
  );
}

function useCreditCardRow(table: PlanningContextState['table']): PlanningOverviewRow {
  return useMemo<PlanningOverviewRow>(() => {
    const value = table.reduce<number>(
      (sum0, { accounts }) =>
        accounts.reduce<number>(
          (sum1, { creditCards }) =>
            creditCards.reduce<number>((sum2, payment) => sum2 - (payment.value ?? 0), sum1),
          sum0,
        ),
      0,
    );
    return { name: 'CC spending', value };
  }, [table]);
}

function usePreviousYearTaxRelief(table: PlanningContextState['table']): PlanningOverviewRow {
  return useMemo<PlanningOverviewRow>(() => {
    const value = table.reduce<number>(
      (sum0, { accounts }) =>
        accounts.reduce<number>(
          (sum1, { previousYearTaxRelief }) => sum1 + previousYearTaxRelief,
          sum0,
        ),
      0,
    );
    return { name: 'Tax relief from previous year', value };
  }, [table]);
}

export function useOverviewData(): PlanningOverviewRow[] {
  const { table } = usePlanningContext();
  const computedRows = useComputedRows(table);
  const customRows = useCustomRows(table);
  const creditCardRow = useCreditCardRow(table);
  const previousYearTaxRelief = usePreviousYearTaxRelief(table);

  return [...computedRows, previousYearTaxRelief, ...customRows, creditCardRow];
}
