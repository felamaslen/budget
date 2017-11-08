const common = require('./common');

const { monthLength } = require('../../../common')

function getPeriodCostForCategory(db, user, condition, category, groupBy) {
    const categoryColumn = common.getCategoryColumn(category, groupBy);

    return db.query(`
    SELECT ${categoryColumn} AS itemCol, SUM(cost) AS cost
    FROM ${category}
    WHERE ${condition} AND uid = ?
    GROUP BY itemCol
    `, user.uid);
}

async function getTimeline(db, user, now, period, pageIndex, { condition, ...params }, categories) {
    const subQueries = categories
        .map(category => `SELECT year, month, date, SUM(cost) AS cost
        FROM ${category}
        WHERE ${condition} AND uid = ${user.uid}
        GROUP BY year, month, date`)

    const results = await Promise.all(subQueries.map(query => db.query(query)))

    const rowsByDate = results.reduce((obj, rows, groupKey) => {
        if (!(rows && Array.isArray(rows))) {
            return obj
        }

        return rows.reduce((subObj, row) => {
            if (!(row.year in subObj)) {
                subObj[row.year] = {}
            }
            if (!(row.month in subObj[row.year])) {
                subObj[row.year][row.month] = {}
            }
            if (!(row.date in subObj[row.year][row.month])) {
                subObj[row.year][row.month][row.date] = groupKey > 0
                    ? new Array(groupKey).fill(0)
                    : []
            }

            subObj[row.year][row.month][row.date].push(Math.max(0, row.cost))

            return subObj

        }, obj)

    }, {})

    if (period === 'year') {
        const { year } = params
        const monthLengths = new Array(12).fill(0)
            .map((month, key) => monthLength(year, key + 1))

        return monthLengths.reduce((items, length, key) => {
            const month = key + 1

            if (year in rowsByDate && month in rowsByDate[year]) {
                return items.concat(new Array(length).fill(0)
                    .map((itemDate, dateKey) => rowsByDate[year][month][dateKey + 1] || []))
            }

            return items.concat(new Array(length).fill([]))

        }, [])
    }

    if (period === 'month') {
        const { year, month } = params
        const length = monthLength(year, month)

        return new Array(length).fill(0)
            .map((item, key) => {
                if (year in rowsByDate && month in rowsByDate[year]) {
                    return rowsByDate[year][month][key + 1] || [];
                }

                return [];
            });
    }

    return null
}

async function getPeriodCost(db, user, now, period, groupBy, pageIndex) {
    const queryCondition = common.periodCondition(now, period, pageIndex);

    const categories = ['bills', 'food', 'general', 'holiday', 'social'];

    const promises = await Promise.all(categories.map(
        category => getPeriodCostForCategory(
            db, user, queryCondition.condition, category, groupBy
        )
    ));

    const cost = promises
        .map((result, key) => {
            return [
                categories[key],
                result.map(item => [item.itemCol, item.cost])
            ];
        });

    const timeline = await getTimeline(db, user, now, period, pageIndex, queryCondition, categories)

    return { timeline, cost, description: queryCondition.description };
}

/**
 * @swagger
 * /data/analysis/{period}/{groupBy}/{pageIndex}:
 *     get:
 *         summary: Get analysis data
 *         tags:
 *             - Analysis
 *         operationId: getDataAnalysis
 *         description: |
 *             Get weekly / monthly / yearly analysis data, broken down into paged categories
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: path
 *           name: period
 *           description: one of week, month, year
 *           required: true
 *           type: string
 *         - in: path
 *           name: groupBy
 *           description: one of category, shop
 *           required: true
 *           type: string
 *         - in: path
 *           name: pageIndex
 *           description: page to retrieve, starting with 0
 *           type: integer
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     type: object
 *                     properties:
 *                         data:
 *                             type: object
 *                             properties:
 *                                 cost:
 *                                     type: array
 *                                     items:
 *                                         type: array
 *                                         example: ["bills", [6500, 12300]]
 */
async function routeGet(req, res) {
    const params = [
        req.params.period,
        req.params.groupBy,
        +(req.params.pageIndex || 0)
    ];

    const validationStatus = common.validateParams(...params);

    if (!validationStatus.isValid) {
        return common.handlerInvalidParams(req, res);
    }

    const result = await getPeriodCost(req.db, req.user, new Date(), ...params);

    return common.handlerValidResult(req, res, result);
}

module.exports = {
    getPeriodCostForCategory,
    getPeriodCost,
    routeGet
};

