import { Page } from './shared';

export type AnalysisPeriod = 'year' | 'month' | 'week';
export type AnalysisGroupBy = 'category' | 'shop';

export type AnalysisCategory = Page.bills | Page.food | Page.general | Page.holiday | Page.social;

export type AnalysisGroupColumn = 'item' | 'category' | 'shop';

export type AnalysisParams = {
  period: AnalysisPeriod;
  groupBy: AnalysisGroupBy;
  pageIndex: 0;
};

export type AnalysisParamsDeep = AnalysisParams & { category: AnalysisCategory };

export type PeriodCondition = {
  startTime: Date;
  endTime: Date;
  description: string;
};

export type GetPeriodCondition = (now: Date, pageIndex?: number) => PeriodCondition;

export type PeriodCost = {
  itemCol: string;
  cost: number;
};

export type PeriodCostDeep = PeriodCost & { item: string };

export type CategoryCostTree<T extends string = string> = [T, [string, number][]];

export type AnalysisTimeline = number[][];

export type TimelineRow = { date: string; cost: number };
export type CategoryTimelineRows = readonly TimelineRow[];

export type CostsByDate = {
  [year in string]: {
    [month in number]: {
      [day in number]: number[];
    };
  };
};
