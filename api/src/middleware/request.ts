import { Response, NextFunction, RequestHandler } from 'express';
import { DatabaseTransactionConnectionType } from 'slonik';

import { AuthenticatedRequest } from '~api/modules/auth';
import { withSlonik } from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';

export const authDbRoute = (
  handler: (
    db: DatabaseTransactionConnectionType,
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => Promise<void>,
): RequestHandler =>
  catchAsyncErrors(withSlonik<void, [AuthenticatedRequest, Response, NextFunction]>(handler));
