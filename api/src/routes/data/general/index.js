const listCommon = require('../list.common');

const extraStringColumns = [
    { name: 'category', notEmpty: true },
    { name: 'shop' }
];

function validateInsertData(data) {
    return listCommon.validateInsertData(data, true, extraStringColumns);
}

function validateUpdateData(data) {
    return listCommon.validateUpdateData(data, extraStringColumns);
}

/**
 * @swagger
 * /data/general/{page}:
 *     get:
 *         summary: Get general data
 *         tags:
 *             - General
 *         operationId: getDataGeneral
 *         description: |
 *             Get list of general
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
        cost: 'c',
        category: 'k',
        shop: 's'
    };

    return listCommon.routeGet(req, res, 'general', columnMap, 4);
}

/**
 * @swagger
 * /data/general:
 *     post:
 *         summary: Add general data
 *         tags:
 *             - General
 *         operationId: postDataGeneral
 *         description: |
 *             Post new general item
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
 *           description: Value of general
 *           required: true
 *         responses:
 *             201:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePostList"
 */
function routePost(req, res) {
    return listCommon.routePost(req, res, 'general', validateInsertData);
}

/**
 * @swagger
 * /data/general:
 *     put:
 *         summary: Modify general data
 *         tags:
 *             - General
 *         operationId: putDataGeneral
 *         description: |
 *             Edit existing general item
 *         produces:
 *         - application/json
 *         consumes:
 *         - application/json
 *         parameters:
 *         - in: body
 *           name: id
 *           type: number
 *           required: true
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
 *           description: Value of general
 *           required: false
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePutList"
 */
function routePut(req, res) {
    return listCommon.routePut(req, res, 'general', validateUpdateData);
}

/**
 * @swagger
 * /data/general:
 *     delete:
 *         summary: Delete general data
 *         tags:
 *             - General
 *         operationId: deleteDataGeneral
 *         description: |
 *             Delete an existing general item in the database
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
    return listCommon.routeDelete(req, res, 'general');
}

module.exports = {
    routeGet,
    routePost,
    routePut,
    routeDelete
};

