import joi from '@hapi/joi';
import config from '~api/config';

export const allQuerySchema = joi.object({
  limit: joi.number().integer().min(10).optional().default(config.data.listPageLimit),
  history: joi.bool().optional().default(true),
  period: joi.string().valid('year', 'month').optional().default('year'),
  length: joi.number().integer().min(1).optional().default(5),
});
