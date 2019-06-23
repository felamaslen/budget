/**
 * Search route
 */

const { Router } = require('express');
const joi = require('joi');
const { searchSchema } = require('../../schema');

function matchQuery(table, column, searchTerm) {
    if (searchTerm.length < 3) {
        return query => query.whereRaw(`"${table}"."${column}" ILIKE ?`, `${searchTerm}%`);
    }

    const tsQuery = searchTerm
        .trim()
        .replace(/[^\w\s+]/g, '')
        .split(/\s+/)
        .map(word => `${word}:*`)
        .join(' | ');

    return query => query.whereRaw(`to_tsvector("${table}"."${column}") @@ to_tsquery(?) = true`, tsQuery);
}

function getQuery(db, request, uid) {
    const { table, column, searchTerm, numResults } = request;

    const query = qb => matchQuery(table, column, searchTerm)(qb.select(
        db.raw(`DISTINCT(${column}) AS ${column}`),
        db.raw(`COUNT(${column}) AS count`)
    )
        .from(table)
        .andWhere(`${table}.uid`, '=', uid)
        .groupBy(column)
        .orderBy('count', 'desc')
        .limit(numResults)
        .as('items')
    );

    if (['food', 'general'].includes(table) && column === 'item') {
        return db.select(
            'items.item',
            db.raw('COALESCE(next_values.category, \'\') as next_category')
        )
            .from(query)
            .leftJoin(`${table} as next_values`, 'next_values.id', qb => qb.select('id')
                .from(table)
                .where('item', '=', db.raw('items.item'))
                .andWhere('uid', '=', uid)
                .limit(1)
            );
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
    return async (req, res) => {
        const { error, value } = joi.validate(req.params, searchSchema);

        if (error) {
            return res.status(400)
                .json({ errorMessage: error.message });
        }

        try {
            const result = await getQuery(db, value, req.user.uid);

            const data = {
                list: result.map(({ [value.column]: item }) => String(item))
            };

            if (result.length && result[0].next_category) {
                const nextCategory = result.map(({ next_category: item }) => item);

                return res.json({ data: { ...data, nextCategory } });
            }

            return res.json({ data });
        }
        catch (err) {
            return res.status(500)
                .json({ errorMessage: err.message });
        }
    };
}

function handler(config, db) {
    const router = new Router();

    router.get('/:table/:column/:searchTerm/:numResults?', routeGet(config, db));

    return router;
}

module.exports = {
    routeGet,
    handler
};

