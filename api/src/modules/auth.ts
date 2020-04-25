import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';
import passport from 'passport';
import addDays from 'date-fns/addDays';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import bcrypt from 'bcrypt';

import config from '~api/config';
import db from '~api/modules/db';
import { clientError } from '~api/modules/error-handling';

export type User = {
  uid: string;
};

type UserInfo = User & {
  name: string;
};

type UserRow = UserInfo & {
  pin_hash: string;
};

export function getStrategy(): Strategy {
  const params = {
    secretOrKey: config.user.tokenSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    passReqToCallback: true,
  };

  return new Strategy(params, async (_: Request, { uid }: User, done: VerifiedCallback) => {
    const user = await db
      .select('name')
      .from('users')
      .where('uid', '=', uid);

    if (!user.length) {
      return done(null, false, {
        message: 'User was deleted since last login',
      });
    }

    return done(null, { uid, ...user[0] });
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

function checkValidUser(
  pin: number | string,
): (last: Promise<UserInfo | null>, user: UserRow) => Promise<UserInfo | null> {
  const stringPin = String(pin);

  return (last, { pin_hash, ...user }): Promise<UserInfo | null> =>
    last.then(
      async (previous): Promise<UserInfo | null> => {
        if (previous) {
          return previous;
        }

        return new Promise((resolve, reject) => {
          bcrypt.compare(stringPin, pin_hash, (err, res) => {
            if (err) {
              return reject(err);
            }
            if (!res) {
              return resolve(null);
            }

            return resolve(user);
          });
        });
      },
    );
}

export async function checkLoggedIn(pin: number | string): Promise<UserInfo> {
  const users = await db.select<UserRow[]>('uid', 'name', 'pin_hash').from('users');

  const validUser = await users.reduce(checkValidUser(pin), Promise.resolve(null));
  if (!validUser) {
    throw clientError(config.msg.errorLoginBad, 401);
  }

  return validUser;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate(
    'jwt',
    {
      session: false,
      failWithError: true,
    },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        if (info.name === 'TokenExpiredError') {
          return res.status(401).json({ errorMessage: 'Token expired' });
        }

        return res.status(401).json({ errorMessage: info.message });
      }

      req.user = user;

      return next();
    },
  )(req, res, next);
}
