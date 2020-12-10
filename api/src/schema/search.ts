import joi from '@hapi/joi';

export const defaultSearchNumResults = 5;

export const searchSchema = joi.object({
  page: joi.string().valid('income', 'bills', 'food', 'general', 'holiday', 'social').required(),
  column: joi
    .string()
    .when('page', {
      switch: [
        {
          is: joi.valid('income', 'bills'),
          then: joi.string().valid('item'),
        },
        {
          is: joi.valid('food', 'general', 'holiday', 'social'),
          then: joi.string().valid('item', 'category', 'shop'),
        },
      ],
    })
    .required(),
  searchTerm: joi.string().min(1).required(),
  numResults: joi.number().integer().min(1).max(10).default(defaultSearchNumResults),
});

export const receiptSchema = joi.object({
  q: joi.string().required(),
});
