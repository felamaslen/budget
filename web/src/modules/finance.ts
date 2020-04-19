import jsonp from 'jsonp';
import { replaceAtIndex } from 'replace-array';

import { randnBm } from '~client/modules/data';
import { FAKE_STOCK_PRICES } from '~client/constants/stocks';

type Price = {
  code: string;
  open: number;
  close: number;
};

function getStockPricesFromYahoo(symbols: string[]): Promise<Price[]> {
  const symbolsJoined = symbols
    .slice(0, 1)
    .map(symbol => JSON.stringify(symbol))
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

    return new Promise(resolve => {
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
