import sinon from 'sinon';
import jwt from 'jsonwebtoken';

import { genToken } from '../auth';

test('genToken generates a token', async () => {
  const clock = sinon.useFakeTimers(new Date('2019-10-28T18:10:11Z').getTime());

  const secret = 'my-test-secret';

  const user = {
    uid: 'my-user-id',
  };

  const token = await genToken(user, secret);

  expect(typeof token).toBe('string');
  expect(token).toBeTruthy();

  jwt.verify(token, secret, undefined, (err: Error, data: string | object) => {
    if (err) {
      throw err;
    }

    expect(data).toStrictEqual({
      uid: 'my-user-id',
      expires: '2019-11-27T18:10:11.000Z',
      iat: new Date('2019-10-28T18:10:11Z').getTime() / 1000,
    });
  });

  clock.restore();
});
