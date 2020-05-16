import { Response, NextFunction, RequestHandler } from 'express';
import { DatabaseTransactionConnectionType } from 'slonik';

import { withSlonik } from '~api/modules/db';
import { catchAsyncErrors } from '~api/modules/error-handling';
import { AuthenticatedRequest } from '~api/modules/auth';

export const authDbRoute = (
  handler: (
    db: DatabaseTransactionConnectionType,
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => Promise<void>,
): RequestHandler =>
  catchAsyncErrors(withSlonik<void, [AuthenticatedRequest, Response, NextFunction]>(handler));
