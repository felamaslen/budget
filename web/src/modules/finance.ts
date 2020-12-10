import { compose } from '@typed/compose';
import moize from 'moize';

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

const standardStockTest = /^(.*) (\(.*\)) \(stock\)$/;
const brokerSpecificTest = /^(.*) \(share|fund\)$/;

export function extractLongName(name: string): string {
  const standardMatch = name.match(standardStockTest);
  if (standardMatch) {
    return standardMatch[1];
  }
  if (brokerSpecificTest.test(name)) {
    return abbreviateFundName(name);
  }
  return name;
}
