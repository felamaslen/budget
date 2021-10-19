import gql from 'graphql-tag';
import nock, { Scope } from 'nock';

import { nockCurrencies } from '~api/__tests__/nocks';
import { App, getTestApp } from '~api/test-utils/create-server';
import type { ExchangeRatesResponse, Query, QueryExchangeRatesArgs, Maybe } from '~api/types/gql';

describe('exchange rates resolvers', () => {
  let app: App;
  let currencyNock: Scope;
  beforeAll(async () => {
    app = await getTestApp();
  });

  beforeEach(() => {
    currencyNock = nockCurrencies();
  });

  afterEach(() => {
    nock.cleanAll();
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

  it.each`
    base     | expectedRates
    ${'GBP'} | ${expectedRatesGBPBase}
    ${'USD'} | ${expectedRatesUSDBase}
    ${'XAG'} | ${expectedRatesXAGBase}
  `('should return currency rates rebased to $base', async ({ base, expectedRates }) => {
    expect.assertions(2);
    const res = await app.authGqlClient.query<Query, QueryExchangeRatesArgs>({
      query,
      variables: {
        base,
      },
    });

    expect(res.data.exchangeRates?.error).toBeNull();
    expect(res.data.exchangeRates?.rates).toStrictEqual(expectedRates.map(expect.objectContaining));
  });
});
