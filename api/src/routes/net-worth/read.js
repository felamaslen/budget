const { DateTime } = require('luxon');

const { catchAsyncErrors, clientError } = require('../../modules/error-handling');

const LIMIT_ALL = 48;

const formatDate = date => DateTime.fromJSDate(date).toISODate();

function processValuesRows({ id, subcategory, value, fxValues, fxCurrencies, ...rest }) {
    const base = { id, subcategory, value, ...rest };
    if (fxValues === null) {
        return base;
    }

    const initialValue = value === null
        ? []
        : [value];

    const fxValuesItems = fxValues.split(',').map(Number);
    const fxCurrenciesItems = fxCurrencies.split(',');

    const valueWithFx = fxValuesItems.reduce((last, fxValue, index) => ([
        ...last,
        {
            value: fxValue,
            currency: fxCurrenciesItems[index]
        }
    ]), initialValue);

    return { ...base, value: valueWithFx };
}

async function getValuesRows(db, ids) {
    const rows = await db.select(
        'nwv.net_worth_id as netWorthId',
        'nwv.id',
        'nwv.subcategory',
        'nwv.value',
        db.raw('group_concat(nwfxv.value) as fxValues'),
        db.raw('group_concat(nwfxv.currency) as fxCurrencies')
    )
        .from('net_worth_values as nwv')
        .leftJoin('net_worth_fx_values as nwfxv', 'nwfxv.values_id', 'nwv.id')
        .whereIn('nwv.net_worth_id', ids)
        .groupBy('nwv.id');

    return rows.map(processValuesRows);
}

const getCreditLimit = (db, ids) => db.select(
    'nwcl.net_worth_id as netWorthId',
    'nwcl.subcategory',
    'nwcl.value'
)
    .from('net_worth_credit_limit as nwcl')
    .whereIn('nwcl.net_worth_id', ids);

const getCurrencies = (db, ids) => db.select(
    'nwc.net_worth_id as netWorthId',
    'nwc.id',
    'nwc.currency',
    'nwc.rate'
)
    .from('net_worth_currencies as nwc')
    .whereIn('nwc.net_worth_id', ids);

async function fetchById(db, netWorthId, uid) {
    const [netWorth] = await db.select(
        'nw.date'
    )
        .from('net_worth as nw')
        .where('nw.id', '=', netWorthId)
        .where('nw.uid', '=', uid);

    if (!netWorth) {
        return null;
    }

    const date = formatDate(netWorth.date);

    const [values, creditLimit, currencies] = await Promise.all([
        getValuesRows(db, [netWorthId]),
        getCreditLimit(db, [netWorthId]),
        getCurrencies(db, [netWorthId])
    ]);

    const withoutId = rows => rows.map(({ netWorthId: discard, ...rest }) => rest);

    return {
        id: Number(netWorthId),
        date,
        values: withoutId(values),
        creditLimit: withoutId(creditLimit),
        currencies: withoutId(currencies)
    };
}

const splitById = rows => rows.reduce((items, { netWorthId, ...rest }) => ({
    ...items,
    [netWorthId]: (items[netWorthId] || []).concat([rest])
}), {});

async function fetchAll(db, uid) {
    const netWorth = await db.select()
        .from(qb1 => qb1.select(
            'nw.id',
            'nw.date'
        )
            .from('net_worth as nw')
            .where('nw.uid', '=', uid)
            .orderBy('date', 'desc')
            .limit(LIMIT_ALL)
            .as('results')
        )
        .orderBy('date', 'asc');

    const netWorthIds = netWorth.map(({ id }) => id);

    const [valuesRows, creditLimit, currencies] = await Promise.all([
        getValuesRows(db, netWorthIds),
        getCreditLimit(db, netWorthIds),
        getCurrencies(db, netWorthIds)
    ]);

    const valuesById = splitById(valuesRows);
    const creditLimitById = splitById(creditLimit);
    const currenciesById = splitById(currencies);

    return netWorth.map(({ id, date }) => ({
        id,
        date: formatDate(date),
        values: valuesById[id],
        creditLimit: creditLimitById[id],
        currencies: currenciesById[id]
    }));
}

const onRead = db => catchAsyncErrors(async (req, res) => {
    const uid = req.user.uid;

    if (!req.params.id) {
        const items = await fetchAll(db, uid);

        return res.json(items);
    }

    const item = await fetchById(db, req.params.id, uid);

    if (!item) {
        throw clientError('Net worth row not found', 404);
    }

    return res.json(item);
});

module.exports = {
    formatDate,
    fetchById,
    onRead
};