import type { AnalysisPage } from './gql';

export type MainBlockName = AnalysisPage | 'saved' | 'invested';

export type AnalysisTreeVisible = { [key in MainBlockName]?: boolean };

export type AnalysisSortedTree<B extends string = string> = {
  name: B;
  color?: string;
  subTree?: { name: string; total: number }[];
  total: number;
};
