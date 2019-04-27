const joi = require('joi');

const COLOR_REGEX = /^#[0-9a-f]{6}$/;

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
    schemaSubcategory,
    schemaCategory
};
