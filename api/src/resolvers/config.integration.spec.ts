import gql from 'graphql-tag';
import moize from 'moize';
import sinon from 'sinon';

import { App, getTestApp } from '~api/test-utils/create-server';
import { AppConfig, AppConfigInput, Query, Maybe, Mutation } from '~api/types';

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

  const getConfig = gql`
    query {
      config {
        birthDate
        pieTolerance
        futureMonths
        fundPeriod
        fundLength
      }
    }
  `;

  describe('query Config', () => {
    describe('when not logged in', () => {
      it('should return null', async () => {
        expect.assertions(1);
        const res = await app.gqlClient.query<Query>({
          query: getConfig,
        });
        expect(res.data?.config).toBeNull();
      });
    });

    const setup = moize(
      async (): Promise<AppConfig | null | undefined> => {
        const res = await app.authGqlClient.query<Query>({ query: getConfig });
        return res.data?.config;
      },
      { isPromise: true },
    );

    it.each`
      description        | prop              | value
      ${'birth date'}    | ${'birthDate'}    | ${'1990-01-01'}
      ${'pie tolerance'} | ${'pieTolerance'} | ${0.075}
      ${'future months'} | ${'futureMonths'} | ${12}
      ${'fund period'}   | ${'fundPeriod'}   | ${expect.anything()}
      ${'fund length'}   | ${'fundLength'}   | ${expect.anything()}
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

  describe('mutation SetConfig', () => {
    const mutation = gql`
      mutation SetConfig($config: AppConfigInput!) {
        setConfig(config: $config) {
          birthDate
          pieTolerance
          futureMonths
          futureMonths
          fundPeriod
          fundLength
        }
      }
    `;
    describe.each`
      prop            | nextValue
      ${'fundPeriod'} | ${'month'}
      ${'fundLength'} | ${7}
    `('setting $prop', ({ prop, nextValue }) => {
      const setup = async (config: AppConfigInput): Promise<Maybe<AppConfig>> => {
        app.authGqlClient.clearStore();
        const res = await app.authGqlClient.mutate<Mutation>({
          mutation,
          variables: { config },
        });
        return res.data?.setConfig ?? null;
      };

      it('should return the updated config', async () => {
        expect.assertions(1);
        const res = await setup({
          [prop]: nextValue,
        });

        expect(res).toStrictEqual(expect.objectContaining({ [prop]: nextValue }));
      });

      it('should persist the config', async () => {
        expect.assertions(1);

        await setup({
          [prop]: nextValue,
        });

        const res = await app.authGqlClient.query<Query>({ query: getConfig });

        expect(res.data.config).toStrictEqual(expect.objectContaining({ [prop]: nextValue }));
      });
    });
  });
});
