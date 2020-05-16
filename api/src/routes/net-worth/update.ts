import * as boom from '@hapi/boom';
import { sql } from 'slonik';
import deepEqual from 'fast-deep-equal';

import { insertValues, insertCreditLimits, insertCurrencies } from './create';
import { formatDate, fetchById } from './read';
import { authDbRoute } from '~api/middleware/request';
import { Entry } from '~api/routes/net-worth/types';

export const onUpdate = authDbRoute(async (db, req, res) => {
  const { date, values, creditLimit, currencies }: Entry = req.body;

  const uid = req.user.uid;
  const netWorthId = req.params.id;

  const item = await fetchById(db, netWorthId, uid);
  if (!item) {
    throw boom.notFound('Net worth row not found');
  }

  await db.query(sql`
    UPDATE net_worth
    SET date = ${formatDate(new Date(date))}
    WHERE id = ${netWorthId}
  `);

  const deletedValues = item.values
    .filter(oldValue => !values.some(({ subcategory }) => subcategory === oldValue.subcategory))
    .map(({ subcategory }) => subcategory);

  const deletedCreditLimit = item.creditLimit
    .filter(
      oldValue => !creditLimit.some(({ subcategory }) => subcategory === oldValue.subcategory),
    )
    .map(({ subcategory }) => subcategory);

  const deletedCurrencies = item.currencies
    .filter(oldValue => !currencies.some(({ currency }) => currency === oldValue.currency))
    .map(({ currency }) => currency);

  const changedValues = values
    .filter(
      ({ id: newId, ...newValue }) =>
        !item.values.some(({ id: oldId, ...oldValue }) => deepEqual(oldValue, newValue)),
    )
    .map(({ subcategory }) => subcategory);

  const allSubcategories = values.map(({ subcategory }) => subcategory);

  await Promise.all([
    db.query(sql`
      DELETE FROM net_worth_values
      WHERE ${sql.join(
        [
          sql`net_worth_id = ${netWorthId}`,
          sql`subcategory = ANY(${sql.array(deletedValues, 'uuid')})`,
        ],
        sql` AND `,
      )}
    `),

    db.query(sql`
      DELETE FROM net_worth_credit_limit
      WHERE ${sql.join(
        [
          sql`net_worth_id = ${netWorthId}`,
          sql`subcategory = ANY(${sql.array(deletedCreditLimit, 'uuid')})`,
        ],
        sql` AND `,
      )}
    `),

    db.query(sql`
      DELETE FROM net_worth_currencies
      WHERE ${sql.join(
        [
          sql`net_worth_id = ${netWorthId}`,
          sql`currency = ANY(${sql.array(deletedCurrencies, 'text')})`,
        ],
        sql` AND `,
      )}
    `),

    db.query(sql`
      DELETE FROM net_worth_fx_values nwfxv
      USING net_worth_values nwv
      WHERE ${sql.join(
        [
          sql`nwfxv.values_id = nwv.id`,
          sql`nwv.net_worth_id = ${netWorthId}`,
          sql`nwv.subcategory = ANY(${sql.array(changedValues, 'uuid')})`,
        ],
        sql` AND `,
      )}
    `),

    db.query(sql`
      DELETE FROM net_worth_option_values nwopv
      USING net_worth_values nwv
      WHERE ${sql.join(
        [
          sql`nwopv.values_id = nwv.id`,
          sql`nwv.net_worth_id = ${netWorthId}`,
          sql`nwv.subcategory = ANY(${sql.array(allSubcategories, 'uuid')})`,
        ],
        sql` AND `,
      )}
    `),
  ]);

  await Promise.all([
    insertValues(db, netWorthId, values),
    insertCreditLimits(db, netWorthId, creditLimit),
    insertCurrencies(db, netWorthId, currencies),
  ]);

  const updated = await fetchById(db, netWorthId, uid);

  res.json(updated);
});
