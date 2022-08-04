import { addYears, addMonths, startOfYear } from 'date-fns';

import { FundPeriod, Maybe } from '~api/types';

export function getMaxAge(
  now: Date,
  minPossibleTime = new Date(0),
  period?: Maybe<FundPeriod>,
  length?: Maybe<number>,
): Date {
  if (period === FundPeriod.Ytd) {
    return startOfYear(now);
  }
  if (!length) {
    return minPossibleTime;
  }
  if (period === FundPeriod.Month) {
    return addMonths(now, -length);
  }
  return addYears(now, -length);
}
