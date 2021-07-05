// Loan functions
export const forecastCompoundedReturns = (
  initialValue: number,
  numPeriods: number,
  payment: number,
  interestRateYearly: number,
): number =>
  Array(numPeriods)
    .fill(0)
    .reduce<number>((last) => last * (1 + interestRateYearly) ** (1 / 12) + payment, initialValue);

export function forecastTotalLoanPayable(
  initialValue: number,
  monthlyPayment: number,
  interestRateYearly: number,
): number {
  if (monthlyPayment >= initialValue) {
    return initialValue;
  }
  const remainingDebt = Math.round(
    (initialValue - monthlyPayment) * (1 + interestRateYearly) ** (1 / 12),
  );
  if (remainingDebt >= initialValue) {
    return Infinity; // monthly payment is too low to repay the debt
  }
  return (
    monthlyPayment + forecastTotalLoanPayable(remainingDebt, monthlyPayment, interestRateYearly)
  );
}
