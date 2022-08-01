import { addYears, addMonths, startOfYear } from 'date-fns';

import { FundPeriod, Maybe } from '~api/types';

export function getMaxAge(now: Date, period?: Maybe<FundPeriod>, length?: Maybe<number>): Date {
  if (period === FundPeriod.Ytd) {
    return startOfYear(now);
  }
  if (!length) {
    return new Date(0);
  }
  if (period === FundPeriod.Month) {
    return addMonths(now, -length);
  }
  return addYears(now, -length);
}
