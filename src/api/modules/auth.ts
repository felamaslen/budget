import boom from '@hapi/boom';
import joi from '@hapi/joi';
import bcrypt from 'bcrypt';
import connectRedis from 'connect-redis';
import { addDays, fromUnixTime, getUnixTime, isAfter } from 'date-fns';
import { Express, NextFunction, Request, Response } from 'express';
import session, { MemoryStore } from 'express-session';
import jwt from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';
import { sql, DatabaseTransactionConnectionType } from 'slonik';

import { redisClient } from './redis';

import config from '~api/config';
import { getPool } from '~api/modules/db';
import { AppConfig, LoginResponse, UserInfo } from '~api/types';
import { User, Resolver } from '~api/types/resolver';

export type UserRow = UserInfo & {
  pin_hash: string;
  config: Partial<Omit<AppConfig, 'futureMonths'>> | null;
};

export async function whoami({ uid }: Required<User>): Promise<UserInfo | null> {
  const user = await getPool().connect(async (db) => {
    const result = await db.query<{ name: string }>(sql`SELECT name FROM users WHERE uid = ${uid}`);
    return result.rows[0];
  });

  if (!user) {
    return null;
  }

  return { uid, name: user.name };
}

const tokenSchema = joi
  .object({
    uid: joi.number().integer().min(1).required(),
    exp: joi.number().required(),
  })
  .unknown(true);

export function validateToken<T extends unknown>(
  tokenData: T,
  checkExpiry = false,
): Required<User> & { exp: number } {
  const tokenValidationResult = tokenSchema.validate(tokenData);
  if (tokenValidationResult.error) {
    throw boom.badData('Invalid token');
  }
  if (checkExpiry && isAfter(new Date(), fromUnixTime(tokenValidationResult.value.exp))) {
    throw boom.badData('Expired token');
  }

  return tokenValidationResult.value;
}

export const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

export function getUidFromToken(token?: string | null): number | null {
  if (!token) {
    return null;
  }
  const tokenData = jwt.verify(token, config.user.tokenSecret);
  if (tokenData === null || typeof tokenData !== 'object') {
    return null;
  }
  const { uid } = validateToken(tokenData, true);
  return uid ?? null;
}

export const withResolverAuth = <A, T>(resolver: Resolver<A, T, Request>): Resolver<A, T> => async (
  root,
  args,
  ctx,
): Promise<T | null> => {
  const token = jwtFromRequest(ctx);
  ctx.user = { uid: token ? getUidFromToken(token) ?? 0 : ctx.session.uid ?? 0 };
  if (!ctx.user?.uid) {
    return null;
  }
  return resolver(root, args, ctx);
};

export function genToken({ uid }: User): Omit<LoginResponse, 'name'> {
  const expires = addDays(new Date(), config.user.sessionExpiryDays);
  const token = jwt.sign(
    {
      exp: getUnixTime(expires),
      uid,
    },
    config.user.tokenSecret,
  );

  return {
    error: null,
    apiKey: `Bearer ${token}`,
    expires,
    uid,
  };
}

export async function checkLoggedIn(
  db: DatabaseTransactionConnectionType,
  pin: number,
): Promise<UserInfo> {
  const users = await db.query<Omit<UserRow, 'config'>>(sql`SELECT uid, name, pin_hash FROM users`);

  const validUser = await users.rows.reduce<Promise<UserInfo | null>>(
    (last, { uid, name, pin_hash }) =>
      last.then(
        async (next): Promise<UserInfo | null> =>
          next ??
          new Promise((resolve, reject) => {
            bcrypt.compare(String(pin), pin_hash, (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res ? { uid, name } : null);
              }
            });
          }),
      ),
    Promise.resolve(null),
  );

  if (!validUser) {
    throw boom.unauthorized(config.msg.errorLoginBad);
  }

  return validUser;
}

const RedisStore = connectRedis(session);

export function setupAuth(app: Express): void {
  app.use(
    session({
      store:
        process.env.NODE_ENV === 'test'
          ? new MemoryStore()
          : new RedisStore({ client: redisClient }),
      cookie: {
        expires:
          process.env.NODE_ENV === 'test'
            ? undefined
            : addDays(new Date(), config.user.sessionExpiryDays),
      },
      secret: config.user.tokenSecret,
      resave: false,
      saveUninitialized: false,
    }),
  );
}

export const authMiddleware = (req: Request, _: Response, next: NextFunction): void => {
  if (!req.session.uid) {
    throw boom.unauthorized();
  }

  req.user = { uid: req.session.uid };
  next();
};
