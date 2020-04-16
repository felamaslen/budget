import format from 'date-fns/format';

import { SYMBOL_CURRENCY_HTML, SYMBOL_CURRENCY_RAW } from '~client/constants';

export const percent = (frac: number): string => `${Math.round(100000 * frac) / 1000}%`;

export function capitalise(value: string): string {
  return `${value.substring(0, 1).toUpperCase()}${value.substring(1).toLowerCase()}`;
}

function round(value: number, precision: number): number {
  const exp = 10 ** precision;

  return Math.round(exp * value) / exp;
}

export function numberFormat(value: number | string): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const getSign = (value: number): string => (value < 0 ? '-' : '');

export function sigFigs(value: number, figs: number): string {
  if (value === 0) {
    return value.toFixed(figs - 1);
  }

  const numDigits = Math.floor(Math.log10(Math.abs(value))) + 1;
  const exp = 10 ** Math.min(figs - 1, Math.max(0, figs - numDigits));
  const absResult = (Math.round(Math.abs(value) * exp) / exp).toString();

  // add extra zeroes if necessary
  const hasDot = absResult.indexOf('.') > -1;
  const numDigitsVisible = absResult.length - (hasDot ? 1 : 0);
  const numTrailingZeroes = Math.max(0, figs - numDigitsVisible);

  const sign = getSign(value);

  if (numTrailingZeroes > 0) {
    const dot = hasDot ? '' : '.';

    const zeroes = new Array(numTrailingZeroes).fill('0');

    return `${sign}${absResult}${dot}${zeroes.join('')}`;
  }

  return `${sign}${absResult}`;
}

export function leadingZeroes(value: number, numZeroes: number): string {
  const numAdd = value ? numZeroes - Math.floor(Math.log10(value)) - 1 : numZeroes - 1;

  if (numAdd > 0) {
    return `${new Array(numAdd).fill('0').join('')}${value}`;
  }

  return value.toString();
}

function getCurrencyValueRaw(
  absValue: number,
  log: number,
  abbreviate: boolean,
  precision: number,
  noPence: boolean,
): string {
  if (log > 0) {
    const measure = absValue / 10 ** (log * 3);

    if (abbreviate || noPence) {
      return round(measure, precision).toString();
    }

    return String(measure);
  }
  if (noPence) {
    return absValue.toFixed();
  }

  return absValue.toFixed(precision);
}

type FormatCurrencyOptions = {
  abbreviate?: boolean;
  brackets?: boolean;
  noSymbol?: boolean;
  noPence?: boolean;
  suffix?: string | null;
  raw?: boolean;
  precision?: number;
};

export function formatCurrency(value: number, customOptions: FormatCurrencyOptions = {}): string {
  const options = {
    abbreviate: false,
    brackets: false,
    noSymbol: false,
    noPence: false,
    suffix: null,
    raw: false,
    ...customOptions,
  };

  const sign = options.brackets || value >= 0 ? '' : '\u2212';

  const setSymbol = options.raw ? SYMBOL_CURRENCY_RAW : SYMBOL_CURRENCY_HTML;

  const symbol = options.noSymbol ? '' : setSymbol;

  const absValue = Math.abs(value) / 100;

  const abbr = ['k', 'm', 'bn', 'tn'];

  const log =
    options.abbreviate && value !== 0
      ? Math.min(Math.floor(Math.log10(absValue) / 3), abbr.length)
      : 0;

  let { precision = options.abbreviate ? 0 : 2 } = options;

  if (options.abbreviate && log === 0) {
    precision = 2;
  }

  const abbreviation = log > 0 ? abbr[log - 1] : '';

  const suffix = options.suffix || '';

  const valueRaw = getCurrencyValueRaw(
    absValue,
    log,
    options.abbreviate,
    precision,
    options.noPence,
  );

  const formatted = numberFormat(valueRaw);

  if (options.brackets && value < 0) {
    return `(${symbol}${formatted}${abbreviation}${suffix})`;
  }

  return `${sign}${symbol}${formatted}${abbreviation}${suffix}`;
}

export const formatPercent = (frac: number, options: FormatCurrencyOptions = {}): string =>
  formatCurrency(100 * 100 * frac, {
    ...options,
    suffix: '%',
    noSymbol: true,
  });

export const normaliseTickSize = (tickSize: number): number => {
  const magnitude = 10 ** Math.floor(Math.log10(tickSize));
  const res = tickSize / magnitude;

  if (res > 5) {
    return 10 * magnitude;
  }

  if (res > 2) {
    return 5 * magnitude;
  }

  if (res > 1) {
    return 2 * magnitude;
  }

  return magnitude;
};

export function getTickSize(min: number, max: number, numTicks: number): number {
  const minimum = (max - min) / numTicks;

  return normaliseTickSize(minimum);
}

export function formatItem<V = string>(item: string, value: V): string {
  if (value instanceof Date) {
    return format(value, 'dd/MM/yyyy');
  }
  if (item === 'cost') {
    return formatCurrency(Number(value));
  }
  if (item === 'transactions' && Array.isArray(value)) {
    return String(value.length);
  }

  return String(value);
}
