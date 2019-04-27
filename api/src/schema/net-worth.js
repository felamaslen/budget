const joi = require('joi');

const COLOR_REGEX = /^#[0-9a-f]{6}$/;

const schemaNetWorth = joi.object()
    .keys({
        date: joi.date()
            .iso()
            .required(),
        values: joi.array()
            .items(joi.object()
                .keys({
                    subcategory: joi.number()
                        .integer()
                        .min(1)
                        .required(),
                    value: joi.alternatives()
                        .try(
                            joi.number().integer(),
                            joi.array().items([
                                joi.number().integer(),
                                joi.object()
                                    .keys({
                                        value: joi.number().required(),
                                        currency: joi.string().required()
                                    })
                                    .unknown(false)
                            ])
                        )
                        .required()
                })
                .unknown(false)
            ),
        creditLimit: joi.array()
            .items(joi.object()
                .keys({
                    subcategory: joi.number()
                        .integer()
                        .min(1)
                        .required(),
                    value: joi.number()
                        .integer()
                        .required()
                })
                .unknown(false)
            ),
        currencies: joi.array()
            .items(joi.object()
                .keys({
                    currency: joi.string().required(),
                    rate: joi.number().required()
                })
                .unknown(false)
            )
    })
    .unknown(false);

const schemaSubcategory = joi.object()
    .keys({
        categoryId: joi.number().required(),
        subcategory: joi.string().required(),
        hasCreditLimit: joi.boolean(),
        opacity: joi.number()
            .min(0)
            .max(1)
    })
    .unknown(false);

const schemaCategory = joi.object()
    .keys({
        type: joi.string().valid(['asset', 'liability'])
            .required(),
        category: joi.string().required(),
        color: joi.string().regex(COLOR_REGEX)
    })
    .unknown(false);

module.exports = {
    schemaNetWorth,
    schemaSubcategory,
    schemaCategory
};
