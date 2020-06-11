import joi from '@hapi/joi';

export const searchSchema = joi.object().keys({
  table: joi.string().valid('income', 'bills', 'food', 'general', 'holiday', 'social').required(),
  column: joi
    .string()
    .when('table', {
      switch: [
        {
          is: joi.valid('income', 'bills'),
          then: joi.string().valid('item'),
        },
        {
          is: joi.valid('food', 'general'),
          then: joi.string().valid('item', 'category', 'shop'),
        },
        {
          is: joi.valid('holiday'),
          then: joi.string().valid('item', 'holiday', 'shop'),
        },
        {
          is: joi.valid('social'),
          then: joi.string().valid('item', 'society', 'shop'),
        },
      ],
    })
    .required(),
  searchTerm: joi.string().min(1).required(),
  numResults: joi.number().integer().min(1).max(10).default(5),
});
