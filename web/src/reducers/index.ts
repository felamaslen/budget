import { combineReducers } from 'redux';

import api from './api';
import error from './error';
import funds from './funds';
import { income, bills, food, general, holiday, social } from './list-standard';
import netWorth from './net-worth';
import overview from './overview';
import { State } from './types';
import { Action } from '~client/actions';

export type { State } from './types';

export default combineReducers<State, Action>({
  api,
  error,
  overview,
  netWorth,
  funds,
  income,
  bills,
  food,
  general,
  holiday,
  social,
});
