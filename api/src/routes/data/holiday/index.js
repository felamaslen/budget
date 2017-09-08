const listCommon = require('../list.common');

/**
 * @swagger
 * /data/holiday/{page}:
 *     get:
 *         summary: Get holiday data
 *         tags:
 *             - Holiday
 *         operationId: getDataHoliday
 *         description: |
 *             Get list of holiday
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
        holiday: 'h',
        shop: 's'
    };

    return listCommon.routeGet(req, res, 'holiday', columnMap, 12);
}

/**
 * @swagger
 * /data/holiday:
 *     post:
 *         summary: Add holiday data
 *         tags:
 *             - Holiday
 *         operationId: postDataHoliday
 *         description: |
 *             Post new holiday item
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
 *           description: Value of holiday
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
 * /data/holiday:
 *     put:
 *         summary: Modify holiday data
 *         tags:
 *             - Holiday
 *         operationId: putDataHoliday
 *         description: |
 *             Edit existing holiday item
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
 *           description: Value of holiday
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
 * /data/holiday:
 *     delete:
 *         summary: Delete holiday data
 *         tags:
 *             - Holiday
 *         operationId: deleteDataHoliday
 *         description: |
 *             Delete an existing holiday item in the database
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

