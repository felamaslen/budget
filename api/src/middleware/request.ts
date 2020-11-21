import boom from '@hapi/boom';
import { Schema } from '@hapi/joi';
import { Response, NextFunction, RequestHandler } from 'express';
import { DatabaseTransactionConnectionType } from 'slonik';

import { AuthenticatedRequest } from '~api/gql';
import { withSlonik } from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';

export const authDbRoute = (
  handler: (
    db: DatabaseTransactionConnectionType,
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => Promise<void>,
) => (databaseName?: string): RequestHandler =>
  catchAsyncErrors(
    withSlonik<void, [AuthenticatedRequest, Response, NextFunction]>(handler)(databaseName),
  );

export const validatedAuthDbRoute = <
  D extends object | void = void,
  P extends object | void = void,
  Q extends object | void = void
>(
  schema: Partial<{
    data: Schema;
    params: Schema;
    query: Schema;
  }>,
  handler: (
    db: DatabaseTransactionConnectionType,
    req: AuthenticatedRequest,
    res: Response,
    data: D,
    params: P,
    query: Q,
  ) => Promise<void>,
): ((databaseName?: string) => RequestHandler) =>
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
