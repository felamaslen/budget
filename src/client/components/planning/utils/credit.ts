import isAfter from 'date-fns/isAfter';

import type { AccountCreditCardPayment, CreditCardRecord, PlanningMonth, State } from '../types';

function predictCreditCardPayment(
  cardRecord: CreditCardRecord,
  canPredictMonth: boolean,
): number | undefined {
  if (!canPredictMonth) {
    return undefined;
  }
  return cardRecord.averageRecordedPayment;
}

export function getCreditCardsForAccountAtMonth(
  creditCards: CreditCardRecord[],
  { year, month, date }: PlanningMonth,
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
      const existingPayment = row.payments.find(
        (compare) => compare.year === year && compare.month === month,
      );

      return {
        netWorthSubcategoryId: row.netWorthSubcategoryId,
        name: cardRecord.name,
        value:
          existingPayment?.value ??
          predictCreditCardPayment(cardRecord, isAfter(date, cardRecord.lastRecordedPayment.date)),
        isVerified: !!existingPayment,
      };
    })
    .filter((p): p is AccountCreditCardPayment => !!p);
}
