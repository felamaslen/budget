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

function calculateTaxCalculationValues(
  taxableIncome: number,
  taxCode: string,
  basicAllowance: number,
  additionalThreshold: number,
): {
  basic: number;
  higher: number;
  additional: number;
} {
  const taxFreeAllowanceYearly = getTaxFreeAllowance(taxCode);
  const taxFreeAllowanceMonthly = Math.round(taxFreeAllowanceYearly / 12);
  return {
    basic: Math.min(
      Math.round(basicAllowance / 12),
      Math.max(0, taxableIncome - taxFreeAllowanceMonthly),
    ),
    higher: Math.max(
      0,
      Math.min(Math.round(additionalThreshold / 12), taxableIncome) -
        Math.round((taxFreeAllowanceYearly + basicAllowance) / 12),
    ),
    additional: Math.max(0, taxableIncome - Math.round(additionalThreshold / 12)),
  };
}

export function calculateMonthlyIncomeTax(
  taxableIncome: number,
  taxCode: string,
  basicAllowance: number,
  additionalThreshold: number,
  basicRate: number,
  higherRate: number,
  additionalRate: number,
): number {
  const { basic, higher, additional } = calculateTaxCalculationValues(
    taxableIncome,
    taxCode,
    basicAllowance,
    additionalThreshold,
  );

  const basicTaxPaid = basic * basicRate;
  const higherTaxPaid = higher * higherRate;
  const additionalTaxPaid = additional * additionalRate;

  return Math.round(basicTaxPaid + higherTaxPaid + additionalTaxPaid);
}

export function calculateMonthlyTaxRelief(
  taxableIncome: number,
  taxCode: string,
  taxDeductions: number, // i.e. private pension contribution
  basicAllowance: number,
  additionalThreshold: number,
  basicRate: number,
  higherRate: number,
  additionalRate: number,
): number {
  const { basic, higher, additional } = calculateTaxCalculationValues(
    taxableIncome,
    taxCode,
    basicAllowance,
    additionalThreshold,
  );

  const additionalTaxRelief = Math.min(additional, taxDeductions) * additionalRate;
  const higherTaxRelief = Math.min(higher, Math.max(0, taxDeductions - additional)) * higherRate;
  const basicTaxRelief =
    Math.min(basic, Math.max(0, taxDeductions - higher - additional)) * basicRate;

  return Math.round(basicTaxRelief + higherTaxRelief + additionalTaxRelief);
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
