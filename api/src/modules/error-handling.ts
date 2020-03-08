import { Handler, Request, Response, NextFunction } from 'express';
import logger from '~api/modules/logger';

type ResponseError = Error & {
  status: number;
};

export function clientError(message: string, status = 400): ResponseError {
  const err = new Error(message) as ResponseError;

  err.status = status;

  return err;
}

export function catchAsyncErrors(handler: Handler): Handler {
  return async (req, res, next): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

const isResponseError = (err: Error): err is ResponseError => !!(err as ResponseError).status;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (isResponseError(err)) {
    res.status(err.status);
  } else {
    logger.warn('Unhandled API error: %s', err.stack);

    res.status(500);
  }

  res.json({
    err: err.message,
  });
}
