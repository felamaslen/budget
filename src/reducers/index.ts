import { combineReducers, Reducer } from 'redux';
import { connectRouter, RouterState } from 'connected-react-router';
import { History } from 'history';

import now from '~/reducers/now';
import login, { LoginState } from '~/reducers/login';
import overview, { State as OverviewState } from '~/reducers/overview';
import netWorth, { State as NetWorthState } from '~/reducers/net-worth';
import funds, { State as FundsState } from '~/reducers/funds';

export type GlobalState = {
  now: Date;
  login: LoginState;
  overview: OverviewState;
  netWorth: NetWorthState;
  funds: FundsState;
};

export type PreloadedState = Partial<GlobalState>;

export type State = GlobalState & { router: RouterState };

export default (history: History): Reducer<State> =>
  combineReducers<State>({
    router: connectRouter(history),
    now,
    login,
    overview,
    netWorth,
    funds,
  });
