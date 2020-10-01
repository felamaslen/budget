import joi from '@hapi/joi';
import { listItem } from './list';

export const fund = listItem.append({
  transactions: joi.array().items(
    joi.object({
      date: joi.string().isoDate().required(),
      units: joi.number().required(),
      price: joi.number().required(),
      fees: joi.number().integer().optional().default(0),
      taxes: joi.number().integer().optional().default(0),
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
