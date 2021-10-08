import { evaluateInfix } from 'calculator-lib';
import endOfMonth from 'date-fns/endOfMonth';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import type { PlanningTaxRateInput, PlanningTaxThresholdInput } from '~api/types';

export const startMonth = 3; // April - start of FY

export const enum ComputedTransactionName {
  GrossIncome = 'Salary',
  IncomeTax = 'Income tax',
  NI = 'NI',
  Pension = 'Pension (SalSac)',
  StudentLoan = 'Student loan',
}

export const enum StandardRates {
  IncomeTaxBasicRate = 'IncomeTaxBasicRate',
  IncomeTaxHigherRate = 'IncomeTaxHigherRate',
  IncomeTaxAdditionalRate = 'IncomeTaxAdditionalRate',
  NILowerRate = 'NILowerRate',
  NIHigherRate = 'NIHigherRate',
  StudentLoanRate = 'StudentLoanRate',
}

export const enum StandardThresholds {
  IncomeTaxBasicAllowance = 'IncomeTaxBasicAllowance',
  IncomeTaxAdditionalThreshold = 'IncomeTaxAdditionalThreshold',
  NIPT = 'NIPT',
  NIUEL = 'NIUEL',
  StudentLoanThreshold = 'StudentLoanThreshold',
}

export const enum StandardTransactions {
  Investments = 'Investments',
  SIPP = 'Pension (SIPP)',
}

export type IncomeRates = {
  taxBasicRate: number;
  taxHigherRate: number;
  taxAdditionalRate: number;
  taxBasicAllowance: number;
  taxAdditionalThreshold: number;
  niPaymentThreshold: number;
  niUpperEarningsLimit: number;
  niLowerRate: number;
  niHigherRate: number;
  studentLoanRate: number;
  studentLoanThreshold: number;
};

type ParametersForYear = {
  rates: PlanningTaxRateInput[];
  thresholds: PlanningTaxThresholdInput[];
};

export function getIncomeRatesForYear({ rates, thresholds }: ParametersForYear): IncomeRates {
  return {
    taxBasicRate: rates.find((rate) => rate.name === StandardRates.IncomeTaxBasicRate)?.value ?? 0,
    taxHigherRate:
      rates.find((rate) => rate.name === StandardRates.IncomeTaxHigherRate)?.value ?? 0,
    taxAdditionalRate:
      rates.find((rate) => rate.name === StandardRates.IncomeTaxAdditionalRate)?.value ?? 0,
    taxBasicAllowance:
      thresholds.find((threshold) => threshold.name === StandardThresholds.IncomeTaxBasicAllowance)
        ?.value ?? 0,
    taxAdditionalThreshold:
      thresholds.find(
        (threshold) => threshold.name === StandardThresholds.IncomeTaxAdditionalThreshold,
      )?.value ?? 0,

    niLowerRate: rates.find((rate) => rate.name === StandardRates.NILowerRate)?.value ?? 0,
    niHigherRate: rates.find((rate) => rate.name === StandardRates.NIHigherRate)?.value ?? 0,

    niPaymentThreshold:
      thresholds.find((threshold) => threshold.name === StandardThresholds.NIPT)?.value ?? 0,
    niUpperEarningsLimit:
      thresholds.find((threshold) => threshold.name === StandardThresholds.NIUEL)?.value ?? 0,

    studentLoanRate: rates.find((rate) => rate.name === StandardRates.StudentLoanRate)?.value ?? 0,
    studentLoanThreshold:
      thresholds.find((rate) => rate.name === StandardThresholds.StudentLoanThreshold)?.value ?? 0,
  };
}

export function evaluatePlanningValue(
  value: number | null,
  formula: string | null,
): number | undefined {
  return formula ? Math.round(evaluateInfix(formula) * 100) : value ?? undefined;
}

export function getFinancialYearFromYearMonth(year: number, month: number): number {
  return year + (month < startMonth ? -1 : 0);
}

export function getFinancialYear(date: Date): number {
  return getFinancialYearFromYearMonth(getYear(date), getMonth(date));
}

export function getDateFromYearAndMonth(financialYear: number, month: number): Date {
  const year = financialYear - (month < startMonth ? -1 : 0);
  return endOfMonth(new Date(year, month));
}
