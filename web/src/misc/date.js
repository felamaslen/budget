/**
 * Date functions and classes
 */

import { leadingZeroes } from './format';
import { MONTHS_SHORT } from './const';

export const yearMonthDifference = (ym1, ym2) => {
    return 12 * (ym2[0] - ym1[0]) + ym2[1] - ym1[1];
};

function leapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pmod(number, denominator) {
    return ((number % denominator) + denominator) % denominator;
}

export function monthDays(month, year) {
    if (month === 2) {
        if (leapYear(year)) {
            return 29;
        }

        return 28;
    }

    if (month < 8) {
        return 30 + (month % 2);
    }

    return 30 + ((month + 1) % 2);
}

// year-month-date class
export class YMD {
    constructor(value) {
        const values = YMD.getValues(value);

        this.valid = values !== null && values.year &&
            values.month >= 1 && values.month <= 12 &&
            values.date >= 1 && values.date <= monthDays(values.month, values.year);

        if (this.valid) {
            this.year = values.year;
            this.month = values.month;
            this.date = values.date;
        }
        else {
            this.year = null;
            this.month = null;
            this.date = null;
        }
    }
    static getYear(parts) {
        if (parts.length === 3) {
            if (parts[2] < 100) {
                return parts[2] + 2000;
            }

            return parts[2];
        }

        return new Date().getFullYear();
    }
    static getValuesFromSlashString(value) {
        // parse string initialiser
        const parts = value.split('/').map(item => parseInt(item, 10));

        const year = YMD.getYear(parts);
        const month = parts[1];
        const date = parts[0];

        return { year, month, date };
    }
    static getValuesFromISOString(value) {
        const parts = value.split('-').map(item => parseInt(item, 10));

        const year = parts[0];
        const month = parts[1];
        const date = parts[2];

        return { year, month, date };
    }
    static getValuesFromString(value) {
        if (value.match(/^[0-9]{1,2}\/[0-9]{1,2}(\/[0-9]{2,4})?$/)) {
            return YMD.getValuesFromSlashString(value);
        }

        if (value.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
            return YMD.getValuesFromISOString(value);
        }

        return null;
    }
    static getValues(value) {
        // process a constructor object / string into year/month/date values
        if (typeof value === 'string') {
            return YMD.getValuesFromString(value);
        }

        if (typeof value === 'object') {
            const year = value[0];
            const month = value[1];
            const date = value[2];

            return { year, month, date };
        }

        if (typeof value === 'undefined' || typeof value === 'number') {
            const dateTime = value
                ? new Date(value)
                : new Date();

            const year = dateTime.getFullYear();
            const month = dateTime.getMonth() + 1;
            const date = dateTime.getDate();

            return { year, month, date };
        }

        return null;
    }
    formatNumbers() {
        return [
            leadingZeroes(this.year, 4),
            leadingZeroes(this.month, 2),
            leadingZeroes(this.date, 2)
        ];
    }
    format() {
        return this
            .formatNumbers()
            .reverse()
            .join('/');
    }
    formatISO() {
        return this
            .formatNumbers()
            .join('-');
    }
    valueOf() {
        return this.timestamp();
    }
    toString() {
        // this format gets passed to API POST / PUT requests (for e.g. updating)
        return {
            year: this.year,
            month: this.month,
            date: this.date
        };
    }
    timestamp() {
        return Math.floor(new Date(this.year, this.month - 1, this.date).getTime() / 1000);
    }

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
    next(key, time) {
        const dateTime = new Date(time);
        const month = dateTime.getMonth();

        const major = month === 0
            ? 2
            : 0;

        const yearBreak = major
            ? 1
            : 0;

        const year = dateTime.getFullYear() - yearBreak;

        const nextTime = new Date(year, (month + 11) % 12, 1).getTime();

        const label = major
            ? this.label(dateTime)
            : null;

        return { time, major, nextTime, label };
    }
    label(dateTime) {
        return dateTime.getFullYear().toString();
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

