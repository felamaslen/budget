const listCommon = require('../list.common');

/**
 * @swagger
 * /data/food/{page}:
 *     get:
 *         summary: Get food data
 *         tags:
 *             - Food
 *         operationId: getDataFood
 *         description: |
 *             Get list of food
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
    return listCommon.routeGet(config, db, 'food');
}

/**
 * @swagger
 * /data/food:
 *     post:
 *         summary: Add food data
 *         tags:
 *             - Food
 *         operationId: postDataFood
 *         description: |
 *             Post new food item
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
 *           description: Value of food
 *           required: true
 *         responses:
 *             201:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePostList"
 */
function routePost(config, db) {
    return listCommon.routePost(config, db, 'food');
}

/**
 * @swagger
 * /data/food:
 *     put:
 *         summary: Modify food data
 *         tags:
 *             - Food
 *         operationId: putDataFood
 *         description: |
 *             Edit existing food item
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
 *           description: Value of food
 *           required: false
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePutList"
 */
function routePut(config, db) {
    return listCommon.routePut(config, db, 'food');
}

/**
 * @swagger
 * /data/food:
 *     delete:
 *         summary: Delete food data
 *         tags:
 *             - Food
 *         operationId: deleteDataFood
 *         description: |
 *             Delete an existing food item in the database
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
    return listCommon.routeDelete(config, db, 'food');
}

module.exports = {
    routeGet,
    routePost,
    routePut,
    routeDelete,
};
