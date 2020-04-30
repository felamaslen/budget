import { combineReducers } from 'redux';
import { DateTime } from 'luxon';

import { Page } from '~client/types/app';

import now from '~client/reducers/now';
import app from '~client/reducers/app';
import api from '~client/reducers/api';
import login from '~client/reducers/login';
import error from '~client/reducers/error';
import overview from '~client/reducers/overview';
import netWorth, { State as NetWorthState } from '~client/reducers/net-worth';
import analysis from '~client/reducers/analysis';
import * as Stocks from '~client/reducers/stocks';
import * as Funds from './funds';
import income, { State as IncomeState } from './income';
import bills, { State as BillsState } from './bills';
import food, { State as FoodState } from './food';
import general, { State as GeneralState } from './general';
import holiday, { State as HolidayState } from './holiday';
import social, { State as SocialState } from './social';
import * as Suggestions from '~client/reducers/suggestions';

export type State = {
  now: DateTime;
  app: {
    windowWidth: number;
  };
  login: object;
  api: object;
  error: object[];
  overview: object;
  netWorth: NetWorthState;
  stocks: Stocks.State;
  [Page.funds]: Funds.State;
  analysis: object;
  [Page.income]: IncomeState;
  [Page.bills]: BillsState;
  [Page.food]: FoodState;
  [Page.general]: GeneralState;
  [Page.holiday]: HolidayState;
  [Page.social]: SocialState;
  suggestions: Suggestions.State;
};

export default combineReducers({
  now,
  app,
  api,
  login,
  error,
  overview,
  netWorth,
  analysis,
  stocks: Stocks.default,
  funds: Funds.default,
  income,
  bills,
  food,
  general,
  holiday,
  social,
  suggestions: Suggestions.default,
});
