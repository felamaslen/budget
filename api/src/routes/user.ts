import boom from '@hapi/boom';
import { Router, Request } from 'express';

import { attemptLogin } from '~api/controllers';
import { catchAsyncErrors } from '~api/modules/error-handling';
import { getIp } from '~api/modules/headers';
import { loginSchema } from '~api/schema';

export function handler(databaseName?: string): Router {
  const routeLogin = catchAsyncErrors<Request>(async (req, res) => {
    const validationResult = loginSchema.validate(req.body);

    if (validationResult.error) {
      throw boom.badRequest(validationResult.error.message);
    }

    const body: { pin: number } = validationResult.value;

    const ip = getIp(req);
    const response = await attemptLogin(ip, body.pin, new Date(), databaseName);
    res.json(response);
  });

  const router = Router();
  router.post('/login', routeLogin);
  return router;
}
