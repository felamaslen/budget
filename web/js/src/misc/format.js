/**
 * Data formatting
 */

import { YMD } from "misc/date";

export function formatAge(seconds) {
  const measures = [
    [1,           "second"],
    [60,          "minute"],
    [3600,        "hour"],
    [86400,       "day"],
    [86400 * 30,  "month"],
    [86400 * 365, "year"]
  ];

  const measure = measures.reverse().filter(item => {
    return seconds >= item[0];
  })[0];

  const rounded = Math.round(seconds / measure[0]);

  const units = measure[1] + (rounded === 1 ? "" : "s");

  return rounded + " " + units + " ago";
}
export function numberFormat(number) {
  // adds commas to a long number
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
export function formatCurrency(number, options) {
  options = options || {};
  let result = "";

  if (!options.brackets) {
    const sign = number < 0 ? "&minus;" : "";
    result += sign;
  }

  if (!options.noSymbol) {
    const symbol = options.raw ? "£" : "&pound;";
    result += symbol;
  }

  const factor = options.noDivide ? 1 : 100;
  const absValuePounds = Math.abs(number) / factor;

  let log = 0;
  let abbreviation = "";
  if (options.abbreviate && number !== 0) {
    const abbr = ["k", "m", "bn", "trn"];
    log = Math.min(
      Math.floor(Math.log(absValuePounds) / Math.log(10) / 3), abbr.length);
    if (log > 0) {
      abbreviation = abbr[log - 1];
    }
  }

  if (options.suffix) {
    abbreviation += options.suffix;
  }

  const rounded = log > 0
    ? Math.round(100 * absValuePounds / Math.pow(10, log * 3)) / 100
    : (options.noZeroes && number !== 0
      ? absValuePounds : absValuePounds.toFixed(2)
    );

  const formatted = numberFormat(rounded);
  result += formatted + abbreviation;

  if (options.brackets && number < 0) {
    result = "(" + result + ")";
  }

  return result;
}
export function formatData(val, type, raw) {
  switch (type) {
  case "date":
    return val.format();
  case "cost":
    return formatCurrency(val, { raw });
  default:
    return val;
  }
}

export function getData(val, type) {
  switch (type) {
  case "date":
    if (typeof val[0] !== "undefined") {
      return new YMD(val[0], val[1], val[2]);
    }

  default:
    return val;
  }
}

