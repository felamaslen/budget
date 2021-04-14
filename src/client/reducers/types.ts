import { State as ApiState } from './api';
import { State as ErrorState } from './error';
import { State as FundsState } from './funds';
import { DailyState } from './list';
import { State as NetWorthState } from './net-worth';
import { State as OverviewState } from './overview';
import { PageListStandard, PageNonStandard } from '~client/types/enum';

export type State = {
  api: ApiState;
  error: ErrorState;
  [PageNonStandard.Overview]: OverviewState;
  netWorth: NetWorthState;
  [PageNonStandard.Funds]: FundsState;
  [PageListStandard.Income]: DailyState;
  [PageListStandard.Bills]: DailyState;
  [PageListStandard.Food]: DailyState;
  [PageListStandard.General]: DailyState;
  [PageListStandard.Holiday]: DailyState;
  [PageListStandard.Social]: DailyState;
};
