import * as boom from '@hapi/boom';
import db from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';

export const onDelete = catchAsyncErrors(async (req, res) => {
  const [item] = await db
    .select<{ id: string }[]>('id')
    .from('net_worth')
    .where('uid', '=', req.user.uid)
    .where('id', '=', req.params.id);

  if (!item) {
    throw boom.notFound('Unknown net worth item');
  }

  await db('net_worth')
    .where('id', '=', req.params.id)
    .delete();

  res.status(204).end();
});
