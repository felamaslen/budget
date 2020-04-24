import config from '~api/config';
import { Fund, Holding, CurrencyPrices, ShortFundType, LongFundType } from './types';
import { removeWhitespace } from './helpers';

export function isHLFundShare(fund: Pick<Fund, 'name'>): boolean {
  return /^.*\(share\.?\)$/.test(fund.name);
}

export function getHoldingsFromDataHL(fund: Pick<Fund, 'name'>, data: string): Holding[] {
  // gets the top holdings from raw HTML data (HL)
  const isShare = isHLFundShare(fund);

  const dataWithoutNewLines = removeWhitespace(data);

  const table = isShare
    ? '<table class="factsheet-table" summary="Top 10 exposures">'
    : '<table class="factsheet-table" summary="Top 10 holdings">';

  const tableMatch = dataWithoutNewLines.match(new RegExp([table, '(.*?)', '<\\/table>'].join('')));

  if (!tableMatch) {
    return [];
  }

  const [matchRowsRaw] = tableMatch;

  const matchRows = matchRowsRaw.match(/<tr[^>]*><td(.*?)<\/tr>/g);

  if (!matchRows) {
    throw new Error('Invalid scraped holdings data');
  }

  const regexCells = /<td[^>]*>(.*?)<\/td>/g;

  return matchRows.reduce((last: Holding[], row: string): Holding[] => {
    const rowMatch = row.match(regexCells) || [];
    if (!rowMatch) {
      return last;
    }
    const [nameRaw, valueRaw] = rowMatch;

    const name = nameRaw.replace(/<[^>]*>/g, '');
    const value = Number(valueRaw.replace(/[^\d.]/g, ''));

    return [...last, { name, value }];
  }, []);
}

export function getPriceFromDataHL(data: string, currencyPrices?: CurrencyPrices): number {
  // gets the fund price from raw html (HL)

  // build a regex to match the specific part of the html
  // containing the bid (sell) price
  const regex = new RegExp(
    [
      '<div id="security-price">',
      '.*',
      '<span class="bid price-divide"[^>]*>(\\$?)([0-9,]+(\\.[0-9]*)?)p?<\\/span>',
    ].join(''),
  );

  const dataWithoutNewLines = removeWhitespace(data);

  const [, dollar, price] = dataWithoutNewLines.match(regex) || [];

  if (!price) {
    throw new Error('Scraped data formatted incorrectly');
  }

  const rawPrice = Number(price.replace(/[,]+/g, ''));

  if (dollar) {
    if (!(currencyPrices && 'GBP' in currencyPrices)) {
      throw new Error('no GBP/USD currency conversion available');
    }

    return rawPrice * (currencyPrices?.GBP || 0) * 100;
  }

  return rawPrice;
}

function getSystemType(humanType: ShortFundType): LongFundType | null {
  if (humanType === ShortFundType.Income) {
    return LongFundType.Income;
  }
  if (humanType === ShortFundType.Accum) {
    return LongFundType.Accum;
  }
  if (humanType === ShortFundType.AccumInc) {
    return LongFundType.AccumInc;
  }
  if (humanType === ShortFundType.Share) {
    return LongFundType.Share;
  }

  return null;
}

export function getFundUrlHL(fund: Pick<Fund, 'name'>): string {
  // returns a URL like:
  // eslint-disable-next-line max-len
  // http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hl-multi-manager-uk-growth-accumulation
  const [, humanName, humanTypeRaw] = fund.name.match(config.data.funds.scraper.regex) || [];

  const humanType = humanTypeRaw.toLowerCase() as ShortFundType;

  const systemName = humanName.toLowerCase().replace(/\s/g, '-');

  const systemType = getSystemType(humanType);

  const isShare = systemType === 'share';

  const firstLetter = systemName[0];

  let urlParts = ['http://www.hl.co.uk'];

  if (isShare) {
    urlParts = [...urlParts, 'shares/shares-search-results', firstLetter, systemName];
  } else {
    urlParts = [
      ...urlParts,
      'funds/fund-discounts,-prices--and--factsheets/search-results',
      firstLetter,
      `${systemName}-${systemType}`,
    ];
  }

  return urlParts.join('/');
}
