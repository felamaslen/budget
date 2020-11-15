import joi from '@hapi/joi';

export const previewQuerySchema = joi.object({
  year: joi.number().integer().min(1).required(),
  month: joi.number().integer().min(1).max(12).required(),
  category: joi
    .string()
    .valid('income', 'bills', 'food', 'general', 'social', 'holiday')
    .required(),
});
