/* eslint-disable newline-per-chained-call */

const joi = require('joi');

const transactionSchema = joi.object().keys({
    cost: joi.number().integer().required(),
    units: joi.number().required(),
    date: joi.date().iso().required()
});

const transactionListSchema = joi.array().items(transactionSchema);

const balanceSchema = joi.object().keys({
    year: joi.number().integer().required(),
    month: joi.number().integer().required(),
    balance: joi.number().integer().required()
});

module.exports = {
    transactionSchema,
    transactionListSchema,
    balanceSchema
};

