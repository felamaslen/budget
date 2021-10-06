import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { numYearsToPlan } from '../constants';
import { getFinancialYear } from '../utils';
import { useToday } from '~client/hooks';
import { getStartDate } from '~client/selectors';

export function useYearOptions(): number[] {
  const today = useToday();
  const startDate = useSelector(getStartDate);
  const startFinancialYear = getFinancialYear(startDate);

  return useMemo<number[]>(
    () =>
      Array(Math.max(0, getFinancialYear(today) - startFinancialYear + 1 + numYearsToPlan))
        .fill(0)
        .map((_, index) => startFinancialYear + index),
    [startFinancialYear, today],
  );
}

export function useYear(year: string | undefined): number {
  const today = useToday();
  const options = useYearOptions();

  return useMemo<number>(() => {
    if (year) {
      return Math.min(options[options.length - 1], Math.max(options[0], Number(year) || 0));
    }
    return getFinancialYear(today);
  }, [today, options, year]);
}
