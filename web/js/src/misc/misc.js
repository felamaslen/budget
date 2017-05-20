/**
 * Miscllaneous functions
 */

import { AVERAGE_MEDIAN, AVERAGE_MEAN_GEOM } from "const";

export function trim(string) {
  while (string.indexOf(" ") === 0) {
    string = string.substring(1);
  }

  while (string.lastIndexOf(" ") === string.length - 1) {
    string = string.substring(0, string.length - 1);
  }

  return string;
}
export function median(array) {
  const sorted = array.concat().sort();

  const numKeys = sorted.length;

  if (numKeys & 1) {
    // odd
    return sorted[Math.floor(numKeys / 2)];
  }

  // even
  return 0.5 * (
    sorted[numKeys / 2 - 1] + sorted[numKeys / 2]
  );
}
export function arraySum(array) {
  return array.reduce((a, b) => {
    return a + b;
  }, 0);
}
export function arrayAverage(array, offset, mode) {
  const values = offset ? array.slice(0, -offset) : array;

  if (mode === AVERAGE_MEDIAN) {
    const sorted = values.sort((a, b) => a < b ? -1 : 1);
    if (sorted.length & 1) {
      // odd: get the middle value
      return sorted[Math.floor((sorted.length - 1) / 2)];
    }
    // even: get the middle two values and find the average of them
    const low = sorted[Math.floor(sorted.length / 2) - 1];
    const high = sorted[Math.floor(sorted.length / 2)];
    return (low + high) / 2;
  }

  if (mode === AVERAGE_MEAN_GEOM) {
    const nonNegativeValues = values.filter(value => value > 0).map(value => value || 1);
    if (nonNegativeValues.length === 0) {
      return 0;
    }
    return Math.pow(nonNegativeValues.reduce((a, b) => a * b), 1 / nonNegativeValues.length);
  }

  // mean by default
  return arraySum(values) / values.length;
}
export function hundredth(item) {
  return item / 100;
}
export function leadingZeroes(n, base) {
  if (!base) {
    base = 10;
  }

  return (n < base ? "0" : "") + n.toString(base);
}
export function percent(n) {
  return (n * 100) + "%";
}
export function capitalise(word) {
  return word.substring(0, 1).toUpperCase() + word.substring(1);
}
export function getYearMonthRow(startYear, startMonth, year, month) {
  return (year - startYear) * 12 + (month - startMonth);
}

export const classNames = obj => {
  const array = [];
  for (const key in obj) {
    if (obj[key]) {
      array.push(key);
    }
  }
  return array.join(" ");
};

export const randnBm = () => {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
export const pmod = (i, n) => ((i % n) + n) % n;
export const getMovingAverage = (data, period) => data.map((item, key) => {
  if (key < period - 1) {
    return [item[0], data.filter((_, thisKey) => thisKey <= key)
      .reduce((a, b) => a + b[1], 0) / (key + 1)];
  }

  return [item[0], data.filter(
    (_, thisKey) => thisKey <= key && thisKey > key - period
  ).reduce((a, b) => a + b[1], 0) / period];
});
export const indexPoints = (value, key) => [key, value];

export const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

