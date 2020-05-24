import { combineReducers } from 'redux';

import analysis from './analysis';
import api from './api';
import app from './app';
import bills from './bills';
import error from './error';
import food from './food';
import * as Funds from './funds';
import general from './general';
import holiday from './holiday';
import income from './income';
import login from './login';
import netWorth from './net-worth';
import now from './now';
import overview from './overview';
import social from './social';
import * as Stocks from './stocks';

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
});
