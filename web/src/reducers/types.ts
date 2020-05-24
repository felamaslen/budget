import { State as ApiState } from './api';
import { State as BillsState } from './bills';
import { State as FoodState } from './food';
import * as Funds from './funds';
import { State as GeneralState } from './general';
import { State as HolidayState } from './holiday';
import { State as IncomeState } from './income';
import { State as LoginState } from './login';
import { State as NetWorthState } from './net-worth';
import { State as SocialState } from './social';
import * as Stocks from './stocks';
import { State as AnalysisState } from '~client/reducers/analysis';
import { Page } from '~client/types/app';
import { State as OverviewState } from '~client/types/overview';

export type State = {
  now: Date;
  app: {
    windowWidth: number;
  };
  login: LoginState;
  api: ApiState;
  error: object[];
  [Page.overview]: OverviewState;
  netWorth: NetWorthState;
  stocks: Stocks.State;
  [Page.funds]: Funds.State;
  analysis: AnalysisState;
  [Page.income]: IncomeState;
  [Page.bills]: BillsState;
  [Page.food]: FoodState;
  [Page.general]: GeneralState;
  [Page.holiday]: HolidayState;
  [Page.social]: SocialState;
};
