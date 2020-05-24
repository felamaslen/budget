import {
  ActionTypeAnalysis,
  ActionAnalysisRequested,
  ActionAnalysisReceived,
  ActionAnalysisBlockRequested,
  ActionAnalysisBlockReceived,
  ActionAnalysisTreeDisplayToggled,
  ActionAnalysis,
} from '~client/actions/analysis';
import { Period, Grouping } from '~client/constants/analysis';
import { Page, AnalysisCost, MainBlockName, AnalysisTreeVisible } from '~client/types';

export type State = {
  loading: boolean;
  loadingDeep: boolean;
  period: Period;
  grouping: Grouping;
  page: number;
  timeline: number[][] | null;
  cost: AnalysisCost<MainBlockName>;
  costDeep: AnalysisCost | null;
  saved: number;
  description: string | null;
  treeVisible: AnalysisTreeVisible;
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
  { period = state.period, grouping = state.grouping, page = 0 }: ActionAnalysisRequested,
): Partial<State> => ({
  period,
  grouping,
  page,
  loading: true,
  loadingDeep: false,
});

const onReceive = (_: State, { res }: ActionAnalysisReceived): Partial<State> | undefined =>
  res
    ? {
        timeline: res.data.timeline,
        cost: res.data.cost,
        saved: res.data.saved,
        costDeep: null,
        description: res.data.description,
        loading: false,
        loadingDeep: false,
      }
    : undefined;

function onBlockRequest(state: State, { name }: ActionAnalysisBlockRequested): Partial<State> {
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

const onBlockReceive = (_: State, { res }: ActionAnalysisBlockReceived): Partial<State> => ({
  costDeep: res?.data.items ?? null,
  loading: false,
  loadingDeep: false,
});

const onTreeDisplayToggle = (
  state: State,
  { group }: ActionAnalysisTreeDisplayToggled,
): Partial<State> => ({
  treeVisible: {
    ...state.treeVisible,
    [group]: state.treeVisible[group as MainBlockName] === false,
  },
});

const partialReducer = (
  state: State,
  action?: ActionAnalysis | null,
): Partial<State> | undefined => {
  switch (action?.type) {
    case ActionTypeAnalysis.Requested:
      return onRequest(state, action);
    case ActionTypeAnalysis.Received:
      return onReceive(state, action);
    case ActionTypeAnalysis.BlockRequested:
      return onBlockRequest(state, action);
    case ActionTypeAnalysis.BlockReceived:
      return onBlockReceive(state, action);
    case ActionTypeAnalysis.TreeDisplayToggled:
      return onTreeDisplayToggle(state, action);
    default:
      return undefined;
  }
};

export default (state: State = initialState, action?: ActionAnalysis | null): State => {
  const partial = partialReducer(state, action);
  return partial ? { ...state, ...partial } : state;
};
