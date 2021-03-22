import boom from '@hapi/boom';
import { DatabaseTransactionConnectionType } from 'slonik';

import { readNetWorthCashTotal } from './read';
import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import { deleteNetWorthEntryRow } from '~api/queries';
import { MutationDeleteNetWorthEntryArgs, CrudResponseDelete } from '~api/types';

export async function deleteNetWorthEntry(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { id }: MutationDeleteNetWorthEntryArgs,
): Promise<CrudResponseDelete> {
  const numRows = await deleteNetWorthEntryRow(db, uid, id);
  if (!numRows) {
    throw boom.notFound('Net worth entry not found');
  }
  const cashTotal = await readNetWorthCashTotal(db, uid);
  await pubsub.publish(`${PubSubTopic.NetWorthEntryDeleted}.${uid}`, { id });
  await pubsub.publish(`${PubSubTopic.NetWorthCashTotalUpdated}.${uid}`, cashTotal);
  return { error: null };
}
