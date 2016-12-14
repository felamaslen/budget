/**
 * Date (YMD) class
 */

import { leadingZeroes } from "misc/misc";

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

