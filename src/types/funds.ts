export type Transaction<D = Date> = {
  date: D;
  units: number;
  cost: number;
};

export type TransactionList<D = Date> = Transaction<D>[];

export type Fund<D = Date> = {
  id?: string;
  item: string;
  transactions: TransactionList<D>;
};

export type Price = {
  values: number[];
  startIndex: number;
};

export type Prices = {
  [id: string]: Price;
};

export type FundLine = {
  id: string;
  color: string;
  data: [number, number][];
}[];

export type Period = ['year' | 'month', number];

export const expandPeriod = (period: string): Period => {
  const match = period.match(/^(year|month)(\d)$/);
  if (!match) {
    return ['year', 5];
  }

  return [match[1] as 'year' | 'month', Number(match[2])];
};
