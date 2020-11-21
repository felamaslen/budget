import { State as ApiState } from './api';
import { State as BillsState } from './bills';
import { State as ErrorState } from './error';
import { State as FoodState } from './food';
import { State as FundsState } from './funds';
import { State as GeneralState } from './general';
import { State as HolidayState } from './holiday';
import { State as IncomeState } from './income';
import { State as NetWorthState } from './net-worth';
import { State as SocialState } from './social';
import { State as StocksState } from './stocks';
import { State as AnalysisState } from '~client/reducers/analysis';
import { Page, OverviewState } from '~client/types';

export type State = {
  api: ApiState;
  error: ErrorState;
  [Page.overview]: OverviewState;
  netWorth: NetWorthState;
  stocks: StocksState;
  [Page.funds]: FundsState;
  [Page.analysis]: AnalysisState;
  [Page.income]: IncomeState;
  [Page.bills]: BillsState;
  [Page.food]: FoodState;
  [Page.general]: GeneralState;
  [Page.holiday]: HolidayState;
  [Page.social]: SocialState;
};
