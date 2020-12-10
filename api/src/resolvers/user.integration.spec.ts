import { gql, FetchResult } from 'apollo-boost';
import addDays from 'date-fns/addDays';
import sinon from 'sinon';

import config from '~api/config';
import { App, getTestApp } from '~api/test-utils/create-server';
import { Mutation, MutationLoginArgs, Query } from '~api/types';

describe('User resolver', () => {
  let app: App;
  beforeAll(async () => {
    app = await getTestApp();
  });

  describe('query WhoAmI', () => {
    const whoami = gql`
      query WhoAmI {
        whoami {
          uid
          name
        }
      }
    `;

    describe('when logged in', () => {
      it("should return the current user's info", async () => {
        expect.assertions(1);

        const res = await app.authGqlClient.query<Query>({
          query: whoami,
        });

        expect(res.data?.whoami).toStrictEqual(
          expect.objectContaining({
            uid: app.uid,
            name: 'test-user',
          }),
        );
      });
    });

    describe('when logged out', () => {
      it('should be null', async () => {
        expect.assertions(1);

        const res = await app.gqlClient.query<Query>({
          query: whoami,
        });

        expect(res.data?.whoami).toBeNull();
      });
    });
  });

  describe('mutation Login', () => {
    let clock: sinon.SinonFakeTimers;
    const now = new Date('2020-03-07T23:06:23Z');

    beforeEach(async () => {
      clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });
      await app.db('ip_login_req').truncate();
    });

    afterEach(() => {
      clock.restore();
    });

    const login = gql`
      mutation Login($pin: Int!) {
        login(pin: $pin) {
          error
          uid
          name
          apiKey
          expires
        }
      }
    `;

    it('should return a successful login response', async () => {
      expect.assertions(3);

      const { uid } = (await app.db.select<{ uid: number }>('uid').from('users').first()) || {};

      const res = await app.gqlClient.mutate<Mutation, MutationLoginArgs>({
        mutation: login,
        variables: { pin: 1234 },
      });

      expect(res.data).toStrictEqual(
        expect.objectContaining({
          login: expect.objectContaining({
            error: null,
            uid,
            name: 'test-user',
            expires: addDays(now, 30).toISOString(),
          }),
        }),
      );

      expect(res.data?.login).toHaveProperty('apiKey');
      expect(res.data?.login.apiKey).toStrictEqual(expect.any(String));
    });

    it('should return an unsuccessful login response', async () => {
      expect.assertions(1);

      const res = await app.gqlClient.mutate<Mutation, MutationLoginArgs>({
        mutation: login,
        variables: {
          pin: 1235,
        },
      });

      expect(res.data?.login).toStrictEqual(
        expect.objectContaining({
          error: 'Bad PIN',
          uid: null,
          apiKey: null,
          expires: null,
        }),
      );
    });

    describe('IP banning', () => {
      const ip0 = '1.2.3.4';
      const ip1 = '1.9.3.7';

      const badLogin = (ip = ip0): Promise<FetchResult<Mutation>> =>
        app.gqlClient.mutate<Mutation, MutationLoginArgs>({
          mutation: login,
          variables: { pin: 9999 },
          context: {
            headers: {
              'X-Forwarded-For': ip,
            },
          },
        });

      const goodLogin = (ip = ip0): Promise<FetchResult<Mutation>> =>
        app.gqlClient.mutate<Mutation, MutationLoginArgs>({
          mutation: login,
          variables: { pin: 1234 },
          context: {
            headers: {
              'X-Forwarded-For': ip,
            },
          },
        });

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
        expect.assertions(3);
        const resGoodPre = await goodLogin();

        await delayedBadLogins(config.user.banTries, config.user.banLimit - 1);

        clock.tick(config.user.banTime - 1);

        const resGoodPost = await goodLogin();

        expect(resGoodPre.data?.login.error).toBeNull();
        expect(resGoodPost.data?.login.error).toMatchInlineSnapshot(`"Banned"`);
        expect(resGoodPost.data?.login.apiKey).toBeNull();
      });

      it(`should require the bad login attemps to be within ${config.user.banLimit}ms`, async () => {
        expect.assertions(2);
        const resGoodPre = await goodLogin();

        await delayedBadLogins(config.user.banTries, config.user.banLimit + 1);

        clock.tick(config.user.banTime - 1);

        const resGoodPost = await goodLogin();

        expect(resGoodPre.data?.login.error).toBeNull();
        expect(resGoodPost.data?.login.error).toBeNull();
      });

      it(`should expire after ${config.user.banTime}ms`, async () => {
        expect.assertions(4);
        const resGoodPre = await goodLogin();

        await delayedBadLogins(config.user.banTries, config.user.banLimit - 1);

        clock.tick(config.user.banTime - 1);

        const resGoodPost = await goodLogin();

        clock.tick(2);

        const resGoodPostBan = await goodLogin();

        expect(resGoodPre.data?.login.error).toBeNull();
        expect(resGoodPost.data?.login.error).toMatchInlineSnapshot(`"Banned"`);
        expect(resGoodPost.data?.login.apiKey).toBeNull();
        expect(resGoodPostBan.data?.login.error).toBeNull();
      });

      it('should distinguish between different IPs', async () => {
        expect.assertions(5);
        const resGoodPre0 = await goodLogin(ip0);
        const resGoodPre1 = await goodLogin(ip1);

        expect(resGoodPre0.data?.login.error).toBeNull();
        expect(resGoodPre1.data?.login.error).toBeNull();

        await delayedBadLogins(config.user.banTries - 1, config.user.banLimit - 1, ip0);
        await badLogin(ip0);

        await badLogin(ip1);

        const resGoodPostBan0 = await goodLogin(ip0);
        const resGoodPostBan1 = await goodLogin(ip1);

        expect(resGoodPostBan0.data?.login.error).toMatchInlineSnapshot(`"Banned"`);
        expect(resGoodPostBan0.data?.login.apiKey).toBeNull();
        expect(resGoodPostBan1.data?.login.error).toBeNull();
      });
    });
  });
});
