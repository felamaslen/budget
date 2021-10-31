import format from 'date-fns/format';

import { SYMBOL_CURRENCY_HTML, SYMBOL_CURRENCY_RAW } from '~client/constants';
import type { Transaction } from '~client/types/gql';

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

function getCurrencyValueRaw(
  absValue: number,
  log: number,
  precision: number,
  noPence: boolean,
): string {
  if (log > 0) {
    const measure = absValue / 10 ** (log * 3);
    return round(measure, precision).toString();
  }
  if (noPence) {
    return absValue.toFixed();
  }
  return absValue.toFixed(precision);
}

type FormatCurrencyOptions = {
  abbreviate: boolean;
  brackets: boolean;
  noSymbol: boolean;
  noPence: boolean;
  suffix: string;
  raw: boolean;
  precision: number;
};

function getPrecision(abbreviate: boolean, log: number, precision?: number): number {
  if (abbreviate && log === 0) {
    return 2;
  }
  return precision ?? (abbreviate ? 0 : 2);
}

export function formatCurrency(
  value: number,
  {
    abbreviate = false,
    brackets = false,
    noSymbol = false,
    noPence = false,
    suffix = '',
    raw = false,
    ...options
  }: Partial<FormatCurrencyOptions> = {},
): string {
  const sign = brackets || value >= 0 ? '' : '\u2212';

  const setSymbol = raw ? SYMBOL_CURRENCY_RAW : SYMBOL_CURRENCY_HTML;
  const symbol = noSymbol ? '' : setSymbol;

  const absValue = Math.abs(value) / 100;

  const currencyAbbreviation = ['k', 'm', 'bn', 'tn'];

  const log =
    abbreviate && value !== 0
      ? Math.min(Math.floor(Math.log10(absValue) / 3), currencyAbbreviation.length)
      : 0;

  const precision = getPrecision(abbreviate, log, options.precision);

  const abbreviation = log > 0 ? currencyAbbreviation[log - 1] : '';

  const formatted = numberFormat(getCurrencyValueRaw(absValue, log, precision, noPence));

  if (brackets && value < 0) {
    return `(${symbol}${formatted}${abbreviation}${suffix})`;
  }
  return `${sign}${symbol}${formatted}${abbreviation}${suffix}`;
}

export const formatPercent = (frac: number, options: Partial<FormatCurrencyOptions> = {}): string =>
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

export function getTickSize(min: number, max: number, numTicks = 5): number {
  const minimum = (max - min) / numTicks;
  const result = normaliseTickSize(minimum);
  return Number.isNaN(result) ? 0 : result;
}

export const toISO = (value: Date): string => format(value, 'yyyy-MM-dd');
export const toLocal = (value: Date | undefined): string =>
  format(value ?? new Date(), 'dd/MM/yyyy');

export function formatItem(item: 'transactions', value: Transaction[]): string;
export function formatItem(item: 'date', value?: Date): string;
export function formatItem(item: 'cost', value?: number): string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatItem(item: string, value?: any): string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function formatItem(item: string, value?: any): string {
  if (item === 'transactions') {
    return String(Array.isArray(value) ? value.length : 0);
  }
  if (typeof value === 'undefined') {
    return '';
  }
  if (value instanceof Date) {
    return toLocal(value);
  }
  if (item === 'cost') {
    return formatCurrency(Number(value));
  }

  return String(value);
}
