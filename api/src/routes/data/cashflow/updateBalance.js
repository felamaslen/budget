/**
 * Update cash flow data
 */

const joi = require('joi');
const { balanceSchema } = require('../../../schema');

function updateQuery(db, user, value) {
    const { year, month, balance } = value;
    const date = new Date(year, month - 1, 1);

    return db.raw(`
    INSERT INTO balance (uid, date, balance)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE balance = ?
    `, [user.uid, date, balance, balance]);
}

function updateData(config, db, post = true) {
    return async (req, res) => {
        const { error, value } = joi.validate(req.body, balanceSchema);

        if (error) {
            return res.status(400)
                .json({ errorMessage: error.message });
        }

        await updateQuery(db, req.user, value);

        const statusCode = post
            ? 201
            : 200;

        return res.status(statusCode)
            .json({ success: true });
    };
}

module.exports = {
    updateQuery,
    updateData
};

