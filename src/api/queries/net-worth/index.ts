import {
  sql,
  DatabaseTransactionConnectionType,
  TaggedTemplateLiteralInvocationType,
} from 'slonik';
import { Item } from '~api/types';

export * from './create';
export * from './read';
export * from './update';
export * from './delete';

const unionSelectIds = (
  categories: number[],
): TaggedTemplateLiteralInvocationType<{ id: number }> => sql`
SELECT ids.id
FROM (
  SELECT ${categories[0]}::int4 AS id
  ${
    categories.length > 1
      ? sql.join(
          categories.slice(1).map((id) => sql`UNION SELECT ${id}::int4`),
          sql` `,
        )
      : sql``
  }
) AS ids
`;

export const getInvalidIds = async (
  db: DatabaseTransactionConnectionType,
  subcategories: number[],
): Promise<readonly Item[]> => {
  if (!subcategories.length) {
    return [];
  }
  const invalidIds = await db.query<Item>(sql`
  ${unionSelectIds(subcategories)}
  LEFT JOIN net_worth_subcategories AS nws ON nws.id = ids.id
  WHERE nws.id IS NULL
  `);
  return invalidIds.rows;
};

export const getInvalidCreditCategories = async (
  db: DatabaseTransactionConnectionType,
  creditLimitCategories: number[],
): Promise<readonly Item[]> => {
  if (!creditLimitCategories.length) {
    return [];
  }
  const invalidIds = await db.query<Item>(sql`
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
