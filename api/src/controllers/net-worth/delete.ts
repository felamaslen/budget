import boom from '@hapi/boom';
import { DatabaseTransactionConnectionType } from 'slonik';

import { deleteNetWorthEntryRow } from '~api/queries';

export async function deleteNetWorthEntry(
  db: DatabaseTransactionConnectionType,
  uid: number,
  netWorthId: number,
): Promise<void> {
  const numRows = await deleteNetWorthEntryRow(db, uid, netWorthId);
  if (!numRows) {
    throw boom.notFound('Net worth entry not found');
  }
}
