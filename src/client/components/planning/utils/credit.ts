import type { AccountCreditCardPayment, PlanningData, PlanningMonth, State } from '../types';

import { Average } from '~client/constants';
import { arrayAverage } from '~client/modules/data';
import type { NetWorthSubcategory } from '~client/types/gql';

function predictCreditCardPayment(
  accumulator: PlanningData[],
  accountIndex: number,
  creditCardNetWorthSubcategoryId: number,
): number | undefined {
  const existingValues = accumulator
    .map<number | undefined>(
      (row) =>
        row.accounts[accountIndex].creditCards.find(
          (compare) =>
            compare.netWorthSubcategoryId === creditCardNetWorthSubcategoryId && compare.isVerified,
        )?.value,
    )
    .filter((v): v is number => typeof v !== 'undefined');

  return existingValues.length ? arrayAverage(existingValues, Average.Median) : undefined;
}

export function getCreditCardsForAccountAtMonth(
  accumulator: PlanningData[],
  creditCards: NetWorthSubcategory[],
  { year, month }: PlanningMonth,
  accounts: State['accounts'],
  index: number,
): AccountCreditCardPayment[] {
  return accounts[index].creditCards.map<AccountCreditCardPayment>((row) => {
    const existingPayment = row.payments.find(
      (compare) => compare.year === year && compare.month === month,
    );

    return {
      netWorthSubcategoryId: row.netWorthSubcategoryId,
      name:
        creditCards.find((compare) => compare.id === row.netWorthSubcategoryId)?.subcategory ??
        'Unknown',
      value:
        existingPayment?.value ??
        predictCreditCardPayment(accumulator, index, row.netWorthSubcategoryId),
      isVerified: !!existingPayment,
    };
  });
}
