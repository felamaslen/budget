const { Router } = require('express');
const data = require('./data');
const search = require('./search');
const user = require('./user');

/**
 * @swagger
 *    definitions:
 *        ErrorResponse:
 *            type: object
 *            properties:
 *                error:
 *                    type: boolean
 *                    example: true
 *                errorMessage:
 *                    type: string
 *                    example: An error occurred
 *
 *        DataResponse:
 *            type: object
 *            properties:
 *                error:
 *                    type: boolean
 *                    example: false
 *                data:
 *                    type: object
 *                    properties:
 *                        total:
 *                            type: number
 *                            description: Total cost of all list items since the beginning of time
 *                        data:
 *                            type: array
 *                            items:
 *                                type: object
 *                                properties:
 *                                    I:
 *                                        type: number
 *                                        description: ID
 *                                    d:
 *                                        type: array
 *                                        description: Date
 *                                        example: [2017, 9, 5]
 *                                    i:
 *                                        type: string
 *                                        description: Item
 *                                    c:
 *                                        type: number
 *                                        description: Value
 *        DataResponsePostList:
 *            type: object
 *            properties:
 *                id:
 *                    type: integer
 *                    example: 18281
 *                    description: newly-inserted ID
 *                total:
 *                    type: integer
 *                    example: 481829
 *                    description: new total cost of list data
 *                error:
 *                    type: boolean
 *                    example: false
 *        DataResponsePutList:
 *            type: object
 *            properties:
 *                total:
 *                    type: integer
 *                    example: 1912391
 *                    description: new total cost of list data
 *                error:
 *                    type: boolean
 *                    example: false
 */

function handler(config, db) {
    const router = new Router();

    router.use('/user', user.handler(config, db));
    router.use('/data', data.handler(config, db));
    router.use('/data/search', search.handler(config, db));

    return router;
}

module.exports = handler;

