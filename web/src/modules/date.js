/**
 * Date functions and classes
 */

import { DateTime } from 'luxon';

function timeTick(t0, t1, { start, measure, tickSize, numTicks, getMajor, label, extra }) {
    const theStart = start || DateTime.fromJSDate(new Date(t0 * 1000)).startOf(measure);

    const theNumTicks = numTicks || Math.ceil((t1 - t0) / tickSize) + 1;

    const getTickTime = typeof tickSize === 'function'
        ? index => tickSize(theStart, index)
        : index => theStart.plus({ seconds: index * tickSize });

    return new Array(theNumTicks).fill(0)
        .reduce((ticks, tick, index) => {
            const tickTime = getTickTime(index);
            const major = getMajor(tickTime);

            const mainTick = { time: tickTime.ts / 1000, major, label: major > 0 && label(tickTime) };

            if (extra) {
                const extraTick = extra(tickTime);
                if (extraTick) {
                    return ticks.concat([mainTick, extraTick]);
                }
            }

            return [...ticks, mainTick];

        }, []);
}

function timeTickMonthYear(t0, t1) {
    const t0Date = DateTime.fromJSDate(new Date(t0 * 1000));
    const { months: diff } = DateTime.fromJSDate(new Date(t1 * 1000)).diff(t0Date, 'months');
    const numTicks = Math.ceil(diff);

    return timeTick(t0, t1, {
        measure: 'month',
        start: t0Date.startOf('month'),
        tickSize: (start, index) => start.plus({ months: index }),
        getMajor: time => (((time.month - 1) % 6 === 0) >> 0) + (((time.month - 1) % 12 === 0) >> 0),
        numTicks,
        label: time => {
            if (time.month === 7) {
                return 'H2';
            }

            return time.toFormat('y');
        }
    });
}
function timeTickWeekMonth(t0, t1) {
    return timeTick(t0, t1, {
        measure: 'week',
        tickSize: 86400 * 7,
        getMajor: () => 0,
        label: () => false,
        extra: time => {
            if (time.plus({ seconds: 86400 * 7 }).hasSame(time, 'month')) {
                return null;
            }

            const endOfMonth = time.endOf('month').plus({ seconds: 1 });

            return { time: Math.round(endOfMonth.ts / 1000), major: 2, label: endOfMonth.toFormat('LLL') };
        }
    });
}

function timeTickDayWeek(t0, t1) {
    return timeTick(t0, t1, {
        measure: 'day',
        tickSize: 86400,
        getMajor: time => (time.weekday === 7) >> 0,
        label: time => time.toFormat('d LLL')
    });
}
function timeTickHourDay(t0, t1) {
    const startTime = DateTime.fromJSDate(new Date(t0 * 1000));
    const hourOffset = startTime.hour % 3;

    const start = startTime.startOf('hour').plus({ hours: -hourOffset });

    return timeTick(t0, t1, {
        start,
        tickSize: 3600 * 3,
        getMajor: time => (time.hour === 0) >> 0,
        label: time => time.toFormat('ccc')
    });
}
function timeTickMinuteHour(t0, t1) {
    return timeTick(t0, t1, {
        measure: 'hour',
        tickSize: 1800,
        getMajor: time => ((time.minute === 0) >> 0) + ((time.hour === 0 && time.minute === 0) >> 0),
        label: time => {
            if (time.hour === 0) {
                return time.toFormat('ccc');
            }

            return time.toFormat('HH:mm');
        }
    });
}
function timeTickSecondMinute2(t0, t1) {
    return timeTick(t0, t1, {
        measure: 'minute',
        tickSize: 60,
        getMajor: time => (time.minute % 10 === 0) >> 0,
        label: time => time.toLocaleString(DateTime.TIME_24_SIMPLE)
    });
}
function timeTickSecondMinute(t0, t1) {
    return timeTick(t0, t1, {
        measure: 'minute',
        tickSize: 30,
        getMajor: time => (time.second === 0) >> 0,
        label: time => time.toLocaleString(DateTime.TIME_24_SIMPLE)
    });
}

export function timeSeriesTicks(t0, t1) {
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
