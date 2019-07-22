const joi = require('joi');
const { analysisSchema } = require('../../../schema');
const { DateTime } = require('luxon');
const merge = require('deepmerge');
const { periodCondition, getCategoryColumn } = require('./common');

const CATEGORIES = ['bills', 'food', 'general', 'holiday', 'social'];

function getPeriodCostForCategory(db, user, startTime, endTime, category, groupBy) {
    const categoryColumn = getCategoryColumn(category, groupBy);

    return db.select(`${categoryColumn} AS itemCol`, db.raw('SUM(cost)::integer AS cost'))
        .from(category)
        .where('date', '>=', startTime.toISODate())
        .andWhere('date', '<=', endTime.toISODate())
        .andWhere('uid', '=', user.uid)
        .groupBy('itemCol');
}

function getRowsByDate(results) {
    return results.reduce((items, rows, categoryKey) => {
        return rows.reduce((itemsByDate, { date, cost }) => {
            const value = Math.max(0, cost);

            let dateObject = date;
            if (typeof date === 'string') {
                dateObject = new Date(date);
            }

            const year = dateObject.getFullYear();
            const month = dateObject.getMonth();
            const index = dateObject.getDate();

            const havePreceding = categoryKey === 0 || (year in itemsByDate &&
                month in itemsByDate[year] &&
                index in itemsByDate[year][month]);

            const preceding = havePreceding
                ? []
                : new Array(categoryKey).fill(0);

            return merge(itemsByDate, {
                [year]: {
                    [month]: {
                        [index]: [...preceding, value]
                    }
                }
            });

        }, items);
    }, {});
}

function processTimelineData(data, params, condition) {
    const rowsByDate = getRowsByDate(data);

    const { period } = params;
    const { startTime } = condition;

    if (period === 'year') {
        const year = startTime.year;

        return new Array(12).fill(0)
            .map((item, index) => startTime.plus({ months: index }).daysInMonth)
            .reduce((items, daysInMonth, month) => {
                if (year in rowsByDate && month in rowsByDate[year]) {
                    return [...items, ...new Array(daysInMonth).fill(0)
                        .map((itemDate, dateKey) => rowsByDate[year][month][dateKey + 1] || [])];
                }

                return [...items, ...new Array(daysInMonth).fill([])];

            }, []);
    }

    if (period === 'month') {
        const daysInMonth = startTime.daysInMonth;
        const year = startTime.year;
        const month = startTime.month - 1;

        return new Array(daysInMonth).fill(0)
            .map((item, key) => {
                if (year in rowsByDate && month in rowsByDate[year]) {
                    return rowsByDate[year][month][key + 1] || [];
                }

                return [];
            });
    }

    return null;
}

async function getPeriodCost(db, user, now, params) {
    const { period, groupBy, pageIndex } = params;

    const condition = periodCondition(now, period, pageIndex);

    const { startTime, endTime, description } = condition;

    const incomeQuery = db.select(db.raw('SUM(cost) AS cost'))
        .from('income')
        .where('date', '>=', startTime.toISODate())
        .andWhere('date', '<=', endTime.toISODate())
        .andWhere('uid', '=', user.uid);

    const costQueries = Promise.all(CATEGORIES.map(category =>
        getPeriodCostForCategory(db, user, startTime, endTime, category, groupBy)
    ));

    const timelineQueries = Promise.all(CATEGORIES.map(category => db
        .select('date', db.raw('SUM(cost) AS cost'))
        .from(category)
        .where('date', '>=', startTime.toISODate())
        .andWhere('date', '<=', endTime.toISODate())
        .andWhere('uid', '=', user.uid)
        .groupBy('date')
    ));

    const results = await Promise.all([incomeQuery, costQueries, timelineQueries]);

    const [{ cost: income }] = results[0];
    const costs = results[1];
    const timelineData = results[2];

    const itemCost = costs.map((rows, key) => ([
        CATEGORIES[key],
        rows.map(({ itemCol, cost }) => [itemCol, Number(cost)])
    ]));

    const totalCost = costs.reduce((sum, result) =>
        result.reduce((resultSum, { cost }) => resultSum + Number(cost), sum), 0);

    const saved = Math.max(0, Number(income) - totalCost);

    const timeline = processTimelineData(timelineData, params, condition);

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
        const { error, value } = joi.validate(req.params, analysisSchema);

        if (error) {
            return res.status(400)
                .json({ errorMessage: error.message });
        }

        const data = await getPeriodCost(db, req.user, DateTime.local(), value);

        return res.json({ data });
    };
}

module.exports = {
    getRowsByDate,
    processTimelineData,
    getPeriodCostForCategory,
    getPeriodCost,
    routeGet
};
