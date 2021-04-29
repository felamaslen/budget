import nock from 'nock';

import mockOpenExchangeRatesResponse from '../../vendor/currencies.json';
import { getCurrencyPrices } from './currencies';
import config from '~api/config';

describe('getCurrencyPrices', () => {
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
});
