const { DateTime } = require('luxon');

const { catchAsyncErrors, clientError } = require('../../modules/error-handling');

const formatDate = date => DateTime.fromJSDate(date).toISODate();

function processValuesRows({
    id,
    subcategory,
    skip,
    value,
    'fx_values': fxValues,
    'fx_currencies': fxCurrencies,
    ...rest
}) {
    const base = { id, subcategory, skip, value, ...rest };
    if (fxValues.every(item => item === null)) {
        return base;
    }

    const initialValue = value === null
        ? []
        : [value];

    const valueWithFx = fxValues.reduce((last, fxValue, index) => ([
        ...last,
        {
            value: fxValue,
            currency: fxCurrencies[index]
        }
    ]), initialValue);

    return { ...base, value: valueWithFx };
}

async function getValuesRows(db, ids) {
    const rows = await db.select(
        'nwv.net_worth_id as netWorthId',
        'nwv.id',
        'nwv.subcategory',
        'nwv.skip',
        'nwv.value',
        db.raw('ARRAY_AGG(nwfxv.value) as fx_values'),
        db.raw('ARRAY_AGG(nwfxv.currency) as fx_currencies')
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
        id: netWorthId,
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

async function fetchOld(db, uid, startDate, oldDateEnd) {
    const rows = await db.select(db.raw(`sum(coalesce(nwv.value, (nwfx.value * nwc.rate * 100), 0))::integer as value`))
        .from('net_worth as nw')
        .leftJoin('net_worth_values as nwv', 'nwv.net_worth_id', 'nw.id')
        .leftJoin('net_worth_fx_values as nwfx', 'nwfx.values_id', 'nwv.id')
        .leftJoin('net_worth_currencies as nwc', qb1 => qb1
            .on('nwc.net_worth_id', 'nw.id')
            .on('nwc.currency', 'nwfx.currency')
        )
        .where('nw.date', '<', oldDateEnd)
        .where('nw.date', '>=', startDate)
        .where(qb1 => qb1
            .where('nwv.skip', '=', false)
            .orWhere('nwv.skip', null)
        )
        .groupBy('nw.date')
        .orderBy('nw.date');

    return rows.map(({ value }) => value);
}

async function fetchAll(db, uid, oldDateEnd) {
    const netWorth = await db.select('id', 'date')
        .from('net_worth as nw')
        .where('uid', '=', uid)
        .where('date', '>=', oldDateEnd)
        .orderBy('date');

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

const onRead = (config, db) => catchAsyncErrors(async (req, res) => {
    const uid = req.user.uid;

    if (!req.params.id) {
        const { numLast, startYear, startMonth } = config.data.overview;

        const oldDateEnd = DateTime.local()
            .plus({ months: -numLast })
            .startOf('month')
            .toISODate();

        const startDate = DateTime.fromObject({ year: startYear, month: startMonth })
            .startOf('month')
            .toISODate();

        const [items, old] = await Promise.all([
            fetchAll(db, uid, oldDateEnd),
            fetchOld(db, uid, startDate, oldDateEnd)
        ]);

        return res.json({ items, old });
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
