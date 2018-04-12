/* eslint-disable newline-per-chained-call */

const baseJoi = require('joi');
const joiDateExtensions = require('joi-date-extensions');
const joi = baseJoi.extend(joiDateExtensions);

const listItemKeysStandard = {
    date: joi.date().format('YYYY-MM-DD'),
    item: joi.string(),
    cost: joi.number().integer()
};

const listItemKeysConsumable = (category = 'category') => ({
    ...listItemKeysStandard,
    [category]: joi.string(),
    shop: joi.string()
});

const schemaDeleteListItem = joi.object().keys({
    id: joi.number().integer().required()
});

const schemaInsert = keys => joi.object().keys(Object.keys(keys)
    .reduce((items, key) => ({ ...items, [key]: keys[key].required() }), {})
);

const schemaUpdate = keys => joi.object().keys({
    id: joi.number().integer().required(),
    ...keys
});

const schemaCategoriesStandard = ['income', 'bills'];
const schemaCategoriesConsumable = ['food', 'general', 'holiday', 'social'];

const consumableCategories = { holiday: 'holiday', social: 'society' };

const schemaInsertStandard = schemaCategoriesStandard.reduce(
    (items, key) => ({ ...items, [key]: schemaInsert(listItemKeysStandard) }), {}
);

const schemaInsertConsumable = schemaCategoriesConsumable.reduce((items, key) => ({
    ...items, [key]: schemaInsert(listItemKeysConsumable(consumableCategories[key]))
}), {});

const schemaUpdateStandard = schemaCategoriesStandard.reduce(
    (items, key) => ({ ...items, [key]: schemaUpdate(listItemKeysStandard) }), {}
);

const schemaUpdateConsumable = schemaCategoriesConsumable.reduce((items, key) => ({
    ...items, [key]: schemaUpdate(listItemKeysConsumable(consumableCategories[key]))
}), {});

const listItemSchema = {
    insert: { ...schemaInsertStandard, ...schemaInsertConsumable },
    update: { ...schemaUpdateStandard, ...schemaUpdateConsumable },
    delete: schemaDeleteListItem
};

module.exports = {
    listItemSchema,
    schemaInsert,
    schemaUpdate
};

