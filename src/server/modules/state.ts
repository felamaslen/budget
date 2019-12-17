import { sql, DatabasePoolConnectionType } from 'slonik';
import { Session } from 'koa-session';

import { withDb } from '~/server/modules/db';
import { PreloadedState } from '~/reducers';
import overviewReducer, { OverviewState, initialState as overviewState } from '~/reducers/overview';
import { getOverview } from '~/server/queries/overview';
import { OVERVIEW_READ } from '~/constants/actions.rt';

async function loadInitialOverview(
  db: DatabasePoolConnectionType,
  url: string,
  userId: string,
): Promise<OverviewState> {
  if (url !== '/') {
    return overviewState;
  }

  const payload = await getOverview(db, userId);

  return overviewReducer(overviewState, {
    type: OVERVIEW_READ,
    __FROM_SOCKET__: true,
    payload,
  });
}

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

    const [overview] = await Promise.all([loadInitialOverview(db, url, session.userId)]);

    return {
      overview,
      login: {
        loading: false,
        uid: session.userId,
        name: user.name,
        token: session.token,
      },
    };
  },
);
