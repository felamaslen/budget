import * as boom from '@hapi/boom';
import db from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';
import { insertValues, insertCreditLimits, insertCurrencies } from './create';
import { formatDate, fetchById } from './read';

export const onUpdate = catchAsyncErrors(async (req, res) => {
  const { date, values, creditLimit, currencies } = req.body;

  const uid = req.user.uid;
  const netWorthId = req.params.id;

  const item = await fetchById(netWorthId, uid);
  if (!item) {
    throw boom.notFound('Net worth row not found');
  }

  await db('net_worth')
    .update({
      date: formatDate(date),
    })
    .where({ id: netWorthId });

  await Promise.all(
    ['net_worth_values', 'net_worth_credit_limit', 'net_worth_currencies'].map(table =>
      db(table)
        .where({ net_worth_id: netWorthId })
        .delete(),
    ),
  );

  await insertValues(netWorthId, values);
  await insertCreditLimits(netWorthId, creditLimit);
  await insertCurrencies(netWorthId, currencies);

  const updated = await fetchById(netWorthId, uid);

  res.json(updated);
});
