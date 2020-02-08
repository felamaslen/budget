const levenshtein = require('fast-levenshtein');
const compose = require('just-compose');
const { replaceAtIndex, removeAtIndex } = require('replace-array');

const { clientError } = require('../modules/error-handling');

const tables = ['food', 'general', 'holiday', 'social'];

const withYear = year => (year ? qb => qb.where('L.year', year) : qb => qb);

function withSort(algorithm) {
    if (algorithm === 'similarity') {
        return items =>
            items.reduce(
                ({ last, remaining }) => {
                    if (!remaining.length) {
                        return last;
                    }

                    const { thing } = last[last.length - 1];
                    const closestRemaining = remaining.reduce(
                        ({ distance, index }, { thing: compare }, nextIndex) => {
                            const nextDistance = levenshtein.get(thing, compare);
                            if (nextDistance > distance) {
                                return { distance, index };
                            }

                            return { distance: nextDistance, index: nextIndex };
                        },
                        {
                            distance: Infinity,
                            index: -1,
                        },
                    );

                    const nextRemaining = removeAtIndex(remaining, closestRemaining.index);
                    const nextLast = [...last, remaining[closestRemaining.index]];

                    return { last: nextLast, remaining: nextRemaining };
                },
                {
                    last: items.slice(0, 1),
                    remaining: items.slice(1),
                },
            );
    }

    return items => items.sort(({ total: totalA }, { total: totalB }) => totalB - totalA);
}

const getPivotTable = db => async (req, res) => {
    if (!tables.includes(req.query.table)) {
        throw clientError(`Must provide table; valid values are (${tables.join(', ')})`);
    }

    const { table } = req.query;

    const fixedYear =
        req.query.year && /^20([0-9]{2})$/.test(req.query.year) ? Number(req.query.year) : null;

    const deep = Boolean(req.query.deep);

    const items = await withYear(fixedYear)(
        db
            .select('L.thing', 'L.year', db.raw('sum(cost) as cost'))
            .from(qb =>
                qb
                    .select(
                        `${deep ? 'item' : 'category'} as thing`,
                        db.raw("date_part('year', date) as year"),
                        'cost',
                    )
                    .from(table)
                    .as('L'),
            )
            .groupBy('L.thing', 'L.year')
            .orderBy('L.thing', 'L.year'),
    );

    const maxYear = fixedYear || items.reduce((last, { year }) => Math.max(last, year), 0);
    const minYear = fixedYear || items.reduce((last, { year }) => Math.min(last, year), Infinity);

    const yearRange = new Array(maxYear - minYear + 1)
        .fill(0)
        .map((item, index) => minYear + index);

    const sheet = compose(withSort(req.query.sort))(
        items
            .map(({ cost, ...rest }) => ({ ...rest, cost: Number(cost) / 100 }))
            .reduce((last, { thing, year, cost }) => {
                if (last.length && thing === last[last.length - 1].thing) {
                    return [
                        ...last.slice(0, last.length - 1),
                        {
                            ...last[last.length - 1],
                            years: replaceAtIndex(
                                last[last.length - 1].years,
                                year - minYear,
                                cost,
                            ),
                        },
                    ];
                }

                return [
                    ...last,
                    {
                        thing,
                        years: replaceAtIndex(
                            new Array(maxYear - minYear + 1).fill(0),
                            year - minYear,
                            cost,
                        ),
                    },
                ];
            }, [])
            .map(({ thing, years }) => ({
                thing,
                years,
                total: years.reduce((last, cost) => last + cost, 0),
            })),
    );

    const header = [deep ? 'Item' : 'Category', ...yearRange, 'Total'];

    if (req.query.csv) {
        const csv = [
            header,
            ...sheet.map(({ thing, years, total }) => [`"${thing}"`, ...years, total]),
        ]
            .map(row => row.join(','))
            .join('\n');

        res.setHeader('Content-Type', 'application/csv');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=budget-pivot-${table}${deep ? '-deep' : ''}.csv`,
        );
        res.setHeader('Pragma', 'no-cache');

        res.send(csv);
        return;
    }

    res.render('pivot-table', {
        header,
        sheet,
    });
};

module.exports = getPivotTable;
