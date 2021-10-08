import type { AccountCreditCardPayment, CreditCardRecord, PlanningMonth, State } from '../types';
import { getSequentialMonth } from './calculations';
import type { NetWorthSubcategory } from '~client/types/gql';

export function getCreditCardsForAccountAtMonth(
  creditCards: CreditCardRecord[],
  { month }: PlanningMonth,
  account: State['accounts'][0],
): AccountCreditCardPayment[] {
  return account.creditCards
    .map<AccountCreditCardPayment | undefined>((row) => {
      const cardRecord = creditCards.find(
        (compare) => compare.netWorthSubcategoryId === row.netWorthSubcategoryId,
      );
      if (!cardRecord) {
        return undefined;
      }
      const existingPayment = row.payments.find((compare) => compare.month === month);

      return {
        netWorthSubcategoryId: row.netWorthSubcategoryId,
        name: cardRecord.name,
        value:
          existingPayment?.value ??
          (getSequentialMonth(month) > cardRecord.lastRecordedPaymentMonth
            ? row.predictedPayment ?? undefined
            : undefined),
        isVerified: !!existingPayment,
      };
    })
    .filter((p): p is AccountCreditCardPayment => !!p);
}

export function getCreditCardRecords(
  accounts: State['accounts'],
  creditCards: NetWorthSubcategory[],
): CreditCardRecord[] {
  return creditCards.map<CreditCardRecord>((card) => ({
    netWorthSubcategoryId: card.id,
    name: card.subcategory,
    lastRecordedPaymentMonth: accounts.reduce<number>(
      (max0, account) =>
        account.creditCards
          .find((compare) => compare.netWorthSubcategoryId === card.id)
          ?.payments.reduce<number>(
            (max1, payment) => Math.max(getSequentialMonth(payment.month), max1),
            max0,
          ) ?? max0,
      -1,
    ),
  }));
}
