export interface FundValue {
  month?: Date;
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

export interface OverviewBase extends MonthCost {
  pastMonths: number;
  netWorth: number[];
  funds: FundValue[];
}

export interface Overview extends OverviewBase {
  startDate: string;
}
