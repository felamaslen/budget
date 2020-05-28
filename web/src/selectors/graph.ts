import getUnixTime from 'date-fns/getUnixTime';
import { createSelector } from 'reselect';

import { getProcessedCost, getFutureMonths, getMonthDates } from './overview';
import { State } from '~client/reducers';
import { Target, CostProcessed } from '~client/types';

const targetPeriods = [
  { last: 3, months: 12, tag: '1y' },
  { last: 6, months: 36, tag: '3y' },
  { last: 12, months: 60, tag: '5y' },
];

export const getTargets = createSelector<State, CostProcessed, number, Date[], Target[]>(
  getProcessedCost,
  getFutureMonths,
  getMonthDates,
  ({ netWorthCombined, netWorth }, futureMonths, dates) => {
    const values = [
      netWorthCombined[netWorthCombined.length - 1 - futureMonths],
      ...netWorth.slice(0, -(futureMonths + 1)).reverse(),
    ];

    return targetPeriods.map(({ last, months, tag }) => {
      const index =
        ((-(futureMonths + last) % netWorth.length) + netWorth.length) % netWorth.length;

      const from = netWorth[index];

      const date = getUnixTime(dates[index]);

      const value = from + (values[0] - from) * ((months + last) / (last - 1));

      return {
        date,
        from,
        months,
        last,
        tag,
        value,
      };
    });
  },
);
