export type PeriodCondition = {
  startTime: Date;
  endTime: Date;
  description: string;
};

export type AnalysisGroupColumn = 'item' | 'category' | 'shop';

export type GetPeriodCondition = (now: Date, pageIndex?: number) => PeriodCondition;

export type PeriodCost = {
  itemCol: string;
  cost: number;
};

export type PeriodCostDeep = PeriodCost & { item: string };

export type TimelineRow = { date: string; cost: number };
export type CategoryTimelineRows = readonly TimelineRow[];

export type CostsByDate = {
  [year in string]: {
    [month in number]: {
      [day in number]: number[];
    };
  };
};
