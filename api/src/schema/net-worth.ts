import joi from '@hapi/joi';

const COLOR_REGEX = /^#[0-9a-f]{6}$/;

export const schemaNetWorth = joi
  .object({
    date: joi.date().iso().required(),
    values: joi.array().items(
      joi
        .object({
          subcategory: joi.number().integer().min(1).required(),
          skip: joi.boolean().allow(null).default(null),
          value: joi
            .alternatives()
            .try(
              joi.number().integer(),
              joi.array().items(
                joi.number().integer(),
                joi
                  .object({
                    value: joi.number().required(),
                    currency: joi.string().required(),
                  })
                  .unknown(false),
                joi
                  .object({
                    units: joi.number().required(),
                    strikePrice: joi.number().required(),
                    marketPrice: joi.number().required(),
                    vested: joi.number().integer().min(0).optional().default(0),
                  })
                  .unknown(false),
              ),
            )
            .required(),
        })
        .unknown(false),
    ),
    creditLimit: joi.array().items(
      joi
        .object({
          subcategory: joi.number().integer().min(1).required(),
          value: joi.number().integer().required(),
        })
        .unknown(false),
    ),
    currencies: joi.array().items(
      joi
        .object({
          currency: joi.string().required(),
          rate: joi.number().required(),
        })
        .unknown(false),
    ),
  })
  .unknown(false);

export const schemaSubcategory = joi
  .object({
    categoryId: joi.number().integer().min(1).required(),
    subcategory: joi.string().required(),
    hasCreditLimit: joi.boolean().allow(null),
    opacity: joi.number().min(0).max(1),
  })
  .unknown(false);

export const schemaCategory = joi
  .object({
    type: joi.string().valid('asset', 'liability').required(),
    category: joi.string().required(),
    color: joi.string().regex(COLOR_REGEX),
    isOption: joi.boolean().allow(null),
  })
  .unknown(false);
