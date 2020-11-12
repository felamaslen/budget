import {
  sql,
  TaggedTemplateLiteralInvocationType,
  DatabaseTransactionConnectionType,
} from 'slonik';

import { SearchParams, ListCalcCategoryExtended, Page } from '~api/types';

export const getShortTermQuery = (
  uid: number,
  { table, column, searchTerm, numResults }: SearchParams,
): TaggedTemplateLiteralInvocationType<{ value: string; count: number }> =>
  sql`
  select ${sql.join(
    [
      sql`distinct(${sql.identifier([table, column])}) as "value"`,
      sql`count(${sql.identifier([table, column])}) as "count"`,
    ],
    sql`, `,
  )}
  from ${sql.identifier([table])}
  where ${sql.join(
    [
      sql`${sql.identifier([table, column])} ilike ${`${searchTerm}%`}`,
      sql`${sql.identifier([table, 'uid'])} = ${uid}`,
    ],
    sql` and `,
  )}
  group by ${sql.identifier([table, column])}
  order by "count" desc
  limit ${numResults}
  `;

export function getLongTermQuery(
  uid: number,
  { table, column, searchTerm, numResults }: SearchParams,
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
        sql`${sql.identifier([table, column])} as "value"`,
        sql`ts_rank_cd(
          ${sql.identifier([table, `${column}_search`])},
          to_tsquery(${tsQuery})
        ) as "rank"`,
        sql`char_length(${sql.identifier([table, column])}) as "length"`,
      ],
      sql`, `,
    )}
    from ${sql.identifier([table])}
    where ${sql.join(
      [
        sql`${sql.identifier([table, 'uid'])} = ${uid}`,
        sql`${sql.identifier([table, `${column}_search`])} @@ to_tsquery(${tsQuery})`,
      ],
      sql` and `,
    )}
    order by "rank" desc, "length" asc
    limit ${numResults}
  `;
}

export const getSearchResults = (
  uid: number,
  table: string,
  nextField: string,
  columnResults: TaggedTemplateLiteralInvocationType<{ value: string }>,
): TaggedTemplateLiteralInvocationType<{ value: string; nextField: string }> =>
  sql`
  select ${sql.join(
    [
      sql.identifier(['items', 'value']),
      sql`coalesce(${sql.identifier(['next_values', nextField])}, '') as "nextField"`,
    ],
    sql`, `,
  )}
  from (
    ${columnResults}
  ) as items
  left join ${sql.identifier([table])} as "next_values"
    on ${sql.identifier(['next_values', 'id'])} = (
      select "id"
      from ${sql.identifier([table])}
      where ${sql.join([sql`"uid" = ${uid}`, sql`"item" = "items"."value"`], sql` and `)}
      limit 1
    )
  `;

type ReceiptItem = {
  item: string;
  matched_page: ListCalcCategoryExtended;
  matched_category: string;
};

const receiptPages: ListCalcCategoryExtended[] = [Page.food, Page.general, Page.social];

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
    FROM (${sql.join(
      receiptPages.map(
        (page) => sql`
      SELECT item, matched_page, matched_category, count(matched_category) as num_matches
      FROM (
        SELECT ${sql.join(
          [sql`item`, sql`${page} AS matched_page`, sql`category as matched_category`],
          sql`, `,
        )}
        FROM ${sql.identifier([page])}
        WHERE uid = ${uid} AND item IN (${sql.join(items, sql`, `)})
      ) matched_results
      GROUP BY item, matched_page, matched_category
      `,
      ),
      sql` UNION `,
    )}) matched_union
  ) ordered_union
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
  SELECT item, num_matches
  FROM (${sql.join(
    receiptPages.map(
      (page) => sql`
    SELECT item, count(item) as num_matches
    FROM (
      SELECT item
      FROM ${sql.identifier([page])}
      WHERE uid = ${uid} AND item ILIKE ${`${query}%`}
    ) matched_results
    GROUP BY item
    `,
    ),
    sql` UNION `,
  )}) matched_union
  ORDER BY num_matches DESC
  LIMIT 1
  `);
  return rows[0]?.item ?? null;
}
