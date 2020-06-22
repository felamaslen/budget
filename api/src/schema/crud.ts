import joi from '@hapi/joi';

export const idParamSchemaOptional = joi.object({
  id: joi.number().integer().min(1),
});

export const idParamSchemaRequired = idParamSchemaOptional.options({ presence: 'required' });
