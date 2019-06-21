/**
 * Update cash flow data
 */

const { DateTime } = require('luxon');
const joi = require('joi');
const { balanceSchema } = require('../../../schema');

function updateQuery(db, user, value) {
    const { year, month, balance } = value;
    const date = DateTime.fromObject({ year, month })
        .endOf('month')
        .toISODate();

    return db.transaction(async trx => {
        await trx('balance')
            .whereRaw('extract(year from balance.date) = ?', year)
            .whereRaw('extract(month from balance.date) = ?', month)
            .where({ uid: user.uid })
            .del();

        await trx.insert({ date, value: balance, uid: user.uid })
            .into('balance');
    });
}

function updateData(config, db, post = true) {
    return async (req, res) => {
        const { error, value } = joi.validate(req.body, balanceSchema);

        if (error) {
            return res
                .status(400)
                .json({ errorMessage: error.message });
        }

        await updateQuery(db, req.user, value);

        const statusCode = post
            ? 201
            : 200;

        return res
            .status(statusCode)
            .json({ success: true });
    };
}

module.exports = {
    updateQuery,
    updateData
};
