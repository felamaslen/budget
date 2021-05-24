import {
  sql,
  TaggedTemplateLiteralInvocationType,
  DatabaseTransactionConnectionType,
} from 'slonik';

import { defaultSearchNumResults } from '~api/schema';
import { QuerySearchArgs, ReceiptPage } from '~api/types';

export function getShortTermQuery(
  uid: number,
  { page, column, searchTerm, numResults = defaultSearchNumResults }: QuerySearchArgs,
): TaggedTemplateLiteralInvocationType<{ value: string; count: number }> {
  return sql`
  select ${sql.join(
    [
      sql`distinct(${sql.identifier([column])}) as value`,
      sql`count(${sql.identifier([column])}) as count`,
    ],
    sql`, `,
  )}
  from list_standard
  where ${sql.join(
    [
      sql`uid = ${uid}`,
      sql`page = ${page}`,
      sql`${sql.identifier([column])} ILIKE ${`${searchTerm}%`}`,
    ],
    sql` and `,
  )}
  group by ${sql.identifier([column])}
  order by ${sql.identifier(['count'])} desc
  limit ${numResults}
  `;
}

export function getLongTermQuery(
  uid: number,
  { page, column, searchTerm, numResults = defaultSearchNumResults }: QuerySearchArgs,
): TaggedTemplateLiteralInvocationType<{ value: string; rank: number; length: number }> {
  const tsQuery = searchTerm
    .trim()
    .replace(/[^\w\s+]/g, '')
    .split(/\s+/)
    .map((word) => `${word}:*`)
    .join(' | ');

  return sql`
    select distinct ${sql.join(
      [
        sql`${sql.identifier([column])} as "value"`,
        sql`ts_rank_cd(${sql.identifier([`${column}_search`])}, to_tsquery(${tsQuery})) as "rank"`,
        sql`char_length(${sql.identifier([column])}) as "length"`,
      ],
      sql`, `,
    )}
    from list_standard
    where ${sql.join(
      [
        sql`uid = ${uid}`,
        sql`page = ${page}`,
        sql`${sql.identifier([`${column}_search`])} @@ to_tsquery(${tsQuery})`,
      ],
      sql` and `,
    )}
    order by "rank" desc, "length" asc
    limit ${numResults}
  `;
}

export const getSearchResults = (
  uid: number,
  page: string,
  nextField: string,
  columnResults: TaggedTemplateLiteralInvocationType<{ value: string }>,
): TaggedTemplateLiteralInvocationType<{ value: string; nextField: string }> =>
  sql`
  with items as (${columnResults})
  select ${sql.join(
    [
      sql.identifier(['items', 'value']),
      sql`coalesce(${sql.identifier(['next_values', nextField])}, '') as "nextField"`,
    ],
    sql`, `,
  )}
  from items
  left join list_standard as next_values
    on next_values.id = (
      select id
      from list_standard
      where uid = ${uid} and page = ${page} and item = items.value
      limit 1
    )
  `;

type ReceiptItem = {
  item: string;
  matched_page: ReceiptPage;
  matched_category: string;
};

export async function matchReceiptItems(
  db: DatabaseTransactionConnectionType,
  uid: number,
  items: string[],
): Promise<readonly ReceiptItem[]> {
  const { rows } = await db.query<ReceiptItem>(sql`
  SELECT item, matched_page, matched_category
  FROM (
    SELECT ${sql.join(
      [
        sql`item`,
        sql`matched_page`,
        sql`matched_category`,
        sql`row_number() over (partition by item order by num_matches desc) as row_num`,
      ],
      sql`, `,
    )}
    FROM (
      SELECT item, page as matched_page, category as matched_category, count(category) as num_matches
      FROM list_standard
      WHERE uid = ${uid} AND item = ANY(${sql.array(items, 'text')})
      GROUP BY item, page, category
    ) matched_results
  ) ordered_results
  WHERE row_num = 1
  `);
  return rows;
}

export async function matchReceiptItemName(
  db: DatabaseTransactionConnectionType,
  uid: number,
  query: string,
): Promise<string | null> {
  const { rows } = await db.query<{ item: string }>(sql`
  SELECT item
  FROM (
    SELECT item, count(item) as num_matches
    FROM list_standard
    WHERE uid = ${uid} AND item ILIKE ${`${query}%`}
    GROUP BY item
  ) matched_results
  ORDER BY num_matches DESC
  LIMIT 1
  `);
  return rows[0]?.item ?? null;
}
