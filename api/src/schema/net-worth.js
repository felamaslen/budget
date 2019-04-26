const joi = require('joi');

const COLOR_REGEX = /^#[0-9a-f]{6}$/;

const schemaCategory = joi.object()
    .keys({
        type: joi.string().valid(['asset', 'liability'])
            .required(),
        category: joi.string().required(),
        color: joi.string().regex(COLOR_REGEX)
    })
    .unknown(false);

module.exports = {
    schemaCategory
};
