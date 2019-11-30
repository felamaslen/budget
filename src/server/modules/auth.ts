import jwt from 'jsonwebtoken';
import addDays from 'date-fns/addDays';
import config from '~/server/config';

export interface user {
  uid: string;
}

export async function genToken(
  { uid }: user,
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
      if (err || !(data as user).uid) {
        return reject(new Error('Invalid token'));
      }

      return resolve((data as user).uid);
    });
  });
}
