/**
 * Update cash flow data
 */

function updateQuery(db, user, year, month, balance) {
    return db.raw(`
    INSERT INTO balance (uid, year, month, balance)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE year = ?, month = ?, balance = ?
    `, [user.uid, year, month, balance, year, month, balance]);
}

function validateParams(req) {
    const year = Number(req.body.year) || null;

    if (!year) {
        return { isValid: false, param: 'year' };
    }

    const month = Number(req.body.month) || null;

    if (!month || month < 1 || month > 12) {
        return { isValid: false, param: 'month' };
    }

    if (!('balance' in req.body) || isNaN(req.body.balance)) {
        return { isValid: false, param: 'balance' };
    }

    const balance = Math.round(Number(req.body.balance));

    return { isValid: true, year, month, balance };
}

function updateData(config, db, post = true) {
    return async (req, res) => {
        const params = validateParams(req);

        if (!params.isValid) {
            return res.status(400)
                .json({ errorMessage: `Invalid value for ${params.param}` });
        }

        await updateQuery(db, req.user, params.year, params.month, params.balance);

        const statusCode = post
            ? 201
            : 200;

        return res.status(statusCode)
            .json({ success: true });
    };
}

module.exports = {
    updateQuery,
    validateParams,
    updateData
};

