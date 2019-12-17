import { combineReducers, Reducer } from 'redux';
import { connectRouter, RouterState } from 'connected-react-router';
import { History } from 'history';

import login, { LoginState } from '~/reducers/login';
import overview, { OverviewState } from '~/reducers/overview';

export interface GlobalState {
  login: LoginState;
  overview: OverviewState;
}

export interface PreloadedState {
  login?: LoginState;
  overview?: OverviewState;
}

export interface State extends GlobalState {
  router: RouterState;
}

export default (history: History): Reducer<State> =>
  combineReducers<State>({
    router: connectRouter(history),
    login,
    overview,
  });
