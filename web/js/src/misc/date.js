/**
 * Date (YMD) class
 */

import { pmod, leadingZeroes, months, days } from "misc/misc";

export class YMD {
  constructor(year, month, date) {
    this.year = year;
    this.month = month;
    this.date = date;
  }
  toString() {
    return [this.year, this.month, this.date].join(",");
  }
  isAfter(date2) {
    // returns true if date1 is after date2
    return this.year > date2.year || (
      this.year === date2.year && (this.month > date2.month || (
        this.month === date2.month && this.date > date2.date
      ))
    );
  }
  isEqual(date2) {
    return this.year === date2.year &&
      this.month === date2.month &&
      this.date === date2.date;
  }
  format() {
    return leadingZeroes(this.date) + "/" + leadingZeroes(this.month) + "/" +
      this.year;
  }
  timestamp() {
    return new Date(`${this.year}-${this.month}-${this.date}`).getTime() / 1000;
  }
}

export const todayDate = new Date();
export const today = new YMD(
  todayDate.getFullYear(),
  todayDate.getMonth() + 1,
  todayDate.getDate()
);

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
    const month = months[obj.getMonth()];

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
    return days[new Date(t).getDay()];
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
    return hour === 0 ? days[obj.getDay()] : ((hour + 11) % 12 + 1) + (hour < 12 ? "am" : "pm");
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
      const label = months[monthStart.getMonth()];

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

    const time = new Date(year, month, 1, 0, 0, 0, 0).getTime();
    const index = month;

    return { time, index };
  }
  next(i, t) {
    const time = new Date(t);
    const month = time.getMonth();
    const major = month === 0 ? 2 : 0;
    const year = time.getFullYear() - (major ? 1 : 0);
    const nt = new Date(year, (month + 11) % 12, 1, 0, 0, 0, 0).getTime();

    return { t, major, nt };
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
export const timeSeriesTicks = (begin, end) => {
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
};

