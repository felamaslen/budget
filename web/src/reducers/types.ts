import { Page } from '~client/types/app';

import { State as LoginState } from './login';
import { State as OverviewState } from '~client/types/overview';
import { State as AnalysisState } from '~client/reducers/analysis';
import { State as NetWorthState } from './net-worth';
import * as Stocks from './stocks';
import * as Funds from './funds';
import { State as IncomeState } from './income';
import { State as BillsState } from './bills';
import { State as FoodState } from './food';
import { State as GeneralState } from './general';
import { State as HolidayState } from './holiday';
import { State as SocialState } from './social';
import * as Suggestions from './suggestions';

export type State = {
  now: Date;
  app: {
    windowWidth: number;
  };
  login: LoginState;
  api: object;
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
  suggestions: Suggestions.State;
};
