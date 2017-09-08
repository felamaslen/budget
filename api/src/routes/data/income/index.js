const listCommon = require('../list.common');

/**
 * @swagger
 * /data/income/{page}:
 *     get:
 *         summary: Get income data
 *         tags:
 *             - Income
 *         operationId: getDataIncome
 *         description: |
 *             Get list of income
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: path
 *           name: page
 *           description: Page of data to get (starts at 0)
 *           type: number
 *           required: false
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponse"
 */
function routeGet(req, res) {
    const columnMap = {
        item: 'i',
        cost: 'c'
    };

    return listCommon.routeGet(req, res, 'income', columnMap, 12);
}

/**
 * @swagger
 * /data/income:
 *     post:
 *         summary: Add income data
 *         tags:
 *             - Income
 *         operationId: postDataIncome
 *         description: |
 *             Post new income item
 *         produces:
 *         - application/json
 *         parameters:
 *         - in: body
 *           name: year
 *           type: number
 *           required: true
 *         - in: body
 *           name: month
 *           type: number
 *           required: true
 *         - in: body
 *           name: date
 *           type: number
 *           required: true
 *         - in: body
 *           name: item
 *           type: string
 *           required: true
 *         - in: body
 *           name: cost
 *           type: number
 *           description: Value of income
 *           required: true
 *         responses:
 *             201:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePostList"
 */
function routePost(req, res) {
    return res.end('not done yet');
}

/**
 * @swagger
 * /data/income:
 *     put:
 *         summary: Modify income data
 *         tags:
 *             - Income
 *         operationId: putDataIncome
 *         description: |
 *             Edit existing income item
 *         produces:
 *         - application/json
 *         consumes:
 *         - application/json
 *         parameters:
 *         - in: body
 *           name: id
 *           type: number
 *           requierd: true
 *         - in: body
 *           name: year
 *           type: number
 *           required: false
 *         - in: body
 *           name: month
 *           type: number
 *           required: false
 *         - in: body
 *           name: date
 *           type: number
 *           required: false
 *         - in: body
 *           name: item
 *           type: string
 *           required: false
 *         - in: body
 *           name: cost
 *           type: number
 *           description: Value of income
 *           required: false
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePutList"
 */
function routePut(req, res) {
    return res.end('not done yet');
}

/**
 * @swagger
 * /data/income:
 *     delete:
 *         summary: Delete income data
 *         tags:
 *             - Income
 *         operationId: deleteDataIncome
 *         description: |
 *             Delete an existing income item in the database
 *         produces:
 *         - application/json
 *         consumes:
 *         - application/json
 *         parameters:
 *         - in: body
 *           name: id
 *           required: true
 *           type: integer
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePutList"
 *             400:
 *                 description: invalid id
 *                 schema:
 *                     $ref: "#/definitions/ErrorResponse"
 */
function routeDelete(req, res) {
    return res.end('not done yet');
}

module.exports = {
    routeGet,
    routePost,
    routePut,
    routeDelete
};

