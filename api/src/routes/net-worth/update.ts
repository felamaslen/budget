import * as boom from '@hapi/boom';
import { sql } from 'slonik';

import { insertValues, insertCreditLimits, insertCurrencies } from './create';
import { formatDate, fetchById } from './read';
import { authDbRoute } from '~api/middleware/request';

export const onUpdate = authDbRoute(async (db, req, res) => {
  const { date, values, creditLimit, currencies } = req.body;

  const uid = req.user.uid;
  const netWorthId = req.params.id;

  const item = await fetchById(db, netWorthId, uid);
  if (!item) {
    throw boom.notFound('Net worth row not found');
  }

  await db.query(sql`
        UPDATE net_worth
        SET date = ${formatDate(date)}
        WHERE id = ${netWorthId}
      `);

  await Promise.all(
    ['net_worth_values', 'net_worth_credit_limit', 'net_worth_currencies'].map(table =>
      db.query(sql`
            DELETE FROM ${sql.identifier([table])}
            WHERE net_worth_id = ${netWorthId}
          `),
    ),
  );

  await insertValues(db, netWorthId, values);
  await insertCreditLimits(db, netWorthId, creditLimit);
  await insertCurrencies(db, netWorthId, currencies);

  const updated = await fetchById(db, netWorthId, uid);

  res.json(updated);
});
