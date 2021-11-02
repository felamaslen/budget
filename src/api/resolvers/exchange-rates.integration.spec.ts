import type { ApolloQueryResult } from 'apollo-boost';
import gql from 'graphql-tag';
import nock, { Scope } from 'nock';

import mockOpenExchangeRatesResponse from '../vendor/currencies.json';

import { nockCurrencies } from '~api/__tests__/nocks';
import { redisClient } from '~api/modules/redis';
import { App, getTestApp } from '~api/test-utils/create-server';
import type { ExchangeRatesResponse, Query, QueryExchangeRatesArgs, Maybe } from '~api/types/gql';

describe('exchange rates resolvers', () => {
  let app: App;
  let currencyNock: Scope;
  beforeAll(async () => {
    app = await getTestApp();
  });

  beforeEach(async () => {
    nock.cleanAll();
    await redisClient.del('currencies');
  });

  const query = gql`
    query ExchangeRates($base: String!) {
      exchangeRates(base: $base) {
        error
        rates {
          currency
          rate
        }
      }
    }
  `;

  describe('when not logged in', () => {
    const setupNotLoggedIn = async (): Promise<Maybe<ExchangeRatesResponse> | undefined> => {
      const res = await app.gqlClient.query<Query, QueryExchangeRatesArgs>({
        query,
        variables: {
          base: 'GBP',
        },
      });
      return res.data.exchangeRates;
    };

    it('should return null', async () => {
      expect.assertions(1);
      const res = await setupNotLoggedIn();
      expect(res).toBeNull();
    });

    it('should not call the exchange rates API', async () => {
      expect.assertions(1);
      currencyNock = nockCurrencies();
      await setupNotLoggedIn();
      expect(currencyNock.isDone()).toBe(false);
    });
  });

  const expectedRatesGBPBase = [
    {
      currency: 'GBP',
      rate: 1, // GBP / GBP
    },
    {
      currency: 'USD',
      rate: 1 / 0.771546, // GBP / USD = (USD / USD) / (USD / GBP) = 1 / 0.771546
    },
    {
      currency: 'XAG',
      rate: 0.05406284 / 0.771546, // GBP / XAG = (USD / XAG) / (USD / GBP) = 0.05406284 / 0.771546
    },
    {
      currency: 'ZAR',
      rate: 15.00329 / 0.771546, // GBP / ZAR = (USD / GBP) / (USD / ZAR) = 0.771546 / 15.00329
    },
  ];

  const expectedRatesUSDBase = [
    {
      currency: 'GBP',
      rate: 0.771546, // USD / GBP
    },
    {
      currency: 'USD',
      rate: 1, // USD / USD
    },
    {
      currency: 'XAG',
      rate: 0.05406284, // USD / XAG
    },
    {
      currency: 'ZAR',
      rate: 15.00329, // USD / ZAR
    },
  ];

  const expectedRatesXAGBase = [
    {
      currency: 'GBP',
      rate: 0.771546 / 0.05406284, // XAG / GBP = (USD / GBP) / (USD / XAG) = 0.771546 / 0.05406284
    },
    {
      currency: 'USD',
      rate: 1 / 0.05406284, // XAG / USD = (USD / USD) / (USD / XAG) = 1 / 0.05406284
    },
    {
      currency: 'XAG',
      rate: 1, // XAG / XAG
    },
    {
      currency: 'ZAR',
      rate: 15.00329 / 0.05406284, // XAG / ZAR = (USD / ZAR) / (USD / XAG) = 15.00329 / 0.05406284
    },
  ];

  const getResponse = async (base: string): Promise<ApolloQueryResult<Query>> => {
    await app.authGqlClient.clearStore();
    const res = await app.authGqlClient.query<Query, QueryExchangeRatesArgs>({
      query,
      variables: {
        base,
      },
    });
    return res;
  };

  describe('when the response contains expected data', () => {
    beforeEach(() => {
      currencyNock = nockCurrencies();
    });

    it.each`
      base     | expectedRates
      ${'GBP'} | ${expectedRatesGBPBase}
      ${'USD'} | ${expectedRatesUSDBase}
      ${'XAG'} | ${expectedRatesXAGBase}
    `('should return currency rates rebased to $base', async ({ base, expectedRates }) => {
      expect.assertions(2);
      const res = await getResponse(base);

      expect(res.data.exchangeRates?.error).toBeNull();
      expect(res.data.exchangeRates?.rates).toStrictEqual(
        expectedRates.map(expect.objectContaining),
      );
    });

    it('should cache results', async () => {
      expect.assertions(2);

      await getResponse('GBP');
      nock.cleanAll();

      // this would throw an error if it made another request
      await expect(getResponse('USD')).resolves.toStrictEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            exchangeRates: expect.objectContaining({
              error: null,
              rates: expect.arrayContaining([
                expect.objectContaining({ currency: 'GBP', rate: expect.any(Number) }),
                expect.objectContaining({ currency: 'USD', rate: expect.any(Number) }),
              ]),
            }),
          }),
        }),
      );

      expect(currencyNock.isDone()).toBe(true);
    });
  });

  describe('when the response does not contain the given base currency', () => {
    beforeEach(() => {
      currencyNock = nockCurrencies(200, {
        ...mockOpenExchangeRatesResponse,
        rates: {
          USD: 1,
          XAG: 0.05406284,
          ZAR: 15.00329,
        },
      });
    });

    it('should return an empty array', async () => {
      expect.assertions(2);

      const resGBP = await getResponse('GBP');
      const resUSD = await getResponse('USD');

      expect(resGBP.data.exchangeRates?.rates).toHaveLength(0);
      expect(resUSD.data.exchangeRates?.rates).not.toHaveLength(0);
    });
  });

  describe('when an error occurs with the request', () => {
    beforeEach(() => {
      currencyNock = nockCurrencies(500);
    });

    it('should return the error', async () => {
      expect.assertions(2);
      const res = await getResponse('GBP');

      expect(res.data.exchangeRates?.rates).toBeNull();
      expect(res.data.exchangeRates?.error).toMatchInlineSnapshot(
        `"Request failed with status code 500"`,
      );
    });
  });
});
