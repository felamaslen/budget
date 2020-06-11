import joi from '@hapi/joi';

export const analysisSchema = joi.object({
  period: joi.string().valid('week', 'month', 'year'),
  groupBy: joi.string().valid('shop', 'category'),
  pageIndex: joi.number().integer().min(0).default(0),
});

export const analysisDeepSchema = analysisSchema.append({
  category: joi.string().valid('food', 'general', 'social', 'holiday'),
});
