import sinon from 'sinon';
import jwt from 'jsonwebtoken';

import config from '~/server/config';

import { genToken, verifyToken } from '../auth';

const secret = 'my-test-secret';

const user = {
  uid: 'my-user-id',
};

test('genToken generates a token', async () => {
  const clock = sinon.useFakeTimers(new Date('2019-10-28T18:10:11Z').getTime());

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
      exp: new Date('2019-11-27T18:10:11Z').getTime() / 1000,
    });
  });

  clock.restore();
});

test('verifyToken verifies a token', async () => {
  const token = await genToken(user, secret);

  const uid = await verifyToken(token, secret);

  expect(uid).toBe(user.uid);

  await expect(verifyToken('fake-token', secret)).rejects.toEqual(new Error('Invalid token'));
});

test('verifyToken rejects an expired token', async () => {
  const clock = sinon.useFakeTimers(new Date('2019-10-28T18:10:11Z').getTime());

  const token = await genToken(user, secret);

  clock.tick(1000 * 86400 * config.userTokenExpiryDays + 1);

  await expect(verifyToken(token, secret)).rejects.toEqual(new Error('Expired token'));

  clock.restore();
});
