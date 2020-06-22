import joi from '@hapi/joi';

export const loginSchema = joi.object({
  pin: joi.number().integer().min(1000).max(9999).required(),
});

export const tokenSchema = joi
  .object({
    uid: joi.number().integer().min(1).required(),
  })
  .unknown(true);
