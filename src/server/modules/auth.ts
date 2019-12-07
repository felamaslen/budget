import { sql, DatabasePoolConnectionType, QueryResultRowType } from 'slonik';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import addDays from 'date-fns/addDays';
import config from '~/server/config';
import { withDb } from '~/server/modules/db';

export interface User {
  uid: string;
  name?: string;
  pinHash?: string;
}

export interface LoginResponse {
  uid: string;
  name: string;
  token: string;
}

export async function genToken(
  { uid }: User,
  secret: string = config.userTokenSecret,
): Promise<string> {
  const expires = addDays(new Date(), config.userTokenExpiryDays);

  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        uid,
        expires: expires.toISOString(),
      },
      secret,
      {
        expiresIn: `${config.userTokenExpiryDays}d`,
      },
      (err: Error, data: string | object) => {
        if (err) {
          return reject(err);
        }

        return resolve(data as string);
      },
    );
  });
}

export async function verifyToken(
  token: string,
  secret: string = config.userTokenSecret,
): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err: Error, data: string | object) => {
      if (err instanceof jwt.TokenExpiredError) {
        return reject(new Error('Expired token'));
      }
      if (err || !(data as User).uid) {
        return reject(new Error('Invalid token'));
      }

      return resolve((data as User).uid);
    });
  });
}

export const loginWithPin = withDb<LoginResponse | null>(
  async (db: DatabasePoolConnectionType, pin: string): Promise<LoginResponse | null> => {
    const users = await db.query(sql`
select
  ${sql.join(
    [
      sql.identifier(['uid']),
      sql.identifier(['name']),
      sql`${sql.identifier(['pin_hash'])} as ${sql.identifier(['pinHash'])}`,
    ],
    sql`, `,
  )}
from users
    `);

    const loggedInUser = await users.rows.reduce(
      (
        last: Promise<User | null>,
        item: QueryResultRowType<'uid' | 'pinHash'>,
      ): Promise<User | null> =>
        last.then(
          (validUser: User | null): Promise<User | null> => {
            if (validUser) {
              return Promise.resolve(validUser);
            }

            return new Promise((resolve, reject) => {
              bcrypt.compare(pin, item.pinHash as string, (err: Error, res: boolean) => {
                if (err) {
                  return reject(err);
                }
                if (!res) {
                  return resolve(null);
                }

                return resolve(item as User);
              });
            });
          },
        ),
      Promise.resolve(null),
    );

    if (!loggedInUser) {
      return null;
    }

    const token = await genToken(loggedInUser);
    const { uid, name } = loggedInUser;

    return { uid, name: name || '', token };
  },
);
