import endOfMonth from 'date-fns/endOfMonth';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';

import { startMonth } from '../constants';
import type { PlanningMonth } from '../types';

export function getFinancialYearFromYearMonth(year: number, month: number): number {
  return year + (month < startMonth ? -1 : 0);
}

export function getFinancialYear(date: Date): number {
  return getFinancialYearFromYearMonth(getYear(date), getMonth(date));
}

export function getDateFromYearAndMonth(year: number, month: number): Date {
  return endOfMonth(new Date(year, month));
}

export const mapPlanningMonth = (row: Pick<PlanningMonth, 'year' | 'month'>): PlanningMonth => ({
  ...row,
  date: getDateFromYearAndMonth(row.year, row.month),
});

export const mapPlanningMonths = (
  dates: Pick<PlanningMonth, 'year' | 'month'>[],
): PlanningMonth[] => dates.map<PlanningMonth>(mapPlanningMonth);

function getTaxFreeAllowance(taxCode: string): number {
  if (taxCode === 'OT') {
    return 0;
  }
  const match = taxCode.match(/^(\d+)L$/);
  if (!match) {
    return 0;
  }
  return 10 * Number(match[1]) * 100;
}

export function calculateMonthlyIncomeTax(
  taxableIncome: number,
  taxCode: string,
  pensionContrib: number,
  basicAllowance: number,
  additionalThreshold: number,
  basicRate: number,
  higherRate: number,
  additionalRate: number,
): {
  tax: number;
  pensionTaxRelief: number;
} {
  const taxFreeAllowanceYearly = getTaxFreeAllowance(taxCode);
  const taxFreeAllowanceMonthly = Math.round(taxFreeAllowanceYearly / 12);
  const taxedAtBasicRate = Math.min(
    Math.round(basicAllowance / 12),
    Math.max(0, taxableIncome - taxFreeAllowanceMonthly),
  );
  const taxedAtHigherRate = Math.max(
    0,
    Math.min(Math.round(additionalThreshold / 12), taxableIncome) -
      Math.round((taxFreeAllowanceYearly + basicAllowance) / 12),
  );
  const taxedAtAdditionalRate = Math.max(0, taxableIncome - Math.round(additionalThreshold / 12));

  const basicTaxPaid = taxedAtBasicRate * basicRate;
  const higherTaxPaid = taxedAtHigherRate * higherRate;
  const additionalTaxPaid = taxedAtAdditionalRate * additionalRate;

  const additionalPensionTaxRelief =
    Math.min(taxedAtAdditionalRate, pensionContrib) * additionalRate;
  const higherPensionTaxRelief =
    Math.min(taxedAtHigherRate, Math.max(0, pensionContrib - taxedAtAdditionalRate)) * higherRate;
  const basicPensionTaxRelief =
    Math.min(
      taxedAtBasicRate,
      Math.max(0, pensionContrib - taxedAtHigherRate - taxedAtAdditionalRate),
    ) * basicRate;

  return {
    tax: Math.round(basicTaxPaid + higherTaxPaid + additionalTaxPaid),
    pensionTaxRelief: Math.round(
      basicPensionTaxRelief + higherPensionTaxRelief + additionalPensionTaxRelief,
    ),
  };
}

export function calculateMonthlyNIContributions(
  taxableIncome: number,
  paymentThreshold: number,
  upperEarningsLimit: number,
  lowerRate: number,
  higherRate: number,
): number {
  return Math.round(
    Math.max(0, Math.min(taxableIncome, upperEarningsLimit) - paymentThreshold) * lowerRate +
      Math.max(0, taxableIncome - upperEarningsLimit) * higherRate,
  );
}

export function calculateMonthlyStudentLoanRepayment(
  taxableIncome: number,
  rate: number,
  threshold: number,
): number {
  return Math.round(Math.max(0, rate * (taxableIncome - threshold)));
}
