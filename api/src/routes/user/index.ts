import boom from '@hapi/boom';
import { Router, Request } from 'express';
import joi from 'joi';

import { attemptLogin } from '~api/controllers';
import { catchAsyncErrors } from '~api/modules/error-handling';
import { getIp } from '~api/modules/headers';

const routeLogin = catchAsyncErrors<Request>(async (req, res) => {
  const { error, value: body } = joi.validate<{ pin: number }>(
    req.body,
    joi.object({
      pin: joi.number().integer().min(1000).max(9999).required(),
    }),
  );

  if (error) {
    throw boom.badRequest(error.message);
  }

  const ip = getIp(req);
  const response = await attemptLogin(ip, body.pin, new Date());
  res.json(response);
});

export function handler(): Router {
  const router = Router();
  router.post('/login', routeLogin);
  return router;
}
