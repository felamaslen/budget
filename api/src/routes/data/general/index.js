const listCommon = require('../list.common');

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
function routeGet(config, db) {
    return listCommon.routeGet(config, db, 'general');
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
function routePost(config, db) {
    return listCommon.routePost(config, db, 'general');
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
function routePut(config, db) {
    return listCommon.routePut(config, db, 'general');
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
function routeDelete(config, db) {
    return listCommon.routeDelete(config, db, 'general');
}

module.exports = {
    routeGet,
    routePost,
    routePut,
    routeDelete
};

