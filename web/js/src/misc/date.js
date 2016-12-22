/**
 * Date (YMD) class
 */

import { leadingZeroes, months, days } from "misc/misc";

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
}

export const todayDate = new Date();
export const today = new YMD(
  todayDate.getFullYear(),
  todayDate.getMonth() + 1,
  todayDate.getDate()
);

class TimeTickDayWeek {
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
      time: new Date(year, month, date, 0, 0, 0, 0).getTime(),
      index: day
    };
  }
  next(i, t) {
    const nt = t - this.tick * 1000;
    const major = i % this.major === 0;

    return { t, nt, major };
  }
  label(t) {
    const obj = new Date(t);

    const date = obj.getDate();
    const month = months[obj.getMonth()];

    return `${date} ${month}`;
  }
  genTicks(t0, t1) {
    const ticks = [];
    const start = this.start(t1);
    for (let i = start.index, t = start.time; t >= t0; i--) {
      const next = this.next(i, t);
      const tick = {
        t: next.t / 1000,
        major: next.major
      };
      if (next.major) {
        tick.label = this.label(t);
      }
      ticks.push(tick);

      if (next.extra) {
        // extra tick
        const extraTick = {
          t: next.extra.t / 1000,
          major: next.extra.major
        };
        if (next.extra.major) {
          extraTick.label = this.label(next.extra.t);
        }
        ticks.push(extraTick);
      }

      t = next.nt;
    }

    return ticks;
  }
}
class TimeTickHourDay extends TimeTickDayWeek {
  constructor() {
    super();
    this.tick = 3600;
    this.major = 24;
  }
  start(obj) {
    const year = obj.getFullYear();
    const month = obj.getMonth();
    const date = obj.getDate();
    const hour = obj.getHours();

    return {
      time: new Date(year, month, date, hour, 0, 0, 0).getTime(),
      index: hour
    };
  }
  label(t) {
    const obj = new Date(t);
    return days[obj.getDay()];
  }
}
class TimeTickMinuteHour extends TimeTickDayWeek {
  constructor() {
    super();
    this.tick = 1800;
    this.major = 2;
  }
  start(obj) {
    const year = obj.getFullYear();
    const month = obj.getMonth();
    const date = obj.getDate();
    const hour = obj.getHours();
    const factor = 60 / this.major;
    const minute = Math.floor(obj.getMinutes() / factor) * factor;

    return {
      time: new Date(year, month, date, hour, minute, 0, 0).getTime(),
      index: minute
    };
  }
  next(i, t) {
    const obj = new Date(t);
    const hour = obj.getHours();
    const minute = obj.getMinutes();
    const major = minute === 0 && hour % 3 === 0;

    // 15 minute minor steps
    const nt = t - 3600000;

    return { t, major, nt };
  }
  label(t) {
    const obj = new Date(t);

    const hour = obj.getHours();
    const am = hour < 12;

    return hour === 0 ? days[obj.getDay()]
      : ((hour + 11) % 12 + 1) + (am ? "am" : "pm");
  }
}
class TimeTickWeekMonth extends TimeTickDayWeek {
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

    const date = new Date(t).getDate();
    if (date < 7) {
      // get the exact start of the month
      const time = new Date(t);
      const year = time.getFullYear();
      const month = time.getMonth();

      const et = new Date(year, month, 1, 0, 0, 0, 0).getTime();

      extra = { t: et, major: true };
    }

    return { t, nt, extra };
  }
  label(t) {
    return months[new Date(t).getMonth()];
  }
}
class TimeTickMonthYear extends TimeTickDayWeek {
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
    const major = month === 0;
    const year = time.getFullYear() - (major ? 1 : 0);
    const nt = new Date(year, (month + 11) % 12, 1, 0, 0, 0, 0).getTime();

    return { t, major, nt };
  }
  label(t) {
    return new Date(t).getFullYear().toString();
  }
}

export const timeSeriesTicks = begin => {
  const now = new Date();
  const nowTime = now.getTime() / 1000;
  const range = nowTime - begin;
  let ticker;

  // determine the tick processor to use
  if (range < 3600) {
    return null;
  }
  else if (range < 86400 * 1.5) {
    ticker = new TimeTickMinuteHour();
  }
  else if (range < 86400 * 4) {
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

  return ticker.genTicks(begin * 1000, now);
};

