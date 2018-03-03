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

const analysisCommonSchema = {
    period: joi.string().valid(['week', 'month', 'year']),
    groupBy: joi.string().valid(['shop', 'category']),
    pageIndex: joi.number().integer().min(0).default(0)
};

const analysisSchema = joi.object().keys(analysisCommonSchema);

const analysisDeepSchema = joi.object().keys({
    ...analysisCommonSchema,
    category: joi.string().valid(['food', 'general', 'social', 'holiday'])
});

module.exports = {
    transactionSchema,
    transactionListSchema,
    balanceSchema,
    analysisSchema,
    analysisDeepSchema
};

