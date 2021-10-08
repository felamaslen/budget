import type { PlanningMonth } from '../types';
import { getDateFromYearAndMonth, startMonth } from '~shared/planning';

export function getSequentialMonth(month: number): number {
  return month < startMonth ? month + 12 : month;
}

export const mapPlanningMonth = (row: Pick<PlanningMonth, 'year' | 'month'>): PlanningMonth => ({
  ...row,
  date: getDateFromYearAndMonth(row.year, row.month),
});

export const mapPlanningMonths = (
  dates: Pick<PlanningMonth, 'year' | 'month'>[],
): PlanningMonth[] => dates.map<PlanningMonth>(mapPlanningMonth);
