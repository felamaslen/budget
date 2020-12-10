import { gql } from 'apollo-boost';
import moize from 'moize';
import sinon from 'sinon';

import { App, getTestApp } from '~api/test-utils/create-server';
import { Query, AppConfig } from '~api/types';

describe('Config resolver', () => {
  let clock: sinon.SinonFakeTimers;
  let app: App;
  beforeAll(async () => {
    clock = sinon.useFakeTimers(new Date('2018-04-20'));
    app = await getTestApp();
  });
  afterAll(async () => {
    clock.restore();
  });

  describe('query Config', () => {
    const config = gql`
      query {
        config {
          birthDate
          pieTolerance
          futureMonths
        }
      }
    `;

    describe('when not logged in', () => {
      it('should return null', async () => {
        expect.assertions(1);
        const res = await app.gqlClient.query<Query>({
          query: config,
        });
        expect(res.data?.config).toBeNull();
      });
    });

    const setup = moize(
      async (): Promise<AppConfig | null | undefined> => {
        const res = await app.authGqlClient.query<Query>({ query: config });
        return res.data?.config;
      },
      { isPromise: true },
    );

    it.each`
      description        | prop              | value
      ${'birth date'}    | ${'birthDate'}    | ${'1990-01-01'}
      ${'pie tolerance'} | ${'pieTolerance'} | ${0.075}
      ${'future months'} | ${'futureMonths'} | ${12}
    `('should return the $description', async ({ prop, value }) => {
      expect.assertions(1);
      const res = await setup();
      expect(res).toStrictEqual(
        expect.objectContaining({
          [prop]: value,
        }),
      );
    });
  });
});
