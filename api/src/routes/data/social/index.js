const listCommon = require('../list.common');

/**
 * @swagger
 * /data/social/{page}:
 *     get:
 *         summary: Get social data
 *         tags:
 *             - Social
 *         operationId: getDataSocial
 *         description: |
 *             Get list of social
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
    return listCommon.routeGet(config, db, 'social');
}

/**
 * @swagger
 * /data/social:
 *     post:
 *         summary: Add social data
 *         tags:
 *             - Social
 *         operationId: postDataSocial
 *         description: |
 *             Post new social item
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
 *           description: Value of social
 *           required: true
 *         responses:
 *             201:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePostList"
 */
function routePost(config, db) {
    return listCommon.routePost(config, db, 'social');
}

/**
 * @swagger
 * /data/social:
 *     put:
 *         summary: Modify social data
 *         tags:
 *             - Social
 *         operationId: putDataSocial
 *         description: |
 *             Edit existing social item
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
 *           description: Value of social
 *           required: false
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePutList"
 */
function routePut(config, db) {
    return listCommon.routePut(config, db, 'social');
}

/**
 * @swagger
 * /data/social:
 *     delete:
 *         summary: Delete social data
 *         tags:
 *             - Social
 *         operationId: deleteDataSocial
 *         description: |
 *             Delete an existing social item in the database
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
    return listCommon.routeDelete(config, db, 'social');
}

module.exports = {
    routeGet,
    routePost,
    routePut,
    routeDelete
};
