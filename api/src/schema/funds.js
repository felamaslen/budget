const baseJoi = require('joi');
const joiDateExtensions = require('joi-date-extensions');
const joi = baseJoi.extend(joiDateExtensions);
const { schemaInsert, schemaUpdate } = require('./list');

const fundsKeys = {
    item: joi.string(),
    transactions: joi.array().items(joi.object().keys({
        date: joi.date().format('YYYY-MM-DD')
            .required(),
        units: joi.number().required(),
        cost: joi.number().integer()
            .required()
    }))
};

const schemaInsertFunds = schemaInsert(fundsKeys);
const schemaUpdateFunds = schemaUpdate(fundsKeys);

module.exports = {
    insert: schemaInsertFunds,
    update: schemaUpdateFunds
};
