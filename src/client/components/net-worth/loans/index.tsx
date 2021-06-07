import addMonths from 'date-fns/addMonths';
import differenceInMonths from 'date-fns/differenceInMonths';
import endOfMonth from 'date-fns/endOfMonth';
import getUnixTime from 'date-fns/getUnixTime';
import isBefore from 'date-fns/isBefore';
import React, { useMemo, useState } from 'react';
import { replaceAtIndex } from 'replace-array';

import { LoansGraph } from './graph';
import { LoansSidebar } from './sidebar';
import * as Styled from './styles';
import { LoanOverrides, LoanWithInfo, ValueWithRequiredLoan } from './types';
import { colorKey } from '~client/modules/color';
import { CompoundLoan, forecastCompoundLoanDebt, PMT } from '~client/selectors';
import { mapMonthDates } from '~client/selectors/overview/utils';
import type { NetWorthEntryNative, Point } from '~client/types';
import type { NetWorthSubcategory } from '~client/types/gql';

export type Props = {
  subcategories: NetWorthSubcategory[];
  entries: NetWorthEntryNative[];
};

type LoanWithDate = ValueWithRequiredLoan & { date: Date };

type LoanWithStartIndex = {
  stack: LoanWithDate[];
  startIndex: number;
};

function stackLoans(entries: NetWorthEntryNative[]): LoanWithDate[][] {
  const sortedEntries = entries.slice().sort((a, b) => (a.date > b.date ? 1 : -1));
  const loanStacks = sortedEntries.reduce<LoanWithDate[][]>((loans, entry) => {
    const entryLoans = entry.values
      .filter((value): value is ValueWithRequiredLoan => !!value.loan)
      .map<LoanWithDate>((loan) => ({ ...loan, date: endOfMonth(entry.date) }));

    return entryLoans.reduce<LoanWithDate[][]>((stacks, loan) => {
      const existingLoanIndex = stacks.findIndex(
        (stack) => stack[0].subcategory === loan.subcategory,
      );
      if (existingLoanIndex === -1) {
        return [...stacks, [loan]];
      }
      return replaceAtIndex(stacks, existingLoanIndex, (stack) => [...stack, loan]);
    }, loans);
  }, []);
  return loanStacks;
}

function getMaxLineLength(loansWithStartIndex: LoanWithStartIndex[]): number {
  return loansWithStartIndex.reduce<number>(
    (last, { stack, startIndex }) =>
      Math.max(last, startIndex + stack[stack.length - 1].loan.paymentsRemaining + stack.length),
    0,
  );
}

function getStartDate(loanStacks: LoanWithDate[][]): Date {
  return endOfMonth(
    loanStacks.reduce<Date>(
      (last, [loan]) => (isBefore(loan.date, last) ? loan.date : last),
      new Date(),
    ),
  );
}

function enrichLoansWithInfo(
  visible: Record<string, boolean>,
  overrides: LoanOverrides,
  subcategories: NetWorthSubcategory[],
  startDate: Date,
  loansWithStartIndex: LoanWithStartIndex[],
): LoanWithInfo[] {
  const dates = Array(getMaxLineLength(loansWithStartIndex))
    .fill(0)
    .map<Date>((_, index) => endOfMonth(addMonths(startDate, index)));

  const loansWithInfo = loansWithStartIndex
    .map(({ stack, startIndex }) => ({
      startIndex,
      ...stack[stack.length - 1],
      stack,
      name:
        subcategories.find((compare) => compare.id === stack[0].subcategory)?.subcategory ??
        'Unknown',
    }))
    .map<LoanWithInfo>((item) => {
      const overrideLumpSum = overrides[item.name]?.lumpSum ?? 0;
      const overrideOverpayment = overrides[item.name]?.overpayment ?? 0;

      const originalLoan: CompoundLoan = {
        interestRate: item.loan.rate,
        monthlyPayment: PMT(item.loan),
        principal: item.loan.principal,
      };

      const modifiedLoan: CompoundLoan = {
        ...originalLoan,
        principal: originalLoan.principal - overrideLumpSum,
        monthlyPayment:
          PMT({
            ...item.loan,
            principal: originalLoan.principal - overrideLumpSum,
          }) *
          (1 + overrideOverpayment),
      };

      const lineDates = mapMonthDates(
        dates.slice(
          item.startIndex,
          item.startIndex + item.stack.length + item.loan.paymentsRemaining,
        ),
      );

      const recordedValues = item.stack.map<number>(({ loan }) => loan.principal);
      const recordedData = recordedValues.map<Point>((value, index) => [
        getUnixTime(lineDates[index].date),
        value,
      ]);

      const forecastData = forecastCompoundLoanDebt(
        lineDates.slice(0, item.loan.paymentsRemaining),
        0,
        [modifiedLoan],
      ).map<Point>((value, index) => [
        getUnixTime(lineDates[index + item.stack.length].date),
        value,
      ]);

      return {
        loanValue: item.loan,
        modifiedLoan,
        originalLoan,
        visible: visible[item.name] !== false,
        line: {
          key: item.name,
          name: item.name,
          color: colorKey(item.name),
          data: [...recordedData, ...forecastData],
        },
        originalData:
          overrideLumpSum || overrideOverpayment
            ? [
                ...recordedValues,
                ...forecastCompoundLoanDebt(lineDates.slice(0, item.loan.paymentsRemaining), 0, [
                  originalLoan,
                ]),
              ]
            : undefined,
      };
    });

  return loansWithInfo;
}

function getLoans(
  entries: NetWorthEntryNative[],
  subcategories: NetWorthSubcategory[],
  visible: Record<string, boolean>,
  overrides: LoanOverrides,
): LoanWithInfo[] {
  const loanStacks = stackLoans(entries);
  const startDate = getStartDate(loanStacks);

  const loansWithStartIndex = loanStacks.map((stack) => ({
    stack,
    startIndex: differenceInMonths(stack[0].date, startDate),
  }));

  return enrichLoansWithInfo(visible, overrides, subcategories, startDate, loansWithStartIndex);
}

export const NetWorthLoans: React.FC<Props> = ({ entries, subcategories }) => {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [overrides, setOverrides] = useState<LoanOverrides>({});
  const loans = useMemo(() => getLoans(entries, subcategories, visible, overrides), [
    entries,
    subcategories,
    visible,
    overrides,
  ]);
  return (
    <Styled.LoanView>
      {loans.length > 0 ? (
        <>
          <Styled.LoansGraph>
            <LoansGraph loans={loans} />
          </Styled.LoansGraph>
          <LoansSidebar
            loans={loans}
            overrides={overrides}
            setOverrides={setOverrides}
            setVisible={setVisible}
          />
        </>
      ) : (
        <span>There are no loans</span>
      )}
    </Styled.LoanView>
  );
};
