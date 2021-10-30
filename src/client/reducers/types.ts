import type { State as ApiState } from './api';
import type { State as ErrorState } from './error';
import type { State as FundsState } from './funds';
import type { DailyState } from './list';
import type { State as NetWorthState } from './net-worth';
import type { State as OverviewState } from './overview';
import { PageListStandard, PageNonStandard } from '~client/types/enum';
import type { IncomeDeduction } from '~client/types/gql';
import type { GQL } from '~shared/types';

export type IncomeExtraState = {
  totalDeductions: GQL<IncomeDeduction>[];
};

export type State = {
  api: ApiState;
  error: ErrorState;
  [PageNonStandard.Overview]: OverviewState;
  netWorth: NetWorthState;
  [PageNonStandard.Funds]: FundsState;
  [PageListStandard.Income]: DailyState<IncomeExtraState>;
  [PageListStandard.Bills]: DailyState;
  [PageListStandard.Food]: DailyState;
  [PageListStandard.General]: DailyState;
  [PageListStandard.Holiday]: DailyState;
  [PageListStandard.Social]: DailyState;
};
