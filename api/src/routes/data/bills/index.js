const listCommon = require('../list.common');

/**
 * @swagger
 * /data/bills/{page}:
 *     get:
 *         summary: Get bills data
 *         tags:
 *             - Bills
 *         operationId: getDataBills
 *         description: |
 *             Get list of bills
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

    return listCommon.routeGet(req, res, 'bills', columnMap, 6);
}

/**
 * @swagger
 * /data/bills:
 *     post:
 *         summary: Add bills data
 *         tags:
 *             - Bills
 *         operationId: postDataBills
 *         description: |
 *             Post new bills item
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
 *           description: Value of bills
 *           required: true
 *         responses:
 *             201:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePostList"
 */
function routePost(req, res) {
    return listCommon.routePost(req, res, 'bills');
}

/**
 * @swagger
 * /data/bills:
 *     put:
 *         summary: Modify bills data
 *         tags:
 *             - Bills
 *         operationId: putDataBills
 *         description: |
 *             Edit existing bills item
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
 *           description: Value of bills
 *           required: false
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePutList"
 */
function routePut(req, res) {
    return listCommon.routePut(req, res, 'bills');
}

/**
 * @swagger
 * /data/bills:
 *     delete:
 *         summary: Delete bills data
 *         tags:
 *             - Bills
 *         operationId: deleteDataBills
 *         description: |
 *             Delete an existing bills item in the database
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
    return listCommon.routeDelete(req, res, 'bills');
}

module.exports = {
    routeGet,
    routePost,
    routePut,
    routeDelete
};

