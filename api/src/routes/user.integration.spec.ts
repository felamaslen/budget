import addDays from 'date-fns/addDays';
import sinon from 'sinon';
import { Test } from 'supertest';

import config from '~api/config';
import db from '~api/test-utils/knex';

describe('User route', () => {
  describe('POST /user/login', () => {
    let clock: sinon.SinonFakeTimers;
    const now = new Date('2020-03-07T23:06:23Z');

    beforeEach(async () => {
      clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });
      await db('ip_login_req').truncate();
    });

    afterEach(() => {
      clock.restore();
    });

    it('should return a successful login response', async () => {
      expect.assertions(5);
      const res = await global.agent.post('/api/v4/user/login').send({
        pin: 1234,
      });

      const { uid } = (await db.select<{ uid: string }>('uid').from('users').first()) || {};

      expect(uid).not.toBeUndefined();

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual(
        expect.objectContaining({
          uid,
          name: 'test-user',
          expires: addDays(now, 30).toISOString(),
        }),
      );

      expect(res.body).toHaveProperty('apiKey');
      expect(res.body.apiKey).toStrictEqual(expect.any(String));
    });

    it('should return an unsuccessful login response', async () => {
      expect.assertions(5);
      const res = await global.agent.post('/api/v4/user/login').send({
        pin: 1235,
      });

      expect(res.status).toBe(401);
      expect(res.body).toStrictEqual(
        expect.objectContaining({
          err: 'Bad PIN',
        }),
      );
      expect(res.body).not.toHaveProperty('uid');
      expect(res.body).not.toHaveProperty('apiKey');
      expect(res.body).not.toHaveProperty('expires');
    });

    describe('IP banning', () => {
      const ip0 = '1.2.3.4';
      const ip1 = '1.9.3.7';

      const badLogin = (ip = ip0): Test =>
        global.agent.post(`/api/v4/user/login`).send({ pin: 9999 }).set('X-Forwarded-For', ip);

      const goodLogin = (ip = ip0): Test =>
        global.agent.post(`/api/v4/user/login`).send({ pin: 1234 }).set('X-Forwarded-For', ip);

      const delayedBadLogins = async (
        numLogins: number,
        delay: number,
        ip = ip0,
      ): Promise<void> => {
        await new Array(numLogins).fill(0).reduce(
          (last: Promise<void>, _, index: number): Promise<void> =>
            last.then(async () => {
              await badLogin(ip);
              if (index < numLogins - 1) {
                clock.tick(delay / (numLogins - 1));
              }
            }),
          Promise.resolve(),
        );
      };

      it(`should start after ${config.user.banTries} successive bad login attempts`, async () => {
        expect.assertions(2);
        const resGoodPre = await goodLogin();

        await delayedBadLogins(config.user.banTries, config.user.banLimit - 1);

        clock.tick(config.user.banTime - 1);

        const resGoodPost = await goodLogin();

        expect(resGoodPre.status).toBe(200);
        expect(resGoodPost.status).toBe(401);
      });

      it(`should require the bad login attemps to be within ${config.user.banLimit}ms`, async () => {
        expect.assertions(2);
        const resGoodPre = await goodLogin();

        await delayedBadLogins(config.user.banTries, config.user.banLimit + 1);

        clock.tick(config.user.banTime - 1);

        const resGoodPost = await goodLogin();

        expect(resGoodPre.status).toBe(200);
        expect(resGoodPost.status).toBe(200);
      });

      it(`should expire after ${config.user.banTime}ms`, async () => {
        expect.assertions(3);
        const resGoodPre = await goodLogin();

        await delayedBadLogins(config.user.banTries, config.user.banLimit - 1);

        clock.tick(config.user.banTime - 1);

        const resGoodPost = await goodLogin();

        clock.tick(2);

        const resGoodPostBan = await goodLogin();

        expect(resGoodPre.status).toBe(200);
        expect(resGoodPost.status).toBe(401);
        expect(resGoodPostBan.status).toBe(200);
      });

      it('should distinguish between different IPs', async () => {
        expect.assertions(4);
        const resGoodPre0 = await goodLogin(ip0);
        const resGoodPre1 = await goodLogin(ip1);

        expect(resGoodPre0.status).toBe(200);
        expect(resGoodPre1.status).toBe(200);

        await delayedBadLogins(config.user.banTries - 1, config.user.banLimit - 1, ip0);
        await badLogin(ip0);

        await badLogin(ip1);

        const resGoodPostBan0 = await goodLogin(ip0);
        const resGoodPostBan1 = await goodLogin(ip1);

        expect(resGoodPostBan0.status).toBe(401);
        expect(resGoodPostBan1.status).toBe(200);
      });
    });
  });
});
