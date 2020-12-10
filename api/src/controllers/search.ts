import { TaggedTemplateLiteralInvocationType, DatabaseTransactionConnectionType } from 'slonik';

import {
  getShortTermQuery,
  getLongTermQuery,
  getSearchResults,
  matchReceiptItems,
  matchReceiptItemName,
} from '~api/queries/search';
import { searchSchema } from '~api/schema';
import {
  SearchResult,
  ReceiptCategory,
  QuerySearchArgs,
  QueryReceiptItemArgs,
  QueryReceiptItemsArgs,
} from '~api/types';

export const getColumnResults = (
  uid: number,
  params: QuerySearchArgs,
): TaggedTemplateLiteralInvocationType<{ value: string }> =>
  params.searchTerm.length < 3 ? getShortTermQuery(uid, params) : getLongTermQuery(uid, params);

export const getSuggestions = async (
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QuerySearchArgs,
): Promise<SearchResult> => {
  const validationResult = searchSchema.validate(args);
  if (validationResult.error) {
    return { error: validationResult.error.message, list: [] };
  }

  const { page, column } = args;
  if (['food', 'general'].includes(page) && column === 'item') {
    const nextField = 'category'; // TODO: make this dynamic / define it somewhere

    const result = await db.query<{ value: string; nextField: string }>(
      getSearchResults(uid, page, nextField, getColumnResults(uid, args)),
    );

    const list = result.rows.map(({ value }) => value);
    const nextCategory = result.rows.map(({ nextField: value }) => value);

    return { list, nextCategory, nextField };
  }

  const result = await db.query<{ value: string }>(getColumnResults(uid, args));
  const list = result.rows.map(({ value }) => value);
  return { list };
};

export async function getReceiptItem(
  db: DatabaseTransactionConnectionType,
  uid: number,
  args: QueryReceiptItemArgs,
): Promise<string | null> {
  return matchReceiptItemName(db, uid, args.item);
}

export async function getReceiptCategories(
  db: DatabaseTransactionConnectionType,
  uid: number,
  { items }: QueryReceiptItemsArgs,
): Promise<ReceiptCategory[]> {
  const results = await matchReceiptItems(db, uid, items);
  return results.map<ReceiptCategory>((row) => ({
    item: row.item,
    page: row.matched_page,
    category: row.matched_category,
  }));
}
