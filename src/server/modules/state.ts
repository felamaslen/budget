import { sql, DatabasePoolConnectionType } from 'slonik';
import { Session } from 'koa-session';
import { Reducer } from 'redux';

import { SocketAction } from '~/types/actions';
import { Overview } from '~/types/overview';
import { NetWorth } from '~/types/net-worth';
import { withDb } from '~/server/modules/db';
import { PreloadedState } from '~/reducers';
import * as overviewReducer from '~/reducers/overview';
import * as netWorthReducer from '~/reducers/net-worth';
import { getOverview } from '~/server/queries/overview';
import { getNetWorth } from '~/server/queries/net-worth';
import { OVERVIEW_READ, NET_WORTH_READ } from '~/constants/actions.rt';

function makeLoadInitial<S, P = S>(
  matchUrl: (url: string) => boolean,
  state: {
    initialState: S;
    reducer: Reducer<S, SocketAction<P>>;
  },
  getData: (db: DatabasePoolConnectionType, userId: string) => Promise<P>,
  actionType: string,
) {
  return async (db: DatabasePoolConnectionType, url: string, userId: string): Promise<S> => {
    if (!matchUrl(url)) {
      return state.initialState;
    }

    const payload: P = await getData(db, userId);

    return state.reducer(state.initialState, {
      type: actionType,
      __FROM_SOCKET__: true,
      payload,
    });
  };
}

const loadInitialOverview = makeLoadInitial<overviewReducer.State, Overview<string>>(
  url => url === '/',
  overviewReducer,
  getOverview,
  OVERVIEW_READ,
);

const loadInitialNetWorth = makeLoadInitial<netWorthReducer.State, NetWorth>(
  url => url.startsWith('/net-worth'),
  netWorthReducer,
  getNetWorth,
  NET_WORTH_READ,
);

export const getPreloadedState = withDb<PreloadedState>(
  async (
    db: DatabasePoolConnectionType,
    session: Session,
    url: string,
  ): Promise<PreloadedState> => {
    if (!session.userId) {
      return {};
    }

    const {
      rows: [user],
    } = await db.query(sql`
select name
from users
where uid = ${session.userId}
    `);

    if (!user) {
      return {};
    }

    const [overview, netWorth] = await Promise.all([
      loadInitialOverview(db, url, session.userId),
      loadInitialNetWorth(db, url, session.userId),
    ]);

    return {
      overview,
      netWorth,
      login: {
        loading: false,
        uid: session.userId,
        name: user.name,
        token: session.token,
      },
    };
  },
);
