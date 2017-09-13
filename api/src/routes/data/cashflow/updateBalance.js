/**
 * Update cash flow data
 */

function updateQuery(db, user, year, month, balance) {
    return db.query(`
    INSERT INTO balance (uid, year, month, balance)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE year = ?, month = ?, balance = ?
    `, user.uid, year, month, balance, year, month, balance);
}

function validateParams(req) {
    const year = parseInt(req.body.year || null, 10);

    if (isNaN(year)) {
        return { isValid: false, param: 'year' };
    }

    const month = parseInt(req.body.month || null, 10);

    if (isNaN(month) || month < 1 || month > 12) {
        return { isValid: false, param: 'month' };
    }

    if (!('balance' in req.body) || isNaN(req.body.balance)) {
        return { isValid: false, param: 'balance' };
    }

    const balance = parseInt(req.body.balance, 10);

    return { isValid: true, year, month, balance };
}

async function updateData(req, res, post = true) {
    const params = validateParams(req);

    if (!params.isValid) {
        return res
            .status(400)
            .json({
                error: true,
                errorMessage: `Invalid value for ${params.param}`
            });
    }

    await updateQuery(req.db, req.user, params.year, params.month, params.balance);

    await req.db.end();

    const statusCode = post
        ? 201
        : 200;

    return res
        .status(statusCode)
        .json({
            error: false
        });
}

module.exports = {
    updateQuery,
    validateParams,
    updateData
};

