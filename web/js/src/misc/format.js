/**
 * Data formatting
 */

import { YMD } from "misc/date";

export function formatAge(seconds, shortAbbr) {
  const measures = [
    [1,           "s", "second"],
    [60,          "m", "minute"],
    [3600,        "h", "hour"],
    [86400,       "d", "day"],
    [86400 * 30,  "M", "month"],
    [86400 * 365, "Y", "year"]
  ];
  const secondsNormalised = Math.max(seconds, 1);
  const measure = measures.reverse().filter(item => {
    return secondsNormalised >= item[0];
  })[0];

  const rounded = Math.round(seconds / measure[0]);
  const plural = !shortAbbr ? (rounded === 1 ? "" : "s") : "";
  const units = measure[shortAbbr ? 1 : 2] + plural;

  return shortAbbr ? rounded + units : `${rounded} ${units} ago`;
}
export function numberFormat(number) {
  // adds commas to a long number
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
export function formatCurrency(number, options) {
  options = options || {};
  if (typeof options.precision === "undefined") {
    options.precision = 0;
  }
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
    const abbr = ["k", "m", "bn", "tn"];
    log = Math.min(Math.floor(Math.log10(absValuePounds) / 3), abbr.length);
    if (log > 0) {
      abbreviation = abbr[log - 1];
    }
  }
  if (options.suffix) {
    abbreviation += options.suffix;
  }

  let value;
  if (log > 0) {
    value = absValuePounds / Math.pow(10, log * 3);
    if (options.abbreviate) {
      value = round(value, options.precision);
    }
  }
  else {
    value = absValuePounds;
    if (!options.noPence) {
      value = value.toFixed(2);
    }
  }
  if (options.noPence) {
    value = round(value, log ? options.precision : 0);
  }
  const formatted = numberFormat(value);

  result += formatted + abbreviation;
  if (options.brackets && number < 0) {
    result = `(${result})`;
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

const round = (number, precision) => {
  const exp = Math.pow(10, precision);
  return Math.round(exp * number) / exp;
}

/**
 * data type to hold transactions list for funds
 */
export class TransactionsList {
  constructor(data, formatted) {
    this.list = data.map(item => {
      return {
        date: formatted ? item.d : new YMD(item.d[0], item.d[1], item.d[2]),
        units: parseFloat(item.u),
        cost: parseInt(item.c, 10)
      };
    });

    this.num = this.list.length;
  }
  toString() {
    return JSON.stringify(this.list.map(item => {
      return {
        d: item.date.toString(),
        u: item.units,
        c: item.cost
      };
    }));
  }
  getUnits(list) {
    return list.reduce((a, b) => a + b.units, 0);
  }
  getCost(list) {
    return list.reduce((a, b) => a + b.cost, 0);
  }
  getTotalUnits() {
    return this.getUnits(this.list);
  }
  getTotalCost() {
    return this.getCost(this.list);
  }
  getLastUnits() {
    let length = this.list.length;
    if (this.list[length - 1].units < 0) {
      length--;
    }
    return this.getUnits(this.list.slice(0, length));
  }
  getLastCost() {
    let length = this.list.length;
    if (this.list[length - 1].cost < 0) {
      length--;
    }
    return this.getCost(this.list.slice(0, length));
  }
  sold() {
    return this.getTotalUnits() === 0;
  }
}

/**
 * convert REST (GET) data to application data
 * @param {mixed} val: return data from the api
 * @param {string} type: data type string
 * @return {object}: application data
 */
export function appDataFromApi(val, type) {
  switch (type) {
  case "date":
    if (typeof val[0] !== "undefined") {
      return new YMD(val[0], val[1], val[2]);
    }

  case "transactions":
    let data = [];
    try {
      data = JSON.parse(val);
    }
    finally {
      return new TransactionsList(data);
    }

  default:
    return val;
  }
}

