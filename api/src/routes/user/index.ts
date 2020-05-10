import * as boom from '@hapi/boom';
import { Router, Request, Response } from 'express';
import joi from 'joi';

import { checkLoggedIn, genToken, LoginResponse } from '~api/modules/auth';
import { catchAsyncErrors } from '~api/modules/error-handling';
import { getIp } from '~api/modules/headers';

import config from '~api/config';
import db from '~api/modules/db';

async function attemptLogin(req: Request): Promise<LoginResponse> {
  const { error, value } = joi.validate(
    req.body,
    joi.object().keys({
      pin: joi
        .number()
        .integer()
        .min(1000)
        .max(9999)
        .required(),
    }),
  );

  if (error) {
    throw boom.badRequest(error.message);
  }

  const { pin } = value;

  const { name, uid } = await checkLoggedIn(pin);

  return { name, ...genToken({ uid }) };
}

type IPLog = {
  time: Date | number;
  count: number;
};

const nullIpLog = { time: 0, count: 0 };

async function getIpLog(ip: string): Promise<IPLog> {
  const result = await db
    .select<IPLog>('time', 'count')
    .from('ip_login_req')
    .where('ip', '=', ip)
    .first();

  return result || nullIpLog;
}

async function removeIpLog(ip: string): Promise<void> {
  await db('ip_login_req')
    .where('ip', '=', ip)
    .del();
}

async function updateIpLog(ip: string, time: Date, shouldBan: boolean): Promise<void> {
  const existingLog = await db('ip_login_req')
    .select<{ time: Date }>('time')
    .where({ ip })
    .first();

  if (!existingLog) {
    await db('ip_login_req').insert({ ip, time, count: 1 });

    return;
  }

  if (shouldBan) {
    if (time.getTime() - existingLog.time.getTime() > config.user.banLimit) {
      await db('ip_login_req')
        .where({ ip })
        .del();
    } else {
      await db('ip_login_req')
        .where({ ip })
        .update({
          time,
        })
        .increment('count', 1);
    }
  } else {
    await db('ip_login_req')
      .where({ ip })
      .increment('count', 1);
  }
}

async function loginBanCheck(loggedIn: boolean, ip: string): Promise<void> {
  const { time, count } = await getIpLog(ip);

  const now = new Date();
  const lastLogTime = new Date(time).getTime();

  const banExpired = now.getTime() - lastLogTime > config.user.banTime;

  const shouldBan = count >= config.user.banTries - 1;
  const banned = !banExpired && count >= config.user.banTries;

  if (loggedIn && count > 0 && (!banned || banExpired)) {
    await removeIpLog(ip);
  }
  if (!loggedIn) {
    await updateIpLog(ip, now, shouldBan);
  }
  if (banned) {
    throw boom.unauthorized(config.msg.errorIpBanned);
  }
}

const login = catchAsyncErrors(async (req: Request, res: Response) => {
  const ip = getIp(req);

  let loginErr = null;
  let response = null;

  try {
    response = await attemptLogin(req);
  } catch (err) {
    if (boom.isBoom(err) && err.output.statusCode === 401) {
      loginErr = err;
    } else {
      throw err;
    }
  }

  const loggedIn = !loginErr;
  await loginBanCheck(loggedIn, ip);

  if (loginErr) {
    throw loginErr;
  }

  res.json(response);
});

export function handler(): Router {
  const router = Router();

  router.post('/login', login);

  return router;
}
