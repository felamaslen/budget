import { TaggedTemplateLiteralInvocationType, DatabaseTransactionConnectionType } from 'slonik';

import {
  getShortTermQuery,
  getLongTermQuery,
  getSearchResults,
  matchReceiptItems,
  matchReceiptItemName,
} from '~api/queries/search';
import { SearchParams, SearchResult, ReceiptCategory } from '~api/types';

export const getColumnResults = (
  uid: number,
  params: SearchParams,
): TaggedTemplateLiteralInvocationType<{ value: string }> =>
  params.searchTerm.length < 3 ? getShortTermQuery(uid, params) : getLongTermQuery(uid, params);

export const getSuggestions = async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  params: SearchParams,
): Promise<SearchResult> => {
  const { table, column } = params;

  if (['food', 'general'].includes(table) && column === 'item') {
    const nextField = 'category'; // TODO: make this dynamic / define it somewhere

    const result = await db.query<{ value: string; nextField: string }>(
      getSearchResults(uid, params.table, nextField, getColumnResults(uid, params)),
    );

    const list = result.rows.map(({ value }) => value);
    const nextCategory = result.rows.map(({ nextField: value }) => value);

    return { list, nextCategory, nextField };
  }

  const result = await db.query<{ value: string }>(getColumnResults(uid, params));
  const list = result.rows.map(({ value }) => value);
  return { list };
};

export async function getReceiptCategories(
  db: DatabaseTransactionConnectionType,
  uid: number,
  query: string,
): Promise<ReceiptCategory[]> {
  const items = query.split(',');
  const results = await matchReceiptItems(db, uid, items);
  return results.map<ReceiptCategory>((row) => ({
    item: row.item,
    page: row.matched_page,
    category: row.matched_category,
  }));
}

export async function getReceiptItem(
  db: DatabaseTransactionConnectionType,
  uid: number,
  query: string,
): Promise<{ result: string | null }> {
  const result = await matchReceiptItemName(db, uid, query);
  return { result };
}
