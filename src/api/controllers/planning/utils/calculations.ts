import type { CalculationRows } from '../types';

import type { ParameterRow } from '~api/queries/planning';
import { StandardRates, StandardThresholds } from '~shared/planning';

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

export function calculateYearlyTaxRelief(
  taxableIncome: number,
  taxCode: string,
  taxDeductions: number, // i.e. private pension contribution
  basicAllowance: number,
  additionalThreshold: number,
  basicRate: number,
  higherRate: number,
  additionalRate: number,
): number {
  const taxFreeAllowance = getTaxFreeAllowance(taxCode);

  const basic = Math.min(basicAllowance, Math.max(0, taxableIncome - taxFreeAllowance));
  const higher = Math.max(
    0,
    Math.min(additionalThreshold, taxableIncome) - (taxFreeAllowance + basicAllowance),
  );
  const additional = Math.max(0, taxableIncome - additionalThreshold);

  const additionalTaxRelief = Math.min(additional, taxDeductions) * additionalRate;
  const higherTaxRelief = Math.min(higher, Math.max(0, taxDeductions - additional)) * higherRate;
  const basicTaxRelief =
    Math.min(basic, Math.max(0, taxDeductions - higher - additional)) * basicRate;

  return basicTaxRelief + higherTaxRelief + additionalTaxRelief;
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

const getParameterForYear = (
  rows: readonly ParameterRow[],
  year: number,
  name: string,
): number | undefined =>
  rows.find((compare) => compare.year === year && compare.name === name)?.value;

export function calculateTaxForFutureIncome(
  { thresholdRows, rateRows }: Pick<CalculationRows, 'rateRows' | 'thresholdRows'>,
  taxableIncome: number,
  taxCode: string,
  year: number,
): number {
  const taxBasicAllowance = getParameterForYear(
    thresholdRows,
    year,
    StandardThresholds.IncomeTaxBasicAllowance,
  );
  const taxAdditionalThreshold = getParameterForYear(
    thresholdRows,
    year,
    StandardThresholds.IncomeTaxAdditionalThreshold,
  );
  const taxBasicRate = getParameterForYear(rateRows, year, StandardRates.IncomeTaxBasicRate);
  const taxHigherRate = getParameterForYear(rateRows, year, StandardRates.IncomeTaxHigherRate);
  const taxAdditionalRate = getParameterForYear(
    rateRows,
    year,
    StandardRates.IncomeTaxAdditionalRate,
  );

  return calculateMonthlyIncomeTax(
    taxableIncome,
    taxCode,
    taxBasicAllowance ?? 0,
    taxAdditionalThreshold ?? 0,
    taxBasicRate ?? 0,
    taxHigherRate ?? 0,
    taxAdditionalRate ?? 0,
  );
}

export function calculateNIForFutureIncome(
  { thresholdRows, rateRows }: Pick<CalculationRows, 'rateRows' | 'thresholdRows'>,
  taxableIncome: number,
  year: number,
): number {
  const paymentThreshold = getParameterForYear(thresholdRows, year, StandardThresholds.NIPT);
  const upperEarningsLimit = getParameterForYear(thresholdRows, year, StandardThresholds.NIUEL);
  const lowerRate = getParameterForYear(rateRows, year, StandardRates.NILowerRate);
  const higherRate = getParameterForYear(rateRows, year, StandardRates.NIHigherRate);

  return calculateMonthlyNIContributions(
    taxableIncome,
    paymentThreshold ?? 0,
    upperEarningsLimit ?? 0,
    lowerRate ?? 0,
    higherRate ?? 0,
  );
}

export function calculateStudentLoanForFutureIncome(
  { thresholdRows, rateRows }: Pick<CalculationRows, 'rateRows' | 'thresholdRows'>,
  taxableIncome: number,
  year: number,
): number {
  const studentLoanThreshold = getParameterForYear(
    thresholdRows,
    year,
    StandardThresholds.StudentLoanThreshold,
  );
  const studentLoanRate = getParameterForYear(rateRows, year, StandardRates.StudentLoanRate);

  return calculateMonthlyStudentLoanRepayment(
    taxableIncome,
    studentLoanRate ?? 0,
    Math.floor(studentLoanThreshold ?? 0) / 12,
  );
}
