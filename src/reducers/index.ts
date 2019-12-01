import { combineReducers, Reducer } from 'redux';
import { connectRouter, RouterState } from 'connected-react-router';
import { History } from 'history';

import login, { LoginState } from '~/reducers/login';

export interface GlobalState {
  login: LoginState;
}

export interface PreloadedState {
  login?: LoginState;
}

interface State extends GlobalState {
  router: RouterState;
}

export default (history: History): Reducer<State> =>
  combineReducers<State>({
    router: connectRouter(history),
    login,
  });
