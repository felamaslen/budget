import nock, { Scope } from 'nock';

import mockOpenExchangeRatesResponse from '../vendor/currencies.json';
import config from '~api/config';

export const nockCurrencies = (status = 200): Scope =>
  nock('https://openexchangerates.org')
    .get(`/api/latest.json?app_id=${config.openExchangeRatesApiKey}`)
    .reply(status, status === 200 ? mockOpenExchangeRatesResponse : undefined);
