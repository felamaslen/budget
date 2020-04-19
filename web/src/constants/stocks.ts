const stockIndexRegex = /^([^/]+)\/([^/]+)$/;

type StockIndices = {
  [code: string]: string;
};

export const STOCK_INDICES: StockIndices = (process.env.STOCK_INDICES || '')
  .split(',')
  .map(code => code.match(stockIndexRegex))
  .filter((code: RegExpMatchArray | null): code is RegExpMatchArray => !!code)
  .reduce(
    (last, [, code, name]) => ({
      ...last,
      [code]: name,
    }),
    {},
  );

export const DO_STOCKS_LIST: boolean = process.env.DO_STOCKS_LIST !== 'false';
export const FAKE_STOCK_PRICES: boolean = process.env.FAKE_STOCK_PRICES === 'true';
export const STOCKS_GRAPH_RESOLUTION = 50;
export const STOCK_PRICES_DELAY: number = FAKE_STOCK_PRICES ? 5000 : 10000;

// investment rate of return (assumed, per annum)
export const FUTURE_INVESTMENT_RATE = 0.1;
