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
function routeGet(req, res) {
    const columnMap = {
        item: 'i',
        cost: 'c',
        category: 'k',
        shop: 's'
    };

    return listCommon.routeGet(req, res, 'food', columnMap, 2);
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
function routePost(req, res) {
    return listCommon.routePost(req, res, 'food', validateInsertData);
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
 *           description: Value of food
 *           required: false
 *         responses:
 *             200:
 *                 description: successful operation
 *                 schema:
 *                     $ref: "#/definitions/DataResponsePutList"
 */
function routePut(req, res) {
    return listCommon.routePut(req, res, 'food', validateUpdateData);
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
function routeDelete(req, res) {
    return res.end('not done yet');
}

module.exports = {
    routeGet,
    routePost,
    routePut,
    routeDelete
};

