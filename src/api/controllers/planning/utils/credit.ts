import type { AverageCreditCardPaymentRow } from '~api/queries/planning';

export function getComputedCreditCardPayments(
  averageCreditCardPaymentRows: readonly AverageCreditCardPaymentRow[],
): Record<number, number> {
  return averageCreditCardPaymentRows.reduce<Record<number, number>>(
    (last, row) => ({ ...last, [row.credit_card_id]: row.value }),
    {},
  );
}
