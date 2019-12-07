import { sql, DatabasePoolConnectionType } from 'slonik';
import { Session } from 'koa-session';

import { withDb } from '~/server/modules/db';
import { PreloadedState } from '~/reducers';

export const getPreloadedState = withDb<PreloadedState>(
  async (db: DatabasePoolConnectionType, session: Session): Promise<PreloadedState> => {
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

    return {
      login: {
        loading: false,
        uid: session.userId,
        name: user.name,
        token: session.token,
      },
    };
  },
);
