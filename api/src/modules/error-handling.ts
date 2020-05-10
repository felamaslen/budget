import * as boom from '@hapi/boom';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import logger from '~api/modules/logger';
import { AuthenticatedRequest } from '~api/modules/auth';

export type CustomRequestHandler<Req = AuthenticatedRequest> = (
  req: Req,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export function catchAsyncErrors<Req extends Omit<Request, 'user'> = AuthenticatedRequest>(
  handler: CustomRequestHandler<Req>,
): RequestHandler {
  return async (req, res, next): Promise<void> => {
    try {
      await handler((req as unknown) as Req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (boom.isBoom(err)) {
    res.status(err.output.statusCode);
  } else {
    logger.warn('Unhandled API error: %s', err.stack);
    res.status(500);
  }

  res.json({
    err: err.message,
  });
}
