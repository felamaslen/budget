import isAfter from 'date-fns/isAfter';

import type { AccountCreditCardPayment, CreditCardRecord, PlanningMonth, State } from '../types';
import { mapPlanningMonth } from './calculations';
import { Average } from '~client/constants';
import { arrayAverage } from '~client/modules/data';
import type { NetWorthSubcategory } from '~client/types/gql';

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

export function getCreditCardRecords(
  accounts: State['accounts'],
  creditCards: NetWorthSubcategory[],
): CreditCardRecord[] {
  return creditCards.map<CreditCardRecord>((card) => ({
    netWorthSubcategoryId: card.id,
    name: card.subcategory,
    lastRecordedPayment: mapPlanningMonth(
      accounts.reduce<Pick<PlanningMonth, 'year' | 'month'>>(
        (last, account) =>
          account.creditCards
            .find((compare) => compare.netWorthSubcategoryId === card.id)
            ?.payments.reduce<Pick<PlanningMonth, 'year' | 'month'>>(
              (next, payment) =>
                payment.year > next.year ||
                (payment.year === next.year && payment.month > next.month)
                  ? { year: payment.year, month: payment.month }
                  : next,
              last,
            ) ?? last,
        { year: 0, month: 0 },
      ),
    ),
    averageRecordedPayment:
      arrayAverage(
        accounts.reduce<number[]>(
          (last, account) =>
            (
              account.creditCards.find((compare) => compare.netWorthSubcategoryId === card.id)
                ?.payments ?? []
            ).reduce<number[]>((next, payment) => [...next, payment.value], last),
          [],
        ),
        Average.Median,
      ) || undefined,
  }));
}
