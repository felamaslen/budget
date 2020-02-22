import nock from 'nock';

import config from '~api/config';
import { getCurrencyPrices } from './currencies';
import mockOpenExchangeRatesResponse from './__tests__/currencies.json';

describe('getCurrencyPrices', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  it('should return the USD/GBP rate', async () => {
    nock('https://openexchangerates.org')
      .get(`/api/latest.json?app_id=${config.openExchangeRatesApiKey}`)
      .reply(200, mockOpenExchangeRatesResponse);

    const result = await getCurrencyPrices();

    expect(result).toEqual({
      GBP: 0.771546,
    });
  });
});
