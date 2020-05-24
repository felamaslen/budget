export type TransactionRaw = {
  date: string;
  units: number;
  cost: number;
};

export type Transaction = Omit<TransactionRaw, 'date'> & {
  date: Date;
};

export type Fund = {
  id: string;
  item: string;
  transactions: Transaction[];
};

export type FundRaw = Omit<Fund, 'transactions'> & {
  transactions: TransactionRaw[];
};
