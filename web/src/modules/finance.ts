import { compose } from '@typed/compose';
import jsonp from 'jsonp';
import moize from 'moize';
import { replaceAtIndex } from 'replace-array';

import { FAKE_STOCK_PRICES } from '~client/constants/stocks';
import { randnBm } from '~client/modules/data';

type Price = {
  code: string;
  open: number;
  close: number;
};

function getStockPricesFromYahoo(symbols: string[]): Promise<Price[]> {
  const symbolsJoined = symbols
    .slice(0, 1)
    .map((symbol) => JSON.stringify(symbol))
    .join(',');

  const env = "env 'store://datatables.org/alltableswithkeys';";

  const query = `select symbol, PreviousClose, LastTradePriceOnly
    from yahoo.finance.quotes
    where symbol in (${symbolsJoined})`;

  const encodedQuery = encodeURIComponent(`${env} ${query}`);

  const url = `https://query.yahooapis.com/v1/public/yql?q=${encodedQuery}&format=json`;

  return new Promise((resolve, reject) => {
    jsonp(
      url,
      {},
      (
        err: Error | null,
        data: {
          query: {
            results: {
              quote: {
                symbol: string;
                PreviousClose: string | number;
                LastTradePriceOnly: string | number;
              }[];
            };
          };
        },
      ): void => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const res = data.query.results.quote
            .map((item): Price | null => {
              const code = item.symbol;
              const open = Number(item.PreviousClose);
              const close = Number(item.LastTradePriceOnly);

              if (Number.isNaN(close) || Number.isNaN(open)) {
                return null;
              }

              return { code, open, close };
            })
            .filter((item: Price | null): item is Price => !!item);

          resolve(res);
        } catch (dataErr) {
          reject(dataErr);
        }
      },
    );
  });
}

function makeGetFakeStockPrices(): (symbols: string[]) => Promise<Price[]> {
  let prices: Price[] = [];

  return (symbols: string[]): Promise<Price[]> => {
    prices = symbols.reduce((last, code) => {
      const existsIndex = last.findIndex(({ code: haveCode }) => haveCode === code);
      if (existsIndex === -1) {
        const open = Number((1000 * Math.random()).toFixed(2));
        const close = open * (1 + randnBm() * 0.002);

        return last.concat([{ code, open, close }]);
      }

      const open = last[existsIndex].close * (1 + randnBm() * 0.001);
      const close = open * (1 + randnBm() * 0.002);

      return replaceAtIndex(last, existsIndex, { code, open, close });
    }, prices);

    const thisResult = prices.slice();

    return new Promise((resolve) => {
      setTimeout(() => resolve(thisResult), 100 * randnBm());
    });
  };
}

const getFakeStockPrices = makeGetFakeStockPrices();

export async function getStockPrices(symbols: string[]): Promise<Price[]> {
  if (!symbols.length) {
    return [];
  }
  if (FAKE_STOCK_PRICES) {
    return getFakeStockPrices(symbols);
  }

  return getStockPricesFromYahoo(symbols);
}

// Fund name abbreviations

// helper functions
const usingRegex = (regex: RegExp, processor: (name: string, matches: string[]) => string) => (
  name: string,
): string => {
  const matches = name.match(regex);
  return matches ? processor(name, matches) : name;
};

const extractConsonants = (value: string): string => value.replace(/[AEIOU]/gi, '');

// constants
const ordinaryShare = /((Ord(inary)?)|ORD)( Shares)?(( [0-9]+( [0-9]+)?p)|( [0-9]+(\.[0-9]+)?))?( Share)?/;

// common preparation functions
const removeUnused = (a: string): string =>
  a.replace(/(\s[A-Z])?\s\((share|fund|accum.|inc.)\)?/, '').replace(ordinaryShare, '');

const withAnd = (a: string): string => a.replace(/([A-Z])[a-z]+ and ([A-Z])[a-z]+/, '$1&$2');
const withInt = (a: string): string => a.replace(/ International/, ' Int.');

const prepareBase = compose(withInt, withAnd, removeUnused);

// Shares (including investment trusts)
const isShare = (name: string): boolean =>
  /\(share\)/.test(name) && (/\s(IT|(Investment )?Trust|)/.test(name) || ordinaryShare.test(name));

const removeUnusedIT = (a: string): string => a.replace(/( And| Inc| PLC)/g, '');
const ITToTrust = (a: string): string => a.replace(/\s(IT|Investment Trust)\s/, ' Trust ');

const prepareShare = compose(ITToTrust, removeUnusedIT);

const removeOf = (a: string): string => a.replace(/(\w+) of \w+/, '$1');
const trustToInitials = (a: string): string => a.replace(/([A-Z])([a-z]+)\s/g, '$1');
const removeSingletons = (a: string): string =>
  a
    .replace(/ [A-Z]($|\s)/, '')
    .replace(/([A-Z]{2}T)T/, '$1')
    .substring(0, 4)
    .toUpperCase();

function abbreviateShare(name: string): string {
  return compose(
    removeSingletons,
    trustToInitials,
    usingRegex(/^(\w+) Trust\s*/, (_, matches) => extractConsonants(matches[1]).substring(0, 4)),
    removeOf,
    prepareShare,
  )(name);
}

// Active funds
const removeUnusedFund = (a: string): string =>
  a.replace(/((Man GLG|Jupiter|Threadneedle)( \w+)?)\s.*/, '$1');

const prepareFund = compose(removeUnusedFund);

function abbreviateFund(name: string): string {
  return compose(
    usingRegex(/^(\w+)(\s.*)?/, (_, matches) => `${extractConsonants(matches[1])}${matches[2]}`),
    prepareFund,
  )(name);
}

// Index trackers
const isIndex = (name: string): boolean => /\s(Index( Trust)?)/.test(name);

function abbreviateIndex(name: string): string {
  return name.replace(/Index( Trust)?/, 'Ix');
}

const genericRegex = /^(.*)\s\((.*?)(\..*)?\)\s\(stock\)$/;

const isGenericShare = (name: string): boolean => genericRegex.test(name);

function getGenericSymbol(name: string): string {
  const [, , symbol] = name.match(genericRegex) as RegExpExecArray;
  return symbol;
}

export const abbreviateFundName = moize((name: string): string => {
  if (isGenericShare(name)) {
    return getGenericSymbol(name);
  }

  const base = prepareBase(name);

  if (isIndex(name)) {
    return abbreviateIndex(base);
  }
  if (isShare(name)) {
    return abbreviateShare(base);
  }
  return abbreviateFund(base);
});
