/* eslint-disable newline-per-chained-call */

const baseJoi = require('joi');
const joiDateExtensions = require('joi-date-extensions');

const joi = baseJoi.extend(joiDateExtensions);

const transactionSchema = joi.object().keys({
    cost: joi.number().integer().required(),
    units: joi.number().required(),
    date: joi.date().format('YYYY-MM-DD').required(),
});

const transactionListSchema = joi.array().items(transactionSchema);

const balanceSchema = joi.object().keys({
    year: joi.number().integer().required(),
    month: joi.number().integer().required(),
    balance: joi.number().integer().required(),
});

const analysisCommonSchema = {
    period: joi.string().valid(['week', 'month', 'year']),
    groupBy: joi.string().valid(['shop', 'category']),
    pageIndex: joi.number().integer().min(0).default(0),
};

const analysisSchema = joi.object().keys(analysisCommonSchema);

const analysisDeepSchema = joi.object().keys({
    ...analysisCommonSchema,
    category: joi.string().valid(['food', 'general', 'social', 'holiday']),
});

const searchSchema = joi.object().keys({
    table: joi.string()
        .valid(['income', 'bills', 'food', 'general', 'holiday', 'social'])
        .required(),
    column: joi.when('table', {
        is: joi.valid(['income', 'bils']),
        then: joi.string().valid(['item']),
        otherwise: joi.when('table', {
            is: joi.valid(['food', 'general']),
            then: joi.string().valid(['item', 'category', 'shop']),
            otherwise: joi.string()
                .when('table', {
                    is: joi.valid(['holiday']),
                    then: joi.string().valid(['item', 'holiday', 'shop']),
                    otherwise: joi.string().valid(['item', 'society', 'shop']),
                }),
        }),
    })
        .required(),
    searchTerm: joi.string().min(1).required(),
    numResults: joi.number().integer().min(1).max(10).default(5),
});

module.exports = {
    transactionSchema,
    transactionListSchema,
    balanceSchema,
    analysisSchema,
    analysisDeepSchema,
    searchSchema,
};
