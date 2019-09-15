const { clientError, catchAsyncErrors } = require('../../modules/error-handling');
const { insertValues, insertCreditLimits, insertCurrencies } = require('./create');
const { formatDate, fetchById } = require('./read');

const onUpdate = (db) => catchAsyncErrors(async (req, res) => {
    const {
        date,
        values,
        creditLimit,
        currencies,
    } = req.validBody;

    const { uid } = req.user;
    const netWorthId = req.params.id;

    const item = await fetchById(db, netWorthId, uid);
    if (!item) {
        throw clientError('Net worth row not found', 404);
    }

    await db('net_worth')
        .update({
            date: formatDate(date),
        })
        .where({ id: netWorthId });

    await Promise.all([
        'net_worth_values',
        'net_worth_credit_limit',
        'net_worth_currencies',
    ]
        .map((table) => db(table)
            .where({ net_worth_id: netWorthId })
            .delete()));

    await insertValues(db, netWorthId, values);
    await insertCreditLimits(db, netWorthId, creditLimit);
    await insertCurrencies(db, netWorthId, currencies);

    const updated = await fetchById(db, netWorthId, uid);

    res.json(updated);
});

module.exports = {
    onUpdate,
};
