export const startMonth = 3; // April - start of FY
export const numYearsToPlan = 5;

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
