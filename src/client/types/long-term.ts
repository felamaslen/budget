export type LongTermRates = {
  income: number;
  stockPurchase: number;
  years: number;
  xirr: number;
};

export type LongTermOptions = {
  enabled: boolean;
  rates: Partial<LongTermRates>;
};
