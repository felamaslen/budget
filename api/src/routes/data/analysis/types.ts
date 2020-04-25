export enum Category {
  bills = 'bills',
  food = 'food',
  general = 'general',
  holiday = 'holiday',
  social = 'social',
}

export const CATEGORIES: Category[] = Object.keys(Category) as Category[];

export enum GroupBy {
  category = 'category',
  shop = 'shop',
}

export type CategoryColumn = 'item' | 'category' | 'society' | 'holiday' | 'shop';

export enum Period {
  week = 'week',
  month = 'month',
  year = 'year',
}

export type Params = {
  period: Period;
  groupBy: GroupBy;
  pageIndex: number;
};

export type ParamsDeep = Params & {
  category: Category;
};

export type PeriodCostRow = {
  column: string;
  cost: number;
};

export type PeriodCostRows = PeriodCostRow[];
