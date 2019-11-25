import jsonp from 'jsonp';

import { randnBm, replaceAtIndex } from '~client/modules/data';
import { FAKE_STOCK_PRICES } from '~client/constants/stocks';

function getStockPricesFromYahoo(symbols) {
    const symbolsJoined = symbols
        .slice(0, 1)
        .map((symbol) => JSON.stringify(symbol))
        .join(',');

    const env = 'env \'store://datatables.org/alltableswithkeys\';';

    const query = `select symbol, PreviousClose, LastTradePriceOnly
    from yahoo.finance.quotes
    where symbol in (${symbolsJoined})`;

    const encodedQuery = encodeURIComponent(`${env} ${query}`);

    const url = `https://query.yahooapis.com/v1/public/yql?q=${encodedQuery}&format=json`;

    return new Promise((resolve, reject) => {
        jsonp(url, {}, (err, data) => {
            if (err) {
                return reject(err);
            }

            try {
                const res = data.query.results.quote
                    .map((item) => {
                        const code = item.symbol;
                        const open = Number(item.PreviousClose);
                        const close = Number(item.LastTradePriceOnly);

                        if (Number.isNaN(close) || Number.isNaN(open)) {
                            return null;
                        }

                        return { code, open, close };
                    })
                    .filter((item) => item !== null);

                return resolve(res);
            } catch (dataErr) {
                return reject(dataErr);
            }
        });
    });
}

function makeGetFakeStockPrices() {
    let prices = [];

    return (symbols) => {
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

export function getStockPrices(symbols) {
    if (!symbols.length) {
        return [];
    }
    if (FAKE_STOCK_PRICES) {
        return getFakeStockPrices(symbols);
    }

    return getStockPricesFromYahoo(symbols);
}
