import { DateTime, DurationUnit } from 'luxon';

import { NULL } from '~client/modules/data';

type Major = 0 | 1 | 2;
type Label = string | null;

type Tick = {
  time: number;
  major: Major;
  label: Label;
};

function timeTick(
  t0: number,
  t1: number,
  {
    start,
    measure = 'hour',
    tickSize,
    numTicks,
    getMajor,
    label = NULL,
    extra = NULL,
  }: {
    start?: DateTime;
    measure?: DurationUnit;
    tickSize: number | ((start: DateTime, index: number) => DateTime);
    numTicks?: number;
    getMajor: (time: DateTime) => Major;
    label?: (time: DateTime) => Label;
    extra?: (time: DateTime) => Tick | null;
  },
): Tick[] {
  const theStart = start ?? DateTime.fromSeconds(t0).startOf(measure);

  const actualNumTicks =
    typeof tickSize === 'number' && !numTicks ? Math.ceil((t1 - t0) / tickSize) + 1 : numTicks;

  const getTickTime =
    typeof tickSize === 'function'
      ? (index: number): DateTime => tickSize(theStart, index)
      : (index: number): DateTime => theStart.plus({ seconds: index * tickSize });

  return new Array(actualNumTicks).fill(0).reduce((ticks: Tick[], _, index): Tick[] => {
    const tickTime = getTickTime(index);
    const major = getMajor(tickTime);

    const mainTick = {
      time: tickTime.toSeconds(),
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

function timeTickMonthYear(t0: number, t1: number): Tick[] {
  const t0Date = DateTime.fromSeconds(t0);
  const { months: diff } = DateTime.fromSeconds(t1).diff(t0Date, 'months');
  const numTicks = Math.ceil(diff);

  return timeTick(t0, t1, {
    measure: 'month',
    start: t0Date.startOf('month'),
    tickSize: (start, index) => start.plus({ months: index }),
    getMajor: (time): Major => {
      const isHalfYear = (time.month - 1) % 6 === 0;
      const isNewYear = (time.month - 1) % 12 === 0;
      if (isHalfYear && isNewYear) {
        return 2;
      }
      return isHalfYear || isNewYear ? 1 : 0;
    },
    numTicks,
    label: time => {
      if (time.month === 7) {
        return 'H2';
      }

      return time.toFormat('y');
    },
  });
}

const timeTickWeekMonth = (t0: number, t1: number): Tick[] =>
  timeTick(t0, t1, {
    measure: 'week',
    tickSize: 86400 * 7,
    getMajor: () => 0,
    extra: (time: DateTime): Tick | null => {
      if (time.plus({ seconds: 86400 * 7 }).hasSame(time, 'month')) {
        return null;
      }

      const endOfMonth = time.endOf('month').plus({ seconds: 1 });

      return {
        time: Math.round(endOfMonth.toSeconds()),
        major: 2,
        label: endOfMonth.toFormat('LLL'),
      };
    },
  });

const timeTickDayWeek = (t0: number, t1: number): Tick[] =>
  timeTick(t0, t1, {
    measure: 'day',
    tickSize: 86400,
    getMajor: (time: DateTime): Major => (time.weekday === 7 ? 1 : 0),
    label: time => time.toFormat('d LLL'),
  });

function timeTickHourDay(t0: number, t1: number): Tick[] {
  const startTime = DateTime.fromSeconds(t0);
  const hourOffset = startTime.hour % 3;

  const start = startTime.startOf('hour').plus({ hours: -hourOffset });

  return timeTick(t0, t1, {
    start,
    tickSize: 3600 * 3,
    getMajor: (time: DateTime): Major => (time.hour === 0 ? 1 : 0),
    label: time => time.toFormat('ccc'),
  });
}

const timeTickMinuteHour = (t0: number, t1: number): Tick[] =>
  timeTick(t0, t1, {
    measure: 'hour',
    tickSize: 1800,
    getMajor: (time: DateTime): Major => {
      const onHour = time.minute === 0;
      const onDay = onHour && time.hour === 0;
      if (onHour && onDay) {
        return 2;
      }
      return onHour || onDay ? 1 : 0;
    },
    label: (time: DateTime): string => {
      if (time.hour === 0 && time.minute === 0) {
        return time.toFormat('ccc');
      }

      return time.toFormat('HH:mm');
    },
  });

const timeTickSecondMinute2 = (t0: number, t1: number): Tick[] =>
  timeTick(t0, t1, {
    measure: 'minute',
    tickSize: 60,
    getMajor: time => (time.minute % 10 === 0 ? 1 : 0),
    label: time => time.toLocaleString(DateTime.TIME_24_SIMPLE),
  });

const timeTickSecondMinute = (t0: number, t1: number): Tick[] =>
  timeTick(t0, t1, {
    measure: 'minute',
    tickSize: 30,
    getMajor: (time): Major => (time.second === 0 ? 1 : 0),
    label: time => time.toLocaleString(DateTime.TIME_24_SIMPLE),
  });

export function timeSeriesTicks(t0: number, t1: number): Tick[] {
  const range = t1 - t0;

  if (range < 600) {
    return timeTickSecondMinute(t0, t1);
  }
  if (range < 3600) {
    return timeTickSecondMinute2(t0, t1);
  }
  if (range < 86400 * 0.6) {
    return timeTickMinuteHour(t0, t1);
  }
  if (range < 86400 * 8) {
    return timeTickHourDay(t0, t1);
  }
  if (range < 86400 * 35) {
    return timeTickDayWeek(t0, t1);
  }
  if (range < 86400 * 35 * 12) {
    return timeTickWeekMonth(t0, t1);
  }

  return timeTickMonthYear(t0, t1);
}

export const getMonthDiff = (dateA: DateTime, dateB: DateTime): number =>
  Math.floor(dateB.diff(dateA, 'months').toObject().months ?? 0);

export const getMonthDatesList = (startDate: DateTime, endDate: DateTime): DateTime[] => {
  const numMonths = getMonthDiff(startDate, endDate) + 1;

  if (numMonths <= 1) {
    return [];
  }

  return new Array(numMonths)
    .fill(0)
    .map((_, index) => startDate.plus({ months: index }).endOf('month'));
};
