import joi from '@hapi/joi';
import { listItem } from './list';

export const fund = listItem.append({
  transactions: joi.array().items(
    joi.object({
      date: joi.string().isoDate().required(),
      units: joi.number().required(),
      cost: joi.number().integer().required(),
    }),
  ),
  allocationTarget: joi.number().min(0).max(1).optional().allow(null),
});

export const readParams = joi.object({
  history: joi.bool().truthy('').default(false),
  period: joi.string().valid('year', 'month').default('year'),
  length: joi.number().min(1).max(20).integer().default(5),
});

export const cashTargetSchema = joi.object({
  cashTarget: joi.number().integer().min(0).required(),
});
