import nock from 'nock';

import mockOpenExchangeRatesResponse from '../../vendor/currencies.json';
import { getCurrencyPrices } from './currencies';
import config from '~api/config';
import { redisClient } from '~api/modules/redis';

describe('getCurrencyPrices', () => {
  beforeEach(async () => {
    await redisClient.del('currencies');
  });

  it('should return the USD/GBP rate', async () => {
    expect.assertions(1);

    nock('https://openexchangerates.org')
      .get(`/api/latest.json?app_id=${config.openExchangeRatesApiKey}`)
      .reply(200, mockOpenExchangeRatesResponse);

    const result = await getCurrencyPrices();

    expect(result).toStrictEqual({
      GBP: 0.771546,
    });
  });

  it('should return an empty object when GBP is not present in the response', async () => {
    expect.assertions(1);

    nock('https://openexchangerates.org')
      .get(`/api/latest.json?app_id=${config.openExchangeRatesApiKey}`)
      .reply(200, {
        ...mockOpenExchangeRatesResponse,
        rates: {
          USD: 1,
          EUR: 1.03,
        },
      });

    const result = await getCurrencyPrices();

    expect(result).toStrictEqual({});
  });

  it('should return an empty object when an error occurs', async () => {
    expect.assertions(1);

    nock('https://openexchangerates.org')
      .get(`/api/latest.json?app_id=${config.openExchangeRatesApiKey}`)
      .reply(500);

    const result = await getCurrencyPrices();

    expect(result).toStrictEqual({});
  });
});
