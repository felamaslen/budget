/**
 * Search route
 */

const { Router } = require('express');
const joi = require('joi');
const { searchSchema } = require('../../schema');

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

        const { table, column, searchTerm, numResults } = value;

        try {
            const result = await db
                .select(db.raw(`${column}, SUM(IF(${column} LIKE '${searchTerm}%', 1, 0)) AS matches`))
                .from(table)
                .where(column, 'like', `%${searchTerm}%`)
                .andWhere('uid', '=', req.user.uid)
                .groupBy(column)
                .orderBy('matches', 'desc')
                .orderBy(column)
                .limit(numResults);

            const data = {
                list: result.map(item => String(item[column]))
            };

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

