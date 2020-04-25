import format from 'date-fns/format';
import startOfWeek from 'date-fns/startOfWeek';
import startOfMonth from 'date-fns/startOfMonth';
import startOfYear from 'date-fns/startOfYear';
import endOfWeek from 'date-fns/endOfWeek';
import endOfMonth from 'date-fns/endOfMonth';
import endOfYear from 'date-fns/endOfYear';
import addWeeks from 'date-fns/addWeeks';
import addMonths from 'date-fns/addMonths';
import addYears from 'date-fns/addYears';

import { Category, GroupBy, CategoryColumn, Period } from './types';

export function getCategoryColumn(category: Category, groupBy: GroupBy): CategoryColumn {
  if (category === Category.bills) {
    return 'item';
  }
  if (groupBy === GroupBy.category) {
    if (category === 'food' || category === 'general') {
      return 'category';
    }
    if (category === Category.social) {
      return 'society';
    }
    if (category === Category.holiday) {
      return 'holiday';
    }

    return 'item';
  }
  if (groupBy === GroupBy.shop) {
    return 'shop';
  }

  throw new Error('Invalid groupBy');
}

export type PeriodCondition = {
  startTime: Date;
  endTime: Date;
  description: string;
};

function periodConditionWeekly(now: Date, pageIndex = 0): PeriodCondition {
  const startTime = addWeeks(startOfWeek(now), -pageIndex);
  const endTime = endOfWeek(startTime);

  const description = `Week beginning ${format(startTime, 'MMMM d, YYYY')}`;

  return { startTime, endTime, description };
}

function periodConditionMonthly(now: Date, pageIndex = 0): PeriodCondition {
  const startTime = addMonths(startOfMonth(now), -pageIndex);
  const endTime = endOfMonth(startTime);

  const description = format(startTime, 'MMMM YYYY');

  return { startTime, endTime, description };
}

function periodConditionYearly(now: Date, pageIndex = 0): PeriodCondition {
  const startTime = addYears(startOfYear(now), -pageIndex);
  const endTime = endOfYear(startTime);

  const description = format(startTime, 'YYYY');

  return { startTime, endTime, description };
}

export function periodCondition(now: Date, period: Period, pageIndex = 0): PeriodCondition {
  if (period === Period.week) {
    return periodConditionWeekly(now, pageIndex);
  }
  if (period === Period.month) {
    return periodConditionMonthly(now, pageIndex);
  }
  if (period === Period.year) {
    return periodConditionYearly(now, pageIndex);
  }

  throw new Error('Invalid period parameter');
}
