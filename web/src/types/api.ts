export type StocksListResponse = {
  data: {
    stocks: [string, string, number][];
    total: number;
  };
};
