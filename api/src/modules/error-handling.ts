import boom from '@hapi/boom';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '~api/modules/auth';
import logger from '~api/modules/logger';

export type CustomRequestHandler<Req = AuthenticatedRequest> = (
  req: Req,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export function catchAsyncErrors<Req extends Exclude<Request, 'user'> = AuthenticatedRequest>(
  handler: CustomRequestHandler<Req>,
): RequestHandler {
  return async (req, res, next): Promise<void> => {
    try {
      await handler(req as Req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _: Request, res: Response, __: NextFunction): void {
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
