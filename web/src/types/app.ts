export enum Page {
  overview = 'overview',
  analysis = 'analysis',
  funds = 'funds',
  income = 'income',
  bills = 'bills',
  food = 'food',
  general = 'general',
  holiday = 'holiday',
  social = 'social',
}

export type PageList =
  | Page.funds
  | Page.income
  | Page.bills
  | Page.food
  | Page.general
  | Page.holiday
  | Page.social;

export type PageListCalc = Exclude<PageList, Page.funds>;
