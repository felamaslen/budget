import groupBy from 'lodash/groupBy';
import React, { useMemo } from 'react';

import { ComputedTransactionName } from '../constants';
import { usePlanningContext } from '../context';
import type { PlanningContextState } from '../types';
import { nameIncluded, sumComputedTransactionsByName } from '../utils';
import * as Styled from './styles';

import { formatCurrency } from '~client/modules/format';
import { H4 } from '~client/styled/shared';

type TableRow = { name: string; value: number } & Parameters<typeof Styled.OverviewRow>[0];

const PlanningOverviewRow: React.FC<TableRow> = ({ name, value, isBold }) =>
  value ? (
    <Styled.OverviewRow isBold={isBold}>
      <Styled.OverviewName>{name}</Styled.OverviewName>
      <Styled.OverviewValue>{formatCurrency(value)}</Styled.OverviewValue>
    </Styled.OverviewRow>
  ) : null;

type OverviewRowDef = {
  names: (string | RegExp)[];
  humanName?: string;
  isNegative?: boolean;
} & Parameters<typeof Styled.OverviewRow>[0];

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

function useComputedRows(table: PlanningContextState['table']): TableRow[] {
  return useMemo<TableRow[]>(
    () =>
      computedOverviewRowDefs.map<TableRow>(({ names, humanName, isNegative, isBold }) => ({
        name:
          humanName ??
          names.find((name): name is string => typeof name === 'string') ??
          '<No name>',
        value: sumComputedTransactionsByName(table, ...names) * (isNegative ? -1 : 1),
        isBold,
      })),
    [table],
  );
}

function useCustomRows(table: PlanningContextState['table']): TableRow[] {
  return useMemo<TableRow[]>(
    () =>
      Object.entries(
        groupBy(
          table.reduce<TableRow[]>(
            (acc0, { accounts }) =>
              accounts.reduce<TableRow[]>(
                (acc1, { transactions }) =>
                  transactions
                    .filter((transaction) => !transaction.isTransfer)
                    .reduce<TableRow[]>(
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
        .map<TableRow>(([name, group]) => ({
          name,
          value: Math.abs(group.reduce<number>((sum, row) => sum + row.value, 0)),
        }))
        .sort((a, b) => (a.name < b.name ? -1 : 1)),
    [table],
  );
}

function useCreditCardRow(table: PlanningContextState['table']): TableRow {
  return useMemo<TableRow>(() => {
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

function usePreviousYearTaxRelief(table: PlanningContextState['table']): TableRow {
  return useMemo<TableRow>(() => {
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

export const PlanningOverview: React.FC = () => {
  const { table } = usePlanningContext();
  const computedRows = useComputedRows(table);
  const customRows = useCustomRows(table);
  const creditCardRow = useCreditCardRow(table);
  const previousYearTaxRelief = usePreviousYearTaxRelief(table);
  return (
    <Styled.PlanningOverview>
      <H4>Overview</H4>
      {[...computedRows, previousYearTaxRelief, ...customRows, creditCardRow].map((row) => (
        <PlanningOverviewRow key={row.name} {...row} />
      ))}
    </Styled.PlanningOverview>
  );
};
