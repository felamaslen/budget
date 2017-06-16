/**
 * Date functions and classes
 */

import { leadingZeroes } from './format';

export const yearMonthDifference = (ym1, ym2) => {
  return 12 * (ym2[0] - ym1[0]) + ym2[1] - ym1[1];
};

// year-month-date class
export class YMD {
  constructor(value) {
    let year;
    let month;
    let date;
    this.valid = true;

    if (typeof value === 'string' && value.match(/^[0-9]{1,2}\/[0-9]{1,2}\/([0-9]{2,4})?$/)) {
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
    else if (typeof value === 'object') {
      year = value[0];
      month = value[1];
      date = value[2];
    }
    else if (typeof value === 'undefined' || typeof value === 'number') {
      const dateObj = value ? new Date(value) : new Date();
      year = dateObj.getFullYear();
      month = dateObj.getMonth();
      date = dateObj.getDate();
    }
    else {
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
  formatISO() {
    const numbers = this.formatNumbers();
    return `${numbers[0]}-${numbers[1]}-${numbers[2]}`;
  }
  timestamp() {
    return new Date(`${this.year}-${this.month}-${this.date}`).getTime();
  }
}

