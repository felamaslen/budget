/**
 * Miscllaneous functions
 */

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
export function arraySum1(array) {
  return array.reduce((a, b) => {
    return a + b[1];
  }, 0);
}
export function arrayAverage(array, offset) {
  return array.slice(0, -1 * offset).reduce((red, item) => {
    return red + item;
  }) / (array.length - offset);
}
export const zoomSlice = (array, zoom) => zoom ? Array.prototype.slice.apply(array, zoom) : array;
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

