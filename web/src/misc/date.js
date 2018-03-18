/**
 * Date functions and classes
 */

import { DateTime } from 'luxon';
import { MONTHS_SHORT, WEEK_DAYS } from '../constants';

export function getNow() {
    if (process.env.NODE_ENV === 'test') {
        return DateTime.fromISO('2018-01-22');
    }

    return DateTime.local();
}

export function yearMonthDifference([year1, month1], [year2, month2]) {
    return 12 * (year2 - year1) + month2 - month1;
}

function pmod(number, denominator) {
    return ((number % denominator) + denominator) % denominator;
}

export function dateInput(input = null, validate = true) {
    // get a DateTime object from something like "10/11" or just "3", for quick insertion of data

    if (!validate) {
        return DateTime.fromISO(input);
    }

    const now = getNow();

    if (input && input.match(/^[0-9]{1,2}(\/[0-9]{1,2}(\/[0-9]{2,4})?)?$/)) {
        const [day, monthInput, yearShort] = input.split('/');

        let year = now.year;
        if (yearShort) {
            if (yearShort.length === 2) {
                year = Number(`20${yearShort}`);
            }
            else {
                year = Number(yearShort);
            }
        }

        const month = Number(monthInput) || now.month;

        return DateTime.fromObject({ year, month, day: Number(day) });
    }

    if (validate) {
        return null;
    }

    return now;
}

class TimeTick {
    constructor() {
        this.tick = 86400;
        this.major = 7;
    }
    start(obj) {
        const year = obj.getFullYear();
        const month = obj.getMonth();
        const date = obj.getDate();

        const day = obj.getDay();

        return {
            time: new Date(year, month, date, 0, 0, 0, 0).getTime() + 86400,
            index: day
        };
    }
    next(key, time) {
        const nextTime = time - this.tick * 1000;

        const major = key % this.major === 0
            ? 2
            : 0;

        const label = major
            ? this.label(time)
            : null;

        return { time, nextTime, major, label };
    }
    label(time) {
        const obj = new Date(time);

        const date = obj.getDate();
        const month = MONTHS_SHORT[obj.getMonth()];

        return `${date} ${month}`;
    }
    genTicks(t0, t1) {
        const ticks = [];
        const start = this.start(new Date(t1));
        for (let key = start.index, time = start.time; time >= t0; key--) {
            const next = this.next(key, time);
            const tick = {
                time: next.time / 1000,
                major: next.major
            };
            if (next.label) {
                tick.label = next.label;
            }
            ticks.push(tick);
            time = next.nextTime;

            if (next.extra) {
                // extra tick
                const extraTick = {
                    time: next.extra.time / 1000,
                    major: next.extra.major
                };
                if (next.extra.label) {
                    extraTick.label = next.extra.label;
                }
                ticks.push(extraTick);
            }
        }

        return ticks;
    }
}
class TimeTickDayWeek extends TimeTick {
}
class TimeTickHourDay extends TimeTick {
    constructor() {
        super();
        this.tick = 3600 * 3;
        this.major = 8;
    }
    start(dateTime) {
        const year = dateTime.getFullYear();
        const month = dateTime.getMonth();
        const date = dateTime.getDate();
        const hour = Math.ceil(dateTime.getHours() / 3) * 3;

        return {
            time: new Date(year, month, date, hour, 0, 0, 0).getTime(),
            index: hour / 3
        };
    }
    label(time) {
        return WEEK_DAYS[new Date(time).getDay()];
    }
}
class TimeTickMinuteHour extends TimeTick {
    constructor() {
        super();
        this.tick = 1800000;
        this.major = 3; // every x *hours*
        this.startMinute = 60 * this.tick / 3600000;
    }
    start(dateTime) {
        const year = dateTime.getFullYear();
        const month = dateTime.getMonth();
        const date = dateTime.getDate();
        const hour = dateTime.getHours();
        const minute = Math.floor(dateTime.getMinutes() / this.startMinute) * this.startMinute;

        return {
            time: new Date(year, month, date, hour, minute, 0, 0).getTime(),
            index: Math.round(hour * 2 + minute / this.startMinute)
        };
    }
    getMajor(key) {
        if (pmod(key, 2) === 0) {
            if (pmod(key, 48) === 0) {
                return 2;
            }

            return 1;
        }

        return 0;
    }
    next(key, time) {
        const major = this.getMajor(key);
        const label = pmod(key, 2) === 0
            ? this.label(time)
            : null;

        const nextTime = time - this.tick;

        return { time, nextTime, major, label };
    }
    label(time) {
        const dateTime = new Date(time);
        const hour = dateTime.getHours();

        if (hour === 0) {
            return WEEK_DAYS[dateTime.getDay()];
        }

        const hourText = (hour + 11) % 12 + 1;
        const amPm = hour < 12
            ? 'am'
            : 'pm';

        return `${hourText}${amPm}`;
    }
}
class TimeTickSecondMinute extends TimeTick {
    constructor() {
        super();
        this.tick = 30;
        this.major = 60;
    }
    getIndex(dateTime) {
        return dateTime.getSeconds();
    }
    start(dateTime) {
        const time = Math.floor(dateTime.getTime() / 1000 / this.tick) * 1000 * this.tick;
        const index = this.getIndex(dateTime) % this.major;

        return { time, index };
    }
    next(key, time) {
        const nextTime = time - this.tick * 1000;

        const major = this.getIndex(new Date(time)) % this.major === 0
            ? 2
            : 0;

        const label = major
            ? this.label(time)
            : null;

        return { time, nextTime, major, label };
    }
    label(time) {
        const dateTime = new Date(time);

        let hour = dateTime.getHours();
        if (hour < 10) {
            hour = `0${hour}`;
        }

        let minute = dateTime.getMinutes();
        if (minute < 10) {
            minute = `0${minute}`;
        }

        return `${hour}:${minute}`;
    }
}
class TimeTickSecondMinute2 extends TimeTickSecondMinute {
    constructor() {
        super();
        this.tick = 60;
        this.major = 600;
    }
    getIndex(dateTime) {
        const seconds = dateTime.getSeconds();
        const minutes = dateTime.getMinutes();

        return (seconds + minutes * 60);
    }
}
class TimeTickWeekMonth extends TimeTick {
    constructor() {
        super();
        this.tick = 86400 * 7;
        this.major = 4;
    }
    start(dateTime) {
        const day = dateTime.getDay();
        const startDate = new Date(dateTime.getTime() - day * 86400 * 1000);

        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const date = startDate.getDate();

        const time = new Date(year, month, date, 0, 0, 0, 0).getTime();
        const startMonth = new Date(year, month, 1, 0, 0, 0, 0).getTime();

        const index = Math.floor((time - startMonth) / 86400 / 7 / 1000);

        return { time, index };
    }
    next(key, time) {
        const nextTime = time - this.tick * 1000;
        let extra = null;
        const dateTime = new Date(time);
        const date = dateTime.getDate();
        if (date <= 7) {
            // get the exact start of the month
            const year = dateTime.getFullYear();
            const month = dateTime.getMonth();
            const monthStart = new Date(year, month, 1, 0, 0, 0, 0);
            const label = MONTHS_SHORT[monthStart.getMonth()];

            extra = { time: monthStart.getTime(), major: 2, label };
        }

        return { time, nextTime, major: 0, extra };
    }
}
class TimeTickMonthYear extends TimeTick {
    constructor() {
        super();
        this.major = 12;
    }
    start(obj) {
        const year = obj.getFullYear();
        const month = obj.getMonth();

        const time = new Date(year, month, 1).getTime();
        const index = month;

        return { time, index };
    }
    label(month, dateTime) {
        if (month === 0) {
            return dateTime.getFullYear().toString();
        }

        if (month === 6) {
            return 'H2';
        }

        return null;
    }
    getMajor(month) {
        if (!month) {
            // start of year
            return 2;
        }

        return Math.floor((month % 7) / 6);
    }
    next(key, time) {
        const dateTime = new Date(time);
        const month = dateTime.getMonth();

        const major = this.getMajor(month);

        const yearBreak = month === 0;
        const year = dateTime.getFullYear() - yearBreak;

        const nextTime = new Date(year, (month + 11) % 12, 1).getTime();

        const label = this.label(month, dateTime);

        return { time, major, nextTime, label };
    }
}

export function getTimeSeriesTicker(range) {
    // determine the tick processor to use
    if (range < 600) {
        return new TimeTickSecondMinute();
    }
    if (range < 3600) {
        return new TimeTickSecondMinute2();
    }
    if (range < 86400 * 0.6) {
        return new TimeTickMinuteHour();
    }
    if (range < 86400 * 8) {
        return new TimeTickHourDay();
    }
    if (range < 86400 * 35) {
        return new TimeTickDayWeek();
    }
    if (range < 86400 * 35 * 12) {
        return new TimeTickWeekMonth();
    }

    return new TimeTickMonthYear();
}

/**
 * Gets an appropriate range of ticks based on the time range provided
 * @param {integer} begin UNIX timestamp (secs)
 * @param {integer} end UNIX timestamp (secs)
 * @return {array} range of ticks
 */
export function timeSeriesTicks(begin, end) {
    const range = end - begin;

    const ticker = getTimeSeriesTicker(range);

    return ticker.genTicks(begin * 1000, end * 1000);
}

