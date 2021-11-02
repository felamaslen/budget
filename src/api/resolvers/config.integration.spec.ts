import gql from 'graphql-tag';
import sinon from 'sinon';

import { App, getTestApp, makeTestApp, runMutation, runQuery } from '~api/test-utils';
import {
  AppConfig,
  AppConfigInput,
  Query,
  Maybe,
  FundMode,
  MutationSetConfigArgs,
} from '~api/types';

describe('config resolver', () => {
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
        futureMonths
        realTimePrices
        fundMode
        fundPeriod
        fundLength
      }
    }
  `;

  describe('query Config', () => {
    describe('when not logged in', () => {
      it('should return null', async () => {
        expect.assertions(1);
        const res = await app.gqlClient.query<Query>(getConfig).toPromise();
        expect(res?.data?.config).toBeNull();
      });
    });

    const setup = async (): Promise<Maybe<AppConfig>> => {
      const res = await runQuery(app, getConfig);
      return res?.config ?? null;
    };

    it.each`
      description           | prop                | value
      ${'birth date'}       | ${'birthDate'}      | ${'1990-01-01'}
      ${'future months'}    | ${'futureMonths'}   | ${12}
      ${'real time prices'} | ${'realTimePrices'} | ${true}
      ${'fund mode'}        | ${'fundMode'}       | ${FundMode.Roi}
      ${'fund period'}      | ${'fundPeriod'}     | ${expect.anything()}
      ${'fund length'}      | ${'fundLength'}     | ${expect.anything()}
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
          config {
            birthDate
            futureMonths
            realTimePrices
            fundMode
            fundPeriod
            fundLength
          }
        }
      }
    `;
    describe.each`
      prop                | nextValue
      ${'realTimePrices'} | ${false}
      ${'fundMode'}       | ${FundMode.Stacked}
      ${'fundPeriod'}     | ${'month'}
      ${'fundLength'}     | ${7}
      ${'birthDate'}      | ${'1992-10-13'}
    `('setting $prop', ({ prop, nextValue }) => {
      const setup = async (config: AppConfigInput): Promise<Maybe<AppConfig>> => {
        const res = await runMutation<MutationSetConfigArgs>(app, mutation, { config });
        return res?.setConfig?.config ?? null;
      };

      it('should return the updated config', async () => {
        expect.assertions(1);
        const res = await setup({
          [prop]: nextValue,
        });

        expect(res).toStrictEqual(expect.objectContaining({ [prop]: nextValue }));
      });

      it('should persist the config within the same session', async () => {
        expect.assertions(1);

        await setup({
          [prop]: nextValue,
        });

        const res = await runQuery(app, getConfig);

        expect(res?.config).toStrictEqual(expect.objectContaining({ [prop]: nextValue }));
      });

      it('should persist the config from a different session, logged in as the same user', async () => {
        expect.assertions(1);

        await setup({ [prop]: nextValue });

        const separateApp = await makeTestApp();

        const res = await runQuery(separateApp, getConfig);

        expect(res?.config).toStrictEqual(expect.objectContaining({ [prop]: nextValue }));
      });
    });
  });
});
