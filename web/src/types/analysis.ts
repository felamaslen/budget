import { Period, Grouping } from '~client/constants/analysis';
import { PageListCalc } from '~client/types/app';

export type MainBlockName = Exclude<PageListCalc, 'income'> | 'saved';

export type AnalysisTree<B extends string = string> = [B, [string, number][]];

export type AnalysisCost<B extends string = string> = AnalysisTree<B>[];

export type AnalysisTreeVisible = { [key in MainBlockName]?: boolean };

export type AnalysisSortedTree<B extends string = string> = {
  name: B;
  color?: string;
  subTree?: { name: string; total: number }[];
  total: number;
};

export type AnalysisTimeline = number[][];

export type AnalysisRequest = Partial<{
  period: Period;
  grouping: Grouping;
  page: number;
}>;

export type AnalysisResponse = {
  data: {
    timeline: AnalysisTimeline | null;
    cost: AnalysisCost<MainBlockName>;
    saved: number;
    description: string;
  };
};

export type AnalysisDeepResponse = {
  data: {
    items: AnalysisCost;
  };
};
