import { State as ApiState } from './api';
import { State as ErrorState } from './error';
import { State as FundsState } from './funds';
import { Income, Bills, Food, General, Holiday, Social } from './list-standard';
import { State as NetWorthState } from './net-worth';
import { State as OverviewState } from './overview';
import { PageListStandard, PageNonStandard } from '~client/types';

export type State = {
  api: ApiState;
  error: ErrorState;
  [PageNonStandard.Overview]: OverviewState;
  netWorth: NetWorthState;
  [PageNonStandard.Funds]: FundsState;
  [PageListStandard.Income]: Income;
  [PageListStandard.Bills]: Bills;
  [PageListStandard.Food]: Food;
  [PageListStandard.General]: General;
  [PageListStandard.Holiday]: Holiday;
  [PageListStandard.Social]: Social;
};
