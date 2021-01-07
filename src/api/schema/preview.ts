import joi from '@hapi/joi';

export const previewQuerySchema = joi.object({
  width: joi.number().integer().min(10).required(),
  height: joi.number().integer().min(10).required(),
  scale: joi.number().integer().valid(1, 2, 3).optional().default(1),
  year: joi.number().integer().min(1).required(),
  month: joi.number().integer().min(1).max(12).required(),
  category: joi
    .string()
    .valid('income', 'bills', 'food', 'general', 'social', 'holiday')
    .required(),
});
