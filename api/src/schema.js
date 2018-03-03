/* eslint-disable newline-per-chained-call */

const joi = require('joi');

const transactionSchema = joi.object().keys({
    cost: joi.number().integer().required(),
    units: joi.number().required(),
    date: joi.date().iso().required()
});

const transactionListSchema = joi.array().items(transactionSchema);

module.exports = {
    transactionSchema,
    transactionListSchema
};

