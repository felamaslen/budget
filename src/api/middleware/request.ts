import boom from '@hapi/boom';
import { Schema } from '@hapi/joi';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { DatabaseTransactionConnectionType } from 'slonik';

import { withSlonik } from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';

export const authDbRoute = (
  handler: (
    db: DatabaseTransactionConnectionType,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>,
): RequestHandler => catchAsyncErrors(withSlonik<void, [Request, Response, NextFunction]>(handler));

export const validatedAuthDbRoute = <
  D extends Record<string, unknown> | void = void,
  P extends Record<string, unknown> | void = void,
  Q extends Record<string, unknown> | void = void,
>(
  schema: Partial<{
    data: Schema;
    params: Schema;
    query: Schema;
  }>,
  handler: (
    db: DatabaseTransactionConnectionType,
    req: Request,
    res: Response,
    data: D,
    params: P,
    query: Q,
  ) => Promise<void>,
): RequestHandler =>
  authDbRoute(async (db, req, res) => {
    const dataValidation = schema.data?.validate(req.body);
    const paramsValidation = schema.params?.validate(req.params);
    const queryValidation = schema.query?.validate(req.query);

    const validationError =
      dataValidation?.error ?? paramsValidation?.error ?? queryValidation?.error;
    if (validationError) {
      throw boom.badRequest(validationError.message);
    }

    const data: D = dataValidation?.value;
    const params: P = paramsValidation?.value;
    const query: Q = queryValidation?.value;

    await handler(db, req, res, data, params, query);
  });
