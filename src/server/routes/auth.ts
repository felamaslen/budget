import { Context } from 'koa';
import createRouter, { Router, Joi } from 'koa-joi-router';
import { LoginResponse, loginWithPin } from '~/server/modules/auth';

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
        200: {
          body: {
            uid: Joi.string(),
            name: Joi.string(),
            token: Joi.string(),
          },
        },
        401: {
          body: {
            error: Joi.string(),
          },
        },
        403: {
          body: {
            error: Joi.string(),
          },
        },
      },
    },
    handler: async (ctx: Context) => {
      try {
        const user: LoginResponse | null = await loginWithPin(ctx.request.body.pin);
        if (!user) {
          throw new Error('Invalid PIN');
        }

        if (ctx.session) {
          ctx.session.userId = user.uid;
          ctx.session.token = user.token;
          ctx.session.save();
        }

        ctx.status = 200;
        ctx.body = user;
      } catch (err) {
        ctx.status = 401;
        ctx.body = {
          error: err.message,
        };
      }
    },
  });

  router.route({
    method: 'post',
    path: '/logout',
    handler: async (ctx: Context) => {
      ctx.session = null;
      ctx.status = 204;
    },
  });

  return router;
}