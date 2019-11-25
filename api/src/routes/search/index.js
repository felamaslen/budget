/**
 * Search route
 */

const { Router } = require('express');
const joi = require('joi');
const { catchAsyncErrors } = require('../../modules/error-handling');
const { searchSchema } = require('../../schema');

function matchQuery(db, table, column, searchTerm, conditions) {
    if (searchTerm.length < 3) {
        return (qb1) => conditions(qb1
            .select(
                db.raw(`distinct("${column}") as "${column}"`),
                db.raw(`count("${column}") AS count`),
            )
            .from(table)
            .whereRaw(`"${table}"."${column}" ILIKE ?`, `${searchTerm}%`)
            .groupBy(column)
            .orderBy('count', 'desc'))
            .as('items_ranked');
    }

    const tsQuery = searchTerm
        .trim()
        .replace(/[^\w\s+]/g, '')
        .split(/\s+/)
        .map((word) => `${word}:*`)
        .join(' | ');

    return (qb1) => qb1
        .distinct(
            column,
            db.raw(`ts_rank_cd("${table}"."${column}_search", to_tsquery(?)) as rank`, tsQuery),
            db.raw(`char_length("${table}"."${column}") as length`),
        )
        .from(table)
        .whereRaw(`"${table}"."${column}_search" @@ to_tsquery(?)`, tsQuery)
        .orderBy([
            { column: 'rank', order: 'desc' },
            { column: 'length' },
        ])
        .as('items_ranked');
}

function getQuery(db, request, uid) {
    const {
        table, column, searchTerm, numResults,
    } = request;

    const conditions = (qb) => qb.where(`${table}.uid`, '=', uid);

    const query = (qb0) => matchQuery(db, table, column, searchTerm, conditions)(qb0)
        .limit(numResults)
        .as('items');

    if (['food', 'general'].includes(table) && column === 'item') {
        return db.select(
            'items.item',
            db.raw('COALESCE(next_values.category, \'\') as next_category'),
        )
            .from(query)
            .leftJoin(`${table} as next_values`, 'next_values.id', (qb) => qb.select('id')
                .from(table)
                .where('item', '=', db.raw('items.item'))
                .andWhere('uid', '=', uid)
                .limit(1));
    }

    return query(db);
}

/**
 * @swagger
 * /data/search/{dataType}/{column}/{searchTerm}/{numResults}:
 *     get:
 *         summary: Search suggestions
 *         tags:
 *         - Search
 *         operationId: search
 *         description: |
 *             Get search suggestions for data input
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: path
 *           name: dataType
 *           description: The type of data to get
 *           required: true
 *           type: string
 *         - in: path
 *           name: column
 *           description: The column of data to search
 *           required: true
 *           type: string
 *         - in: path
 *           name: searchTerm
 *           description: The term to search for
 *           required: true
 *           type: string
 *         - in: path
 *           name: numResults
 *           description: The number of results to return
 *           required: false
 *           type: number
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     type: object
 *                     properties:
 *                         error:
 *                             type: boolean
 *                             example: false
 *                         data:
 *                             type: object
 *                             properties:
 *                                 list:
 *                                     type: array
 *                                     items:
 *                                         type: string
 */
function routeGet(config, db) {
    return catchAsyncErrors(async (req, res) => {
        const { error, value } = joi.validate(req.params, searchSchema);

        if (error) {
            return res.status(400)
                .json({ errorMessage: error.message });
        }

        const result = await getQuery(db, value, req.user.uid);

        const data = {
            list: result.map(({ [value.column]: item }) => String(item)),
        };

        if (result.length && result[0].next_category) {
            const nextCategory = result.map(({ next_category: item }) => item);

            return res.json({ data: { ...data, nextCategory } });
        }

        return res.json({ data });
    });
}

function handler(config, db) {
    const router = new Router();

    router.get('/:table/:column/:searchTerm/:numResults?', routeGet(config, db));

    return router;
}

module.exports = {
    routeGet,
    handler,
};
