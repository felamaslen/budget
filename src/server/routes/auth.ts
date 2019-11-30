import { Context } from 'koa';
import createRouter, { Router, Joi } from 'koa-joi-router';
import { loginWithPin } from '~/server/modules/auth';

export default function authRoute(): Router {
  const router = createRouter();

  router.route({
    method: 'post',
    path: '/login',
    validate: {
      body: {
        pin: Joi.string().min(4),
      },
      type: 'json',
      output: {
        '200': {
          body: {
            uid: Joi.string(),
            name: Joi.string(),
          },
        },
        '401': {
          body: {
            error: Joi.string(),
          },
        },
        '403': {
          body: {
            error: Joi.string(),
          },
        },
      },
    },
    handler: async (ctx: Context) => {
      try {
        const user = await loginWithPin(ctx.request.body.pin);

        if (!user) {
          throw new Error('Invalid PIN');
        }

        ctx.status = 200;
        ctx.body = {
          uid: user.uid,
          name: user.name,
        };
      } catch (err) {
        ctx.status = 401;
        ctx.body = {
          error: err.message,
        };
      }
    },
  });

  return router;
}
