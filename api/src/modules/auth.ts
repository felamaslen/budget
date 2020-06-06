import boom from '@hapi/boom';
import bcrypt from 'bcrypt';
import addDays from 'date-fns/addDays';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';
import passport from 'passport';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { sql, DatabaseTransactionConnectionType } from 'slonik';

import config from '~api/config';
import { pool } from '~api/modules/db';

export type User = {
  uid: string;
};

type UserInfo = User & {
  name: string;
};

type UserRow = UserInfo & {
  pin_hash: string;
};

export type AuthenticatedRequest = Exclude<Request, 'user'> & {
  user: User;
};

export function getStrategy(): Strategy {
  const params = {
    secretOrKey: config.user.tokenSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    passReqToCallback: true,
  };

  return new Strategy(params, async (_: Request, { uid }: User, done: VerifiedCallback) => {
    const user = await pool.connect(async (db) => {
      const result = await db.query<{ name: string }>(
        sql`SELECT name FROM users WHERE uid = ${uid}`,
      );
      return result.rows[0];
    });

    if (!user) {
      return done(null, false, {
        message: 'User was deleted since last login',
      });
    }

    return done(null, { uid, name: user.name });
  });
}

export type LoginResponse = UserInfo & {
  error: string | false;
  apiKey: string;
  expires: Date;
};

export function genToken({ uid }: User): Omit<LoginResponse, 'name'> {
  const expires = addDays(new Date(), 30);
  const token = jwt.encode(
    {
      exp: expires.getTime() / 1000,
      uid,
    },
    config.user.tokenSecret,
  );

  return {
    error: false,
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
