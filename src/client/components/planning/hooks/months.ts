import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import { useMemo } from 'react';

import type { PlanningMonth } from '../types';

import {
  getDateFromYearAndMonth,
  getFinancialYearFromYearMonth,
  startMonth,
} from '~shared/planning';

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
