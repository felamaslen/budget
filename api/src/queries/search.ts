import { sql, TaggedTemplateLiteralInvocationType } from 'slonik';
import { SearchParams } from '~api/types';

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
