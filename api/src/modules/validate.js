const joi = require('joi');

function validate(schema) {
    return (req, res, next) => {
        const { error, value } = joi.validate(req.body, schema);

        if (error) {
            const err = new Error(error.message);
            err.status = 400;

            throw err;
        }

        req.validBody = value;

        return next();
    };
}

module.exports = {
    validate,
};
