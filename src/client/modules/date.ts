import addHours from 'date-fns/addHours';
import addMonths from 'date-fns/addMonths';
import addSeconds from 'date-fns/addSeconds';
import addWeeks from 'date-fns/addWeeks';
import addYears from 'date-fns/addYears';
import differenceInMonths from 'date-fns/differenceInMonths';
import differenceInYears from 'date-fns/differenceInYears';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';
import getDay from 'date-fns/getDay';
import getHours from 'date-fns/getHours';
import getMinutes from 'date-fns/getMinutes';
import getMonth from 'date-fns/getMonth';
import getSeconds from 'date-fns/getSeconds';
import getUnixTime from 'date-fns/getUnixTime';
import getYear from 'date-fns/getYear';
import isSameMonth from 'date-fns/isSameMonth';
import startOfDay from 'date-fns/startOfDay';
import startOfHour from 'date-fns/startOfHour';
import startOfISOWeek from 'date-fns/startOfISOWeek';
import startOfMinute from 'date-fns/startOfMinute';
import startOfMonth from 'date-fns/startOfMonth';

import { NULL } from '~client/modules/data';

type Major = 0 | 1 | 2;
type Label = string | null;

type Tick = {
  time: number;
  major: Major;
  label: Label;
};

type TimeTickOptions = {
  start: Date;
  tickSize: number | ((start: Date, index: number) => Date);
  numTicks?: number;
  getMajor: (time: Date) => Major;
  label?: (time: Date) => Label;
  extra?: (time: Date) => Tick | null;
};

type TimeTickFn = (t0: number, t1: number) => Tick[];

function timeTick(
  t0: number,
  t1: number,
  { start, tickSize, numTicks, getMajor, label = NULL, extra = NULL }: TimeTickOptions,
): Tick[] {
  const actualNumTicks =
    typeof tickSize === 'number' && !numTicks ? Math.ceil((t1 - t0) / tickSize) + 1 : numTicks;

  const getTickTime =
    typeof tickSize === 'function'
      ? (index: number): Date => tickSize(start, index)
      : (index: number): Date => addSeconds(start, index * tickSize);

  return Array(actualNumTicks)
    .fill(0)
    .reduce((ticks: Tick[], _, index): Tick[] => {
      const tickTime = getTickTime(index);
      const major = getMajor(tickTime);

      const mainTick = {
        time: getUnixTime(tickTime),
        major,
        label: major > 0 ? label(tickTime) : null,
      };

      const extraTick = extra(tickTime);
      if (extraTick) {
        return [...ticks, mainTick, extraTick];
      }

      return [...ticks, mainTick];
    }, []);
}

const timeTickLifetime: TimeTickFn = (t0, t1) => {
  const t0Date = fromUnixTime(t0);
  const numTicks = differenceInYears(fromUnixTime(t1), t0Date) + 1;

  return timeTick(t0, t1, {
    start: startOfMonth(t0Date),
    tickSize: (start, index) => addYears(start, index),
    getMajor: (time): Major => {
      const year = getYear(time);
      if (year % 10 === 0) {
        return 2;
      }
      if (year % 5 === 0) {
        return 1;
      }
      return 0;
    },
    numTicks,
    label: (time) => {
      if (getYear(time) % 10 === 0) {
        return format(time, 'yyyy');
      }
      return null;
    },
  });
};

function timeTickMonthYear(t0: number, t1: number): Tick[] {
  const t0Date = fromUnixTime(t0);
  const numTicks = differenceInMonths(fromUnixTime(t1), t0Date) + 1;

  return timeTick(t0, t1, {
    start: startOfMonth(t0Date),
    tickSize: (start, index) => addMonths(start, index),
    getMajor: (time): Major => {
      const isHalfYear = getMonth(time) % 6 === 0;
      const isNewYear = getMonth(time) % 12 === 0;
      if (isHalfYear && isNewYear) {
        return 2;
      }
      return isHalfYear || isNewYear ? 1 : 0;
    },
    numTicks,
    label: (time) => {
      if (getMonth(time) === 6) {
        return 'H2';
      }

      return format(time, 'yyyy');
    },
  });
}

const timeTickWeekMonth = (t0: number, t1: number): Tick[] =>
  timeTick(t0, t1, {
    start: startOfISOWeek(fromUnixTime(t0)),
    tickSize: 86400 * 7,
    getMajor: () => 0,
    extra: (time: Date): Tick | null => {
      if (isSameMonth(addWeeks(time, 1), time)) {
        return null;
      }

      const endDate = addSeconds(endOfMonth(time), 2);

      return {
        time: getUnixTime(endDate),
        major: 2,
        label: format(endDate, 'LLL'),
      };
    },
  });

const timeTickDayWeek = (t0: number, t1: number): Tick[] =>
  timeTick(t0, t1, {
    start: startOfDay(fromUnixTime(t0)),
    tickSize: 86400,
    getMajor: (time: Date): Major => (getDay(time) === 0 ? 1 : 0),
    label: (time) => format(time, 'd LLL'),
  });

function timeTickHourDay(t0: number, t1: number): Tick[] {
  const startTime = fromUnixTime(t0);
  const hourOffset = getHours(startTime) % 3;

  const start = addHours(startOfHour(startTime), -hourOffset);

  return timeTick(t0, t1, {
    start,
    tickSize: 3600 * 3,
    getMajor: (time: Date): Major => (getHours(time) === 0 ? 1 : 0),
    label: (time) => format(time, 'ccc'),
  });
}

const timeTickMinuteHour = (t0: number, t1: number): Tick[] =>
  timeTick(t0, t1, {
    start: startOfHour(fromUnixTime(t0)),
    tickSize: 1800,
    getMajor: (time: Date): Major => {
      const onHour = getMinutes(time) === 0;
      const onDay = onHour && getHours(time) === 0;
      if (onHour && onDay) {
        return 2;
      }
      return onHour || onDay ? 1 : 0;
    },
    label: (time: Date): string => {
      if (getHours(time) === 0 && getMinutes(time) === 0) {
        return format(time, 'ccc');
      }

      return format(time, 'HH:mm');
    },
  });

const timeTickSecondMinuteLarge = (t0: number, t1: number): Tick[] =>
  timeTick(t0, t1, {
    start: startOfMinute(fromUnixTime(t0)),
    tickSize: 60,
    getMajor: (time) => (getMinutes(time) % 10 === 0 ? 1 : 0),
    label: (time) => format(time, 'HH:mm'),
  });

const timeTickSecondMinuteSmall = (t0: number, t1: number): Tick[] =>
  timeTick(t0, t1, {
    start: startOfMinute(fromUnixTime(t0)),
    tickSize: 30,
    getMajor: (time): Major => (getSeconds(time) === 0 ? 1 : 0),
    label: (time) => format(time, 'HH:mm'),
  });

const tenMinutes = 60 * 10;
const oneHour = 60 * 60;
const overOneDay = 86400 * 0.6;
const overOneWeek = 86400 * 8;
const overOneMonth = 86400 * 35;
const overOneYear = 86400 * 35 * 12;
const overOneDecade = 86400 * 365 * 10.1;

export function timeSeriesTicks(t0: number, t1: number): Tick[] {
  const range = t1 - t0;

  if (range < tenMinutes) {
    return timeTickSecondMinuteSmall(t0, t1);
  }
  if (range < oneHour) {
    return timeTickSecondMinuteLarge(t0, t1);
  }
  if (range < overOneDay) {
    return timeTickMinuteHour(t0, t1);
  }
  if (range < overOneWeek) {
    return timeTickHourDay(t0, t1);
  }
  if (range < overOneMonth) {
    return timeTickDayWeek(t0, t1);
  }
  if (range < overOneYear) {
    return timeTickWeekMonth(t0, t1);
  }
  if (range < overOneDecade) {
    return timeTickMonthYear(t0, t1);
  }
  return timeTickLifetime(t0, t1);
}

export const inclusiveMonthDifference = (startDate: Date, endDate: Date): number =>
  differenceInMonths(endDate, startOfMonth(startDate)) + 1;

export const getMonthDatesList = (startDate: Date, endDate: Date): Date[] => {
  const numMonths = inclusiveMonthDifference(startDate, endDate);
  if (numMonths <= 1) {
    return [];
  }

  return Array(numMonths)
    .fill(0)
    .map((_, index) => endOfMonth(addMonths(startDate, index)));
};
