import { breakpoints } from '~client/styled/variables';

export const mediaQueryMobile = `(max-width: ${breakpoints.mobile}px)`;

export const SYMBOL_CURRENCY_HTML = '\u00a3';
export const SYMBOL_CURRENCY_RAW = '£';

export enum Average {
  Mean,
  Median,
  Exp,
}
