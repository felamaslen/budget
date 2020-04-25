import { combineReducers } from 'redux';
import { DateTime } from 'luxon';

import now from '~client/reducers/now';
import app from '~client/reducers/app';
import api from '~client/reducers/api';
import login from '~client/reducers/login';
import error from '~client/reducers/error';
import overview from '~client/reducers/overview';
import netWorth from '~client/reducers/net-worth';
import analysis from '~client/reducers/analysis';
import * as Stocks from '~client/reducers/stocks';
import * as Funds from './funds';
import income from '~client/reducers/income';
import bills from '~client/reducers/bills';
import food from '~client/reducers/food';
import general from '~client/reducers/general';
import holiday from '~client/reducers/holiday';
import social from '~client/reducers/social';
import suggestions from '~client/reducers/suggestions';

export type State = {
  now: DateTime;
  app: {
    windowWidth: number;
  };
  login: object;
  api: object;
  error: object[];
  overview: object;
  netWorth: object;
  stocks: Stocks.State;
  funds: Funds.State;
  analysis: object;
  income: object;
  bills: object;
  food: object;
  general: object;
  holiday: object;
  social: object;
  suggestions: object;
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
  suggestions,
});
