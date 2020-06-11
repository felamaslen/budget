import { sql, DatabaseTransactionConnectionType, SqlSqlTokenType } from 'slonik';
import { IDRow } from '~api/types';

export * from './create';
export * from './read';
export * from './update';
export * from './delete';

const unionSelectIds = (categories: string[]): SqlSqlTokenType<IDRow> => sql`
SELECT ids.id
FROM (
  SELECT ${categories[0]}::uuid AS id
  ${
    categories.length > 1
      ? sql.join(
          categories.slice(1).map((id) => sql`UNION SELECT ${id}::uuid`),
          sql` `,
        )
      : sql``
  }
) AS ids
`;

export const getInvalidIds = async (
  db: DatabaseTransactionConnectionType,
  subcategories: string[],
): Promise<readonly IDRow[]> => {
  if (!subcategories.length) {
    return [];
  }
  const invalidIds = await db.query<IDRow>(sql`
  ${unionSelectIds(subcategories)}
  LEFT JOIN net_worth_subcategories AS nws ON nws.id = ids.id
  WHERE nws.id IS NULL
  `);
  return invalidIds.rows;
};

export const getInvalidCreditCategories = async (
  db: DatabaseTransactionConnectionType,
  creditLimitCategories: string[],
): Promise<readonly IDRow[]> => {
  if (!creditLimitCategories.length) {
    return [];
  }
  const invalidIds = await db.query<IDRow>(sql`
  ${unionSelectIds(creditLimitCategories)}
  LEFT JOIN net_worth_subcategories AS nws ON nws.id = ids.id
  LEFT JOIN net_worth_categories AS nwc ON nwc.id = nws.category_id
  WHERE ${sql.join(
    [
      sql`nwc.id IS NULL`,
      sql`nws.has_credit_limit != TRUE`,
      sql`nwc.id IS NULL`,
      sql`nwc.type != 'liability'`,
    ],
    sql` OR `,
  )}
  `);
  return invalidIds.rows;
};
