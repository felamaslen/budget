export interface FundValue<D = Date> {
  month?: D;
  value: number;
  cost: number;
}

export interface MonthCost {
  income: number[];
  bills: number[];
  food: number[];
  general: number[];
  holiday: number[];
  social: number[];
}

export interface Summary extends MonthCost {
  funds: number[];
  fundsOld?: number[];
  fundCosts: number[];
  fundCostsOld?: number[];
  netWorth: number[];
}

export type ProcessedSummary = Summary & {
  spending: number[];
  net: number[];
  netWorthPredicted: number[];
  netWorthCombined: number[];
};

export type TableColumns = Partial<Summary> & {
  spending?: number[];
  net?: number[];
  netWorthPredicted?: number[];
};

export interface Overview<D = Date> extends MonthCost {
  startDate: D;
  viewStartDate: D;
  netWorth: number[];
  funds: FundValue[];
}

export type TableCell = {
  column: [string, string];
  value: string | number;
  rgb?: string;
};

export type Table = {
  key: string;
  cells: TableCell[];
  active: boolean;
  future: boolean;
}[];
