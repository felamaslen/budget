const { DateTime } = require('luxon');

const { catchAsyncErrors, clientError } = require('../../modules/error-handling');

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

    const date = DateTime.fromJSDate(netWorth.date).toISODate();

    const [valuesRows, creditLimit, currencies] = await Promise.all([
        db.select(
            'nwv.id',
            'nwv.subcategory',
            'nwv.value',
            db.raw('group_concat(nwfxv.value) as fxValues'),
            db.raw('group_concat(nwfxv.currency) as fxCurrencies')
        )
            .from('net_worth_values as nwv')
            .leftJoin('net_worth_fx_values as nwfxv', 'nwfxv.values_id', 'nwv.id')
            .where('nwv.net_worth_id', '=', netWorthId)
            .groupBy('nwv.id'),

        db.select(
            'nwcl.subcategory',
            'nwcl.value'
        )
            .from('net_worth_credit_limit as nwcl')
            .where('nwcl.net_worth_id', '=', netWorthId),

        db.select(
            'nwc.id',
            'nwc.currency',
            'nwc.rate'
        )
            .from('net_worth as nw')
            .innerJoin('net_worth_currencies as nwc', 'nwc.net_worth_id', 'nw.id')
            .where('nw.id', '=', netWorthId)
    ]);

    const values = valuesRows.map(({ id, subcategory, value, fxValues, fxCurrencies }) => {
        const base = { id, subcategory, value };
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
    });

    return {
        id: netWorthId,
        date,
        values,
        creditLimit,
        currencies
    };
}

const onRead = db => catchAsyncErrors(async (req, res) => {
    const uid = req.user.uid;
    const item = await fetchById(db, req.params.id, uid);

    if (!item) {
        throw clientError('Net worth row not found', 404);
    }

    res.json(item);
});

module.exports = {
    fetchById,
    onRead
};
