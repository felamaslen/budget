import boom from '@hapi/boom';
import joi from '@hapi/joi';
import bcrypt from 'bcrypt';
import addDays from 'date-fns/addDays';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { sql, DatabaseTransactionConnectionType } from 'slonik';

import config from '~api/config';
import { getPool } from '~api/modules/db';
import { LoginResponse, UserInfo } from '~api/types';
import { User, Resolver, AuthenticatedRequest } from '~api/types/resolver';

type UserRow = UserInfo & {
  pin_hash: string;
};

export async function whoami({ uid }: User): Promise<UserInfo | null> {
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
): User & { exp: number } {
  const tokenValidationResult = tokenSchema.validate(tokenData);
  if (tokenValidationResult.error) {
    throw boom.badData('Invalid token');
  }
  if (checkExpiry && 1000 * tokenValidationResult.value.exp < new Date().getTime()) {
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
  return uid;
}

export const withResolverAuth = <A, T>(
  resolver: Resolver<A, T, AuthenticatedRequest>,
): Resolver<A, T> => async (root, args, ctx): Promise<T | null> => {
  const token = jwtFromRequest(ctx as Request);
  const uid = getUidFromToken(token);
  if (!uid) {
    return null;
  }
  ctx.user = { uid };
  return resolver(root, args, ctx as AuthenticatedRequest);
};

export function getStrategy(): Strategy {
  const params = {
    secretOrKey: config.user.tokenSecret,
    jwtFromRequest,
    passReqToCallback: true,
  };

  return new Strategy(
    params,
    async (_: Request, data: Record<string, unknown>, done: VerifiedCallback) => {
      try {
        const tokenData = validateToken(data, false);
        const user = await whoami(tokenData);
        if (!user) {
          return done(null, false, {
            message: 'User was deleted since last login',
          });
        }

        return done(null, user);
      } catch (err) {
        return done(null, false, err);
      }
    },
  );
}

export function genToken({ uid }: User): Omit<LoginResponse, 'name'> {
  const expires = addDays(new Date(), 30);
  const token = jwt.sign(
    {
      exp: expires.getTime() / 1000,
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
  const users = await db.query<UserRow>(sql`SELECT uid, name, pin_hash FROM users`);

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

export function authMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next): void => {
    passport.authenticate(
      'jwt',
      {
        session: false,
        failWithError: true,
      },
      (err: Error, user: User, info?: Error): void => {
        if (err) {
          next(err);
          return;
        }

        if (!user) {
          if (info?.name === 'TokenExpiredError') {
            res.status(401).json({ errorMessage: 'Token expired' });
          } else {
            res.status(401).json({ errorMessage: info?.message });
          }
        } else {
          req.user = user;
          next();
        }
      },
    )(req, res, next);
  };
}
