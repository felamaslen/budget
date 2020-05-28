import { combineReducers } from 'redux';

import analysis from './analysis';
import api from './api';
import bills from './bills';
import error from './error';
import food from './food';
import funds from './funds';
import general from './general';
import holiday from './holiday';
import income from './income';
import login from './login';
import netWorth from './net-worth';
import now from './now';
import overview from './overview';
import social from './social';
import stocks from './stocks';
import { State } from './types';

export { State } from './types';

export default combineReducers<State>({
  now,
  api,
  login,
  error,
  overview,
  netWorth,
  analysis,
  stocks,
  funds,
  income,
  bills,
  food,
  general,
  holiday,
  social,
});
