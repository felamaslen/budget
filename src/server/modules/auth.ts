import jwt from 'jsonwebtoken';
import addDays from 'date-fns/addDays';
import config from '~/server/config';

export async function genToken(
  { uid }: { uid: string },
  secret: string = config.userTokenSecret,
): Promise<string> {
  const expires = addDays(new Date(), 30);

  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        uid,
        expires: expires.toISOString(),
      },
      secret,
      (err: Error, data: string | object) => {
        if (err) {
          return reject(err);
        }

        return resolve(data as string);
      },
    );
  });
}
