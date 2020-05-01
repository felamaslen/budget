import { combineReducers } from 'redux';

import now from './now';
import app from './app';
import api from './api';
import login from './login';
import error from './error';
import overview from './overview';
import netWorth from './net-worth';
import analysis from './analysis';
import * as Stocks from './stocks';
import * as Funds from './funds';
import income from './income';
import bills from './bills';
import food from './food';
import general from './general';
import holiday from './holiday';
import social from './social';
import * as Suggestions from './suggestions';

export { State } from './types';

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
