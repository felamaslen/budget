import { DatabaseTransactionConnectionType, SqlSqlTokenType } from 'slonik';

import { getShortTermQuery, getLongTermQuery, getSearchResults } from '~api/queries/search';
import { SearchParams, SearchResult } from '~api/types';

export const getColumnResults = (uid: number, params: SearchParams): SqlSqlTokenType =>
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
