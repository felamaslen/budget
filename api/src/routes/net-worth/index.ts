import * as boom from '@hapi/boom';
import { Router } from 'express';
import { sql, DatabaseTransactionConnectionType, SqlSqlTokenType, QueryResultType } from 'slonik';

import { authDbRoute } from '~api/middleware/request';
import { validate } from '~api/modules/validate';
import { schemaNetWorth } from '~api/schema/net-worth';
import { routeCategories } from './categories';
import { routeSubCategories } from './subcategories';

import { onCreate } from './create';
import { onRead } from './read';
import { onUpdate } from './update';
import { onDelete } from './delete';

const unionSelectIds = async (
  db: DatabaseTransactionConnectionType,
  categories: string[],
  after: SqlSqlTokenType<QueryResultType<string>>,
): Promise<readonly { id: string }[]> => {
  if (!categories.length) {
    return [];
  }

  const { rows } = await db.query<{ id: string }>(sql`
    SELECT ids.id
    FROM (
      SELECT ${categories[0]}::uuid AS id
      ${
        categories.length > 1
          ? sql.join(
              categories.slice(1).map(id => sql`UNION SELECT ${id}::uuid`),
              sql` `,
            )
          : sql``
      }
    ) AS ids
    ${after}
  `);

  return rows;
};

const validateCategories = authDbRoute(async (db, req, _, next) => {
  const valuesCategories = req.body.values.map(
    ({ subcategory }: { subcategory: string }) => subcategory,
  );
  const creditLimitCategories = req.body.creditLimit.map(
    ({ subcategory }: { subcategory: string }) => subcategory,
  );

  const allSubCategories = valuesCategories.concat(creditLimitCategories);

  const invalidIds = await unionSelectIds(
    db,
    allSubCategories,
    sql`
      LEFT JOIN net_worth_subcategories AS nws ON nws.id = ids.id
      WHERE nws.id IS NULL
    `,
  );

  if (invalidIds.length) {
    throw boom.notFound(`Nonexistent subcategory IDs: ${invalidIds.map(({ id }) => id).join(',')}`);
  }

  const invalidCreditCategories = await unionSelectIds(
    db,
    creditLimitCategories,
    sql`
      LEFT JOIN net_worth_subcategories AS nws ON nws.id = ids.id
      LEFT JOIN net_worth_categories AS nwc ON nwc.id = nws.category_id
      WHERE nwc.id IS NULL
          OR nws.has_credit_limit != TRUE
          OR nwc.id IS NULL
          OR nwc.type != 'liability'
    `,
  );

  if (invalidCreditCategories.length) {
    throw boom.badRequest(
      `Tried to add credit limit to non-credit subcategory: ${invalidCreditCategories
        .map(({ id }) => id)
        .join(',')}`,
    );
  }

  if (Array.from(new Set(creditLimitCategories)).length !== creditLimitCategories.length) {
    throw boom.badRequest('Duplicate credit limit subcategories');
  }

  next();
});

export function netWorthRoute(): Router {
  const router = Router();

  router.use('/categories', routeCategories());
  router.use('/subcategories', routeSubCategories());

  router.post('/', validate(schemaNetWorth), validateCategories, onCreate);

  router.get('/:id?', onRead);

  router.put('/:id', validate(schemaNetWorth), validateCategories, onUpdate);

  router.delete('/:id', onDelete);

  return router;
}
