import type { Transaction } from '~api/types';

export function calculateTransactionCost({ units, price, fees, taxes, drip }: Transaction): number {
  return (drip ? 0 : units * price) + fees + taxes;
}
