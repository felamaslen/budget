import * as boom from '@hapi/boom';
import { Router } from 'express';

import db from '~api/modules/db';
import { validate } from '~api/modules/validate';
import { catchAsyncErrors } from '~api/modules/error-handling';
import { schemaNetWorth } from '~api/schema/net-worth';
import { routeCategories } from './categories';
import { routeSubCategories } from './subcategories';

import { onCreate } from './create';
import { onRead } from './read';
import { onUpdate } from './update';
import { onDelete } from './delete';

const unionSelectIds = async (categories: string[], after: string): Promise<{ id: string }[]> => {
  if (!categories.length) {
    return [];
  }

  return db.raw<{ id: string }[]>(`
    SELECT ids.id
    FROM (
        SELECT '${categories[0]}'::uuid AS id
        ${categories
          .slice(1)
          .map(id => `UNION SELECT '${id}'::uuid`)
          .join('\n')}
    ) AS ids
    ${after}
    `);
};

const validateCategories = catchAsyncErrors(
  async (req, _, next): Promise<void> => {
    const valuesCategories = req.body.values.map(
      ({ subcategory }: { subcategory: string }) => subcategory,
    );
    const creditLimitCategories = req.body.creditLimit.map(
      ({ subcategory }: { subcategory: string }) => subcategory,
    );

    const allSubCategories = valuesCategories.concat(creditLimitCategories);

    const invalidIds = await unionSelectIds(
      allSubCategories,
      `
        LEFT JOIN net_worth_subcategories AS nws ON nws.id = ids.id
        WHERE nws.id IS NULL
        `,
    );

    if (invalidIds.length) {
      throw boom.notFound(
        `Nonexistent subcategory IDs: ${invalidIds.map(({ id }) => id).join(',')}`,
      );
    }

    const invalidCreditCategories = await unionSelectIds(
      creditLimitCategories,
      `
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
  },
);

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
