const { catchAsyncErrors } = require('../../modules/error-handling');
const { formatDate, fetchById } = require('./read');

function getValueRow(netWorthId) {
    return ({ subcategory, value }) => {
        const base = {
            'net_worth_id': netWorthId,
            subcategory
        };

        if (!(value && Array.isArray(value))) {
            return { ...base, value };
        }

        const simpleValues = value.filter(item => typeof item === 'number');

        if (!simpleValues.length) {
            return { ...base, value: null };
        }

        return {
            ...base,
            value: simpleValues.reduce((sum, item) => sum + item, 0)
        };
    };
}

function getFxValueRow(netWorthId, valueIds) {
    return (last, { value: valueArray }, index) => {
        if (!(valueArray && Array.isArray(valueArray))) {
            return last;
        }

        const valueId = valueIds[index];

        const fxRows = valueArray.filter(item => typeof item !== 'number')
            .map(({ value, currency }) => ({
                'values_id': valueId,
                value,
                currency
            }));

        return last.concat(fxRows);
    };
}

async function insertValues(db, netWorthId, values = []) {
    if (!values.length) {
        return;
    }

    const valuesRows = values.map(getValueRow(netWorthId));

    const [firstId] = await db.insert(valuesRows)
        .returning('id')
        .into('net_worth_values');

    // This is possible provided:
    // - we're using mySQL
    // - the table is InnoDB
    // - the auto increment lock mode is set to 0 or 1 (default)
    // See here for more info: https://dev.mysql.com/doc/refman/5.7/en/innodb-auto-increment-handling.html
    // Also this SO: https://github.com/tgriesser/knex/issues/1828#issuecomment-272635117
    const valueIds = valuesRows.map((item, index) => firstId + index);

    const fxValuesRows = values.reduce(getFxValueRow(netWorthId, valueIds), []);

    await db.insert(fxValuesRows)
        .into('net_worth_fx_values');
}

const insertWithNetWorthId = table => async (db, netWorthId, rows = []) => {
    if (!rows.length) {
        return;
    }

    const rowsWithId = rows.map(row => ({ 'net_worth_id': netWorthId, ...row }));

    await db.insert(rowsWithId).into(table);
};

const insertCreditLimits = insertWithNetWorthId('net_worth_credit_limit');

const insertCurrencies = insertWithNetWorthId('net_worth_currencies');

const onCreate = db => catchAsyncErrors(async (req, res) => {
    const {
        date,
        values,
        creditLimit,
        currencies
    } = req.validBody;

    const uid = req.user.uid;

    const [netWorthId] = await db.insert({
        uid,
        date: formatDate(date)
    })
        .returning('id')
        .into('net_worth');

    await insertValues(db, netWorthId, values);
    await insertCreditLimits(db, netWorthId, creditLimit);
    await insertCurrencies(db, netWorthId, currencies);

    const netWorth = await fetchById(db, netWorthId, uid);

    res.json(netWorth);
});

module.exports = {
    getValueRow,
    getFxValueRow,
    onCreate
};
