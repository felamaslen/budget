import jsonp from 'jsonp';

export function getStockPricesFromYahoo(symbols) {
    const symbolsJoined = symbols
        .map(symbol => JSON.stringify(symbol))
        .join(',');

    const env = `env 'store://datatables.org/alltableswithkeys';`;

    const query = `select symbol, PreviousClose, LastTradePriceOnly from yahoo.finance.quotes where symbol in (${symbolsJoined})`;

    const encodedQuery = encodeURIComponent(`${env} ${query}`);

    const url = `https://query.yahooapis.com/v1/public/yql?q=${encodedQuery}&format=json`;

    return new Promise((resolve, reject) => {
        jsonp(url, {}, (err, data) => {
            if (err) {
                return reject(err);
            }

            try {
                const res = data.query.results.quote
                    .map(item => {
                        const code = item.symbol;
                        const open = parseFloat(item.PreviousClose, 10);
                        const close = parseFloat(item.LastTradePriceOnly, 10);

                        if (isNaN(close) || isNaN(open)) {
                            return null;
                        }

                        return { code, open, close };
                    })
                    .filter(item => item !== null);

                return resolve(res);
            }
            catch (dataErr) {
                console.error(dataErr.stack);

                return reject(dataErr);
            }
        });
    });
}

