const stockIndexRegex = /^([^/]+)\/([^/]+)$/;

export const STOCK_INDICES = (process.env.STOCK_INDICES || '')
    .split(',')
    .map(code => code.match(stockIndexRegex))
    .filter(code => code)
    .reduce((last, [, code, name]) => ({
        ...last,
        [code]: name
    }), {});

export const DO_STOCKS_LIST = process.env.DO_STOCKS_LIST === 'true';
export const STOCKS_GRAPH_RESOLUTION = 50;
export const STOCK_PRICES_DELAY = 10000;

// investment rate of return (assumed, per annum)
export const FUTURE_INVESTMENT_RATE = 0.1;
