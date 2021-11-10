import { useDebounceCallback } from '@react-hook/debounce';
import addMonths from 'date-fns/addMonths';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import endOfMonth from 'date-fns/endOfMonth';
import getUnixTime from 'date-fns/getUnixTime';
import isBefore from 'date-fns/isBefore';
import { useEffect, useMemo, useRef } from 'react';

import { LoansGraph } from './graph';
import { LoansSidebar } from './sidebar';
import * as Styled from './styles';
import type { LoanOverrides, LoanWithInfo, NetWorthLoanNative } from './types';
import { usePersistentState } from '~client/hooks';
import { colorKey } from '~client/modules/color';
import { CompoundLoan, forecastCompoundLoanDebt, PMT } from '~client/selectors';
import { mapMonthDates } from '~client/selectors/overview/utils';
import type { NetWorthEntryNative, Point } from '~client/types';
import { NetWorthLoan, NetWorthSubcategory, useNetWorthLoansQuery } from '~client/types/gql';

export type Props = {
  entries: NetWorthEntryNative[];
  subcategories: NetWorthSubcategory[];
};

type LoanWithStartIndex = NetWorthLoanNative & { startIndex: number };

function getMaxLineLength(loansWithStartIndex: LoanWithStartIndex[]): number {
  return loansWithStartIndex.reduce<number>(
    (last, { values, startIndex }) =>
      Math.max(
        last,
        startIndex + values[values.length - 1].value.paymentsRemaining + values.length,
      ),
    0,
  );
}

function getStartDate(loans: NetWorthLoanNative[]): Date {
  return loans.reduce<Date>(
    (last, { values: [{ date }] }) => (isBefore(date, last) ? date : last),
    new Date(),
  );
}

function enrichLoansWithInfo(
  visible: Record<string, boolean>,
  overrides: LoanOverrides,
  startDate: Date,
  loansWithStartIndex: LoanWithStartIndex[],
): LoanWithInfo[] {
  const dates = Array(getMaxLineLength(loansWithStartIndex))
    .fill(0)
    .map<Date>((_, index) => endOfMonth(addMonths(startDate, index)));

  const loansWithInfo = loansWithStartIndex.map<LoanWithInfo>((loan) => {
    const overrideLumpSum = overrides[loan.subcategory]?.lumpSum ?? 0;
    const overrideOverpayment = overrides[loan.subcategory]?.overpayment ?? 0;

    const latestValue = loan.values[loan.values.length - 1];
    const paidSoFar = loan.values.reduce<number>((last, { value }) => last + (value.paid ?? 0), 0);

    const originalLoan: CompoundLoan = {
      interestRate: latestValue.value.rate,
      monthlyPayment: PMT(latestValue.value),
      principal: latestValue.value.principal,
      paid: paidSoFar,
    };

    const minMonthlyPayment = PMT({
      ...latestValue.value,
      principal: originalLoan.principal - overrideLumpSum,
    });

    const modifiedLoan: CompoundLoan = {
      ...originalLoan,
      principal: originalLoan.principal - overrideLumpSum,
      monthlyPayment:
        PMT({
          ...latestValue.value,
          principal: originalLoan.principal - overrideLumpSum,
        }) + overrideOverpayment,
    };

    const lineDates = mapMonthDates(
      dates.slice(
        loan.startIndex,
        loan.startIndex + loan.values.length + latestValue.value.paymentsRemaining,
      ),
    );

    const recordedValues = loan.values.map<number>(({ value }) => value.principal);
    const recordedData = recordedValues.map<Point>((value, index) => [
      getUnixTime(lineDates[index].date),
      value,
    ]);

    const forecastData = forecastCompoundLoanDebt(
      lineDates.slice(0, latestValue.value.paymentsRemaining),
      0,
      [modifiedLoan],
    ).map<Point>((value, index) => [
      getUnixTime(lineDates[index + loan.values.length].date),
      value,
    ]);

    return {
      loanValue: latestValue.value,
      modifiedLoan,
      originalLoan,
      minMonthlyPayment,
      visible: visible[loan.subcategory] !== false,
      line: {
        key: loan.subcategory,
        name: loan.subcategory,
        color: colorKey(loan.subcategory),
        data: [...recordedData, ...forecastData],
      },
      originalData:
        overrideLumpSum || overrideOverpayment
          ? [
              ...recordedValues,
              ...forecastCompoundLoanDebt(
                lineDates.slice(0, latestValue.value.paymentsRemaining),
                0,
                [originalLoan],
              ),
            ]
          : undefined,
    };
  });

  return loansWithInfo;
}

function getLoans(
  loans: NetWorthLoan[],
  visible: Record<string, boolean>,
  overrides: LoanOverrides,
): LoanWithInfo[] {
  const loansWithDate = loans.map<NetWorthLoanNative>((loan) => ({
    ...loan,
    values: loan.values.map((value) => ({ ...value, date: endOfMonth(new Date(value.date)) })),
  }));
  const startDate = getStartDate(loansWithDate);

  const loansWithStartIndex = loansWithDate.map((loan) => ({
    ...loan,
    startIndex: differenceInCalendarMonths(loan.values[0].date, startDate),
  }));

  return enrichLoansWithInfo(visible, overrides, startDate, loansWithStartIndex);
}

export const NetWorthLoans: React.FC<Props> = ({ subcategories, entries }) => {
  const [{ data, fetching }, refetch] = useNetWorthLoansQuery({
    requestPolicy: 'cache-and-network',
  });

  const debouncedRefetch = useDebounceCallback(refetch, 300);
  const hasFetched = useRef<boolean>(false);
  useEffect(() => {
    if (hasFetched.current) {
      debouncedRefetch();
    } else {
      hasFetched.current = true;
    }
  }, [debouncedRefetch, entries, subcategories]);

  const [visible, setVisible] = usePersistentState<Record<string, boolean>>({}, 'loan_visible');
  const [overrides, setOverrides] = usePersistentState<LoanOverrides>({}, 'loan_overrides');
  const loans = useMemo(
    () => getLoans(data?.netWorthLoans?.loans ?? [], visible, overrides),
    [data, visible, overrides],
  );
  return (
    <Styled.LoanView>
      {loans.length > 0 && (
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
      )}
      {!loans.length && fetching && <span>Loading...</span>}
      {!loans.length && !fetching && <span>There are no loans</span>}
    </Styled.LoanView>
  );
};
