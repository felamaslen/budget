import joi, { Schema, AlternativesSchema, ObjectSchema } from '@hapi/joi';

import { fund } from './funds';
import * as list from './list';
import config from '~api/config';
import { Page } from '~api/types';

const standardSchema = (schemaType: (schema: ObjectSchema) => Schema): AlternativesSchema =>
  joi
    .when('route', {
      switch: [
        { is: Page.funds, then: fund },
        { is: Page.income, then: list.income },
        { is: Page.bills, then: list.bill },
        { is: Page.food, then: list.food },
        { is: Page.general, then: list.general },
        { is: Page.holiday, then: list.holiday },
        { is: Page.social, then: list.social },
      ].map(({ is, then }) => ({ is, then: schemaType(then) })),
    })
    .required();

export const multipleUpdateSchema = joi.object({
  list: joi
    .array()
    .items(
      joi.object({
        route: joi
          .string()
          .valid(Page.funds, ...config.data.listCategories)
          .required(),
        method: joi.string().valid('post', 'put', 'delete').required(),
        query: joi.object(),
        body: joi
          .when('method', {
            switch: [
              {
                is: 'post',
                then: standardSchema(list.insert),
              },
              {
                is: 'put',
                then: standardSchema(list.update),
              },
              {
                is: 'delete',
                then: list.deleteRequest,
              },
            ],
          })
          .required(),
      }),
    )
    .required(),
});
