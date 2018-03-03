const merge = require('deepmerge');
const common = require('./common');

const { monthLength } = require('../../../common');

function getPeriodCostForCategory(db, user, condition, category, groupBy) {
    const categoryColumn = common.getCategoryColumn(category, groupBy);

    return db.select(`${categoryColumn} AS itemCol`, 'SUM(cost) AS cost')
        .from(category)
        .whereRaw(condition)
        .andWhere('uid', '=', user.uid)
        .groupBy('itemCol');
}

function getRowsByDate(results) {
    return results.reduce((obj, rows, groupKey) => {
        if (!(rows && Array.isArray(rows))) {
            return obj;
        }

        return rows.reduce((subObj, { year, month, date, cost }) => {
            const value = Math.max(0, cost);

            let preceding = [];
            if (!(year in subObj && month in subObj[year] && date in subObj[year][month]) && groupKey > 0) {
                preceding = new Array(groupKey).fill(0);
            }

            return merge(subObj, {
                [year]: {
                    [month]: {
                        [date]: [...preceding, value]
                    }
                }
            });

        }, obj);

    }, {});
}

function processTimelineData(results, period, params) {
    const rowsByDate = getRowsByDate(results);

    if (period === 'year') {
        const { year } = params;
        const monthLengths = new Array(12).fill(0)
            .map((month, key) => monthLength(year, key + 1));

        return monthLengths.reduce((items, length, key) => {
            const month = key + 1;

            if (year in rowsByDate && month in rowsByDate[year]) {
                return items.concat(new Array(length).fill(0)
                    .map((itemDate, dateKey) => rowsByDate[year][month][dateKey + 1] || []));
            }

            return items.concat(new Array(length).fill([]));

        }, []);
    }

    if (period === 'month') {
        const { year, month } = params;
        const length = monthLength(year, month);

        return new Array(length).fill(0)
            .map((item, key) => {
                if (year in rowsByDate && month in rowsByDate[year]) {
                    return rowsByDate[year][month][key + 1] || [];
                }

                return [];
            });
    }

    return null;
}

async function getTimeline(db, user, now, period, pageIndex, periodCondition, categories) {
    const { condition, ...params } = periodCondition;

    const results = await Promise.all(categories.map(category => db
        .select('date', 'SUM(cost) AS cost')
        .from(category)
        .whereRaw(condition)
        .andWhere('uid', '=', user.uid)
        .groupBy('date')
    ));

    return processTimelineData(results, period, params);
}

async function getPeriodCost(db, user, now, period, groupBy, pageIndex) {
    const { condition, description, ...params } = common.periodCondition(now, period, pageIndex);

    const categories = ['bills', 'food', 'general', 'holiday', 'social'];

    const incomeQuery = db.select('SUM(cost) AS cost')
        .from('income')
        .whereRaw(condition)
        .andWhere('uid', '=', user.uid);

    const results = await Promise.all([
        incomeQuery,
        ...categories.map(category => getPeriodCostForCategory(
            db, user, condition, category, groupBy
        ))
    ]);

    const itemCost = results
        .slice(1)
        .map(([result], key) => ([
            categories[key],
            result.map(({ itemCol, cost }) => [itemCol, cost])
        ]));

    let income = null;
    if (Array.isArray(results[0][0])) {
        income = results[0][0].reduce((sum, { cost }) => sum + cost, 0);
    }

    const totalCost = results.slice(1).reduce((sum, result) =>
        result.reduce((resultSum, { cost }) => resultSum + cost, sum), 0);

    const saved = Math.max(0, income - totalCost);

    const timeline = await getTimeline(
        db, user, now, period, pageIndex, { condition, ...params }, categories);

    return { timeline, cost: itemCost, saved, description };
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
function routeGet(config, db) {
    return async (req, res) => {
        const params = [
            req.params.period,
            req.params.groupBy,
            Number(req.params.pageIndex) || 0
        ];

        const validationStatus = common.validateParams(...params);

        if (!validationStatus.isValid) {
            return common.handlerInvalidParams(req, res);
        }

        const result = await getPeriodCost(db, req.user, new Date(), ...params);

        return common.handlerValidResult(req, res, result);
    };
}

module.exports = {
    getRowsByDate,
    processTimelineData,
    getPeriodCostForCategory,
    getPeriodCost,
    routeGet
};

