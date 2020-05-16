import * as boom from '@hapi/boom';
import { sql } from 'slonik';

import { authDbRoute } from '~api/middleware/request';

export const onDelete = authDbRoute(async (db, req, res) => {
  const {
    rows: [item],
  } = await db.query<{ id: string }>(sql`
      SELECT id
      FROM net_worth
      WHERE ${sql.join([sql`uid = ${req.user.uid}`, sql`id = ${req.params.id}`], sql` AND `)}
    `);

  if (!item) {
    throw boom.notFound('Unknown net worth item');
  }

  await db.query(sql`DELETE FROM net_worth WHERE id = ${req.params.id}`);

  res.status(204).end();
});
