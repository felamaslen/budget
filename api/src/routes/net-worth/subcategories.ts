import * as boom from '@hapi/boom';
import joi from 'joi';
import { Router } from 'express';

import { makeCrudRoute, checkItem } from '~api/modules/crud';
import { DJMap, mapExternalToInternal, mapInternalToExternal } from '~api/modules/key-map';
import { schemaSubcategory } from '~api/schema/net-worth';
import { Subcategory, SubcategoryRow } from './types';

const dbMap: DJMap<SubcategoryRow> = [
  { external: 'categoryId', internal: 'category_id' },
  { external: 'hasCreditLimit', internal: 'has_credit_limit' },
];

const toDb = mapExternalToInternal(dbMap);

export function routeSubCategories(): Router {
  const router = Router();

  const checkCategoryExists = checkItem('net_worth_categories', 'Category', req => {
    const { error } = joi.validate(
      req.body,
      joi
        .object({
          categoryId: joi
            .string()
            .uuid()
            .required(),
        })
        .unknown(true),
    );

    if (error) {
      throw boom.badRequest(error.message);
    }

    return req.body.categoryId;
  });

  router.post('/*', checkCategoryExists);
  router.put('/*', checkCategoryExists);

  makeCrudRoute<SubcategoryRow, Subcategory>({
    table: 'net_worth_subcategories',
    item: 'Subcategory',
    schema: schemaSubcategory,
    jsonToDb: (body, params) => toDb({ ...body, ...params }),
    dbToJson: mapInternalToExternal(dbMap),
  })(router);

  return router;
}
