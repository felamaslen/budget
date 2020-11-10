import joi, { Schema, ObjectSchema } from '@hapi/joi';
import { idParamSchemaRequired } from './crud';

export const insert = (schema: ObjectSchema): Schema => schema.options({ presence: 'required' });

export const update = (schema: ObjectSchema): Schema =>
  schema.append({ id: joi.number().integer().min(1).required() });

export const listItem = joi.object({
  item: joi.string(),
});

const standardItem = listItem.append({
  date: joi.string().isoDate(),
  cost: joi.number().integer(),
});

const extendedItem = standardItem.append({
  category: joi.string(),
  shop: joi.string(),
});

export const income = standardItem;
export const bill = standardItem;

export const food = extendedItem;
export const general = extendedItem;
export const holiday = extendedItem;
export const social = extendedItem;

export const deleteRequest = idParamSchemaRequired;
