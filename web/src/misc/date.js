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

function pmod(i, n) {
    return ((i % n) + n) % n;
}

function monthDays(month, year) {
    const days = [31, leapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    return days[month - 1];
}

// year-month-date class
export class YMD {
    constructor(value) {
        let year;
        let month;
        let date;
        this.valid = true;

        if (typeof value === 'string') {
            if (value.match(/^[0-9]{1,2}\/[0-9]{1,2}(\/[0-9]{2,4})?$/)) {
                // parse string initialiser
                const parts = value.split('/').map(item => parseInt(item, 10));
                if (parts.length === 3) {
                    year = parts[2];
                    if (year < 100) {
                        year += 2000;
                    }
                }
                else {
                    year = new Date().getFullYear();
                }
                month = parts[1];
                date = parts[0];
            }
            else if (value.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) { // ISO-format
                const parts = value.split('-').map(item => parseInt(item, 10));
                year = parts[0];
                month = parts[1];
                date = parts[2];
            }
            else {
                this.valid = false;
            }
        }
        else if (typeof value === 'object') {
            year = value[0];
            month = value[1];
            date = value[2];
        }
        else if (typeof value === 'undefined' || typeof value === 'number') {
            const dateObj = value ? new Date(value) : new Date();
            year = dateObj.getFullYear();
            month = dateObj.getMonth() + 1;
            date = dateObj.getDate();
        }
        else {
            this.valid = false;
        }

        if (month < 1 || month > 12 || date < 1 || date > monthDays(month, year)) {
            this.valid = false;
        }

        this.year = year;
        this.month = month;
        this.date = date;
    }
    formatNumbers() {
        return [
            leadingZeroes(this.year, 4),
            leadingZeroes(this.month, 2),
            leadingZeroes(this.date, 2)
        ];
    }
    format() {
        const numbers = this.formatNumbers();

        return `${numbers[2]}/${numbers[1]}/${numbers[0]}`;
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
    next(i, t) {
        const nt = t - this.tick * 1000;
        const major = i % this.major === 0 ? 2 : 0;
        const label = major ? this.label(t) : null;

        return { t, nt, major, label };
    }
    label(t) {
        const obj = new Date(t);

        const date = obj.getDate();
        const month = MONTHS_SHORT[obj.getMonth()];

        return `${date} ${month}`;
    }
    genTicks(t0, t1) {
        const ticks = [];
        const start = this.start(new Date(t1));
        for (let i = start.index, t = start.time; t >= t0; i--) {
            const next = this.next(i, t);
            const tick = {
                t: next.t / 1000,
                major: next.major
            };
            if (next.label) {
                tick.label = next.label;
            }
            ticks.push(tick);
            t = next.nt;

            if (next.extra) {
                // extra tick
                const extraTick = {
                    t: next.extra.t / 1000,
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
    constructor() {
        super();
    }
}
class TimeTickHourDay extends TimeTick {
    constructor() {
        super();
        this.tick = 3600 * 3;
        this.major = 8;
    }
    start(obj) {
        const year = obj.getFullYear();
        const month = obj.getMonth();
        const date = obj.getDate();
        const hour = Math.ceil(obj.getHours() / 3) * 3;

        return {
            time: new Date(year, month, date, hour, 0, 0, 0).getTime(),
            index: hour / 3
        };
    }
    label(t) {
        return WEEK_DAYS[new Date(t).getDay()];
    }
}
class TimeTickMinuteHour extends TimeTick {
    constructor() {
        super();
        this.tick = 1800000;
        this.major = 3; // every x *hours*
        this.startMinute = 60 * this.tick / 3600000;
    }
    start(obj) {
        const year = obj.getFullYear();
        const month = obj.getMonth();
        const date = obj.getDate();
        const hour = obj.getHours();
        const minute = Math.floor(obj.getMinutes() / this.startMinute) * this.startMinute;

        return {
            time: new Date(year, month, date, hour, minute, 0, 0).getTime(),
            index: Math.round(hour * 2 + minute / this.startMinute)
        };
    }
    next(i, t) {
        const major = pmod(i, 2) === 0 ? (pmod(i, 48) === 0 ? 2 : 1) : 0;
        const label = pmod(i, 2) === 0 ? this.label(t) : null;
        const nt = t - this.tick;

        return { t, nt, major, label };
    }
    label(t) {
        const obj = new Date(t);
        const hour = obj.getHours();

        return hour === 0 ? WEEK_DAYS[obj.getDay()] : ((hour + 11) % 12 + 1) + (hour < 12 ? 'am' : 'pm');
    }
}
class TimeTickSecondMinute extends TimeTick {
    constructor() {
        super();
        this.tick = 30;
        this.major = 60;
    }
    getIndex(obj) {
        return obj.getSeconds();
    }
    start(obj) {
        const time = Math.floor(obj.getTime() / 1000 / this.tick) * 1000 * this.tick;
        const index = this.getIndex(obj) % this.major;

        return { time, index };
    }
    next(i, t) {
        const nt = t - this.tick * 1000;
        const major = this.getIndex(new Date(t)) % this.major === 0 ? 2 : 0;
        const label = major ? this.label(t) : null;

        return { t, nt, major, label };
    }
    label(t) {
        const obj = new Date(t);

        let hour = obj.getHours();
        if (hour < 10) {
            hour = `0${hour}`;
        }

        let minute = obj.getMinutes();
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
    getIndex(obj) {
        const seconds = obj.getSeconds();
        const minutes = obj.getMinutes();

        return (seconds + minutes * 60);
    }
}
class TimeTickWeekMonth extends TimeTick {
    constructor() {
        super();
        this.tick = 86400 * 7;
        this.major = 4;
    }
    start(obj) {
        const day = obj.getDay();
        const startDate = new Date(obj.getTime() - day * 86400 * 1000);

        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const date = startDate.getDate();

        const time = new Date(year, month, date, 0, 0, 0, 0).getTime();
        const startMonth = new Date(year, month, 1, 0, 0, 0, 0).getTime();

        const index = Math.floor((time - startMonth) / 86400 / 7 / 1000);

        return { time, index };
    }
    next(i, t) {
        const nt = t - this.tick * 1000;
        let extra = null;
        const obj = new Date(t);
        const date = obj.getDate();
        if (date <= 7) {
            // get the exact start of the month
            const year = obj.getFullYear();
            const month = obj.getMonth();
            const monthStart = new Date(year, month, 1, 0, 0, 0, 0);
            const label = MONTHS_SHORT[monthStart.getMonth()];

            extra = { t: monthStart.getTime(), major: 2, label };
        }

        return { t, nt, major: 0, extra };
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
    next(i, t) {
        const time = new Date(t);
        const month = time.getMonth();
        const major = month === 0 ? 2 : 0;
        const year = time.getFullYear() - (major ? 1 : 0);
        const nt = new Date(year, (month + 11) % 12, 1).getTime();
        const label = major ? this.label(t) : null;

        return { t, major, nt, label };
    }
    label(t) {
        return new Date(t).getFullYear().toString();
    }
}

/**
 * Gets an appropriate range of ticks based on the time range provided
 * @param {integer} begin UNIX timestamp (secs)
 * @param {integer} end UNIX timestamp (secs)
 * @return {array} range of ticks
 */
export function timeSeriesTicks(begin, end) {
    const range = end - begin;
    let ticker;

    // determine the tick processor to use
    if (range < 600) {
        ticker = new TimeTickSecondMinute();
    }
    else if (range < 3600) {
        ticker = new TimeTickSecondMinute2();
    }
    else if (range < 86400 * 0.6) {
        ticker = new TimeTickMinuteHour();
    }
    else if (range < 86400 * 8) {
        ticker = new TimeTickHourDay();
    }
    else if (range < 86400 * 35) {
        ticker = new TimeTickDayWeek();
    }
    else if (range < 86400 * 35 * 12) {
        ticker = new TimeTickWeekMonth();
    }
    else {
        ticker = new TimeTickMonthYear();
    }

    return ticker.genTicks(begin * 1000, end * 1000);
}

