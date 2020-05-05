import { createReducerObject, Action } from 'create-reducer-object';

import {
  ANALYSIS_REQUESTED,
  ANALYSIS_RECEIVED,
  ANALYSIS_BLOCK_REQUESTED,
  ANALYSIS_BLOCK_RECEIVED,
  ANALYSIS_TREE_DISPLAY_TOGGLED,
} from '~client/constants/actions/analysis';
import { Period, Grouping } from '~client/constants/analysis';
import { MainBlockName } from '~client/containers/PageAnalysis/types';
import { Page } from '~client/types/app';

export type Tree<B extends string = string> = [B, [string, number][]];
export type Cost<B extends string = string> = Tree<B>[];
export type TreeVisible = { [key in MainBlockName]?: boolean };

export type State = {
  loading: boolean;
  loadingDeep: boolean;
  period: Period;
  grouping: Grouping;
  page: number;
  timeline: number[][] | null;
  cost: Cost<MainBlockName>;
  costDeep: Cost | null;
  saved: number;
  description: string | null;
  treeVisible: TreeVisible;
};

export const initialState: State = {
  loading: true,
  loadingDeep: false,
  period: Period.year,
  grouping: Grouping.category,
  page: 0,
  timeline: null,
  cost: [],
  costDeep: null,
  saved: 0,
  description: null,
  treeVisible: { bills: false },
};

const onRequest = (
  state: State,
  { period = state.period, grouping = state.grouping, page = 0 }: Action,
): Partial<State> => ({
  period,
  grouping,
  page,
  loading: true,
  loadingDeep: false,
});

const onReceive = (_: State, { res }: Action): Partial<State> => ({
  timeline: res.data.timeline,
  cost: res.data.cost as Cost<MainBlockName>,
  saved: res.data.saved,
  costDeep: null,
  description: res.data.description,
  loading: false,
  loadingDeep: false,
});

function onBlockRequest(state: State, { name }: Action): Partial<State> {
  if (state.costDeep) {
    return {
      loading: false,
      loadingDeep: false,
      costDeep: null,
    };
  }
  if ([Page.bills, 'saved'].includes(name)) {
    return {
      loading: false,
      loadingDeep: false,
    };
  }

  return {
    loading: true,
    loadingDeep: true,
  };
}

const onBlockReceive = (_: State, { res }: Action): Partial<State> => ({
  costDeep: res.data.items,
  loading: false,
  loadingDeep: false,
});

const onTreeDisplayToggle = (state: State, { group }: Action): Partial<State> => ({
  treeVisible: {
    ...state.treeVisible,
    [group]: state.treeVisible[group as MainBlockName] === false,
  },
});

const handlers = {
  [ANALYSIS_REQUESTED]: onRequest,
  [ANALYSIS_RECEIVED]: onReceive,
  [ANALYSIS_BLOCK_REQUESTED]: onBlockRequest,
  [ANALYSIS_BLOCK_RECEIVED]: onBlockReceive,
  [ANALYSIS_TREE_DISPLAY_TOGGLED]: onTreeDisplayToggle,
};

export default createReducerObject<State>(handlers, initialState);
