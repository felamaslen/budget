import axios from 'axios';

import { CurrencyPrices } from './types';
import config from '~api/config';
import logger from '~api/modules/logger';

export async function getCurrencyPrices(): Promise<CurrencyPrices> {
  logger.verbose('Fetching currency prices for conversion...');

  try {
    const response = await axios.get(
      `https://openexchangerates.org/api/latest.json?app_id=${config.openExchangeRatesApiKey}`,
      {
        timeout: config.scrapeTimeout,
      },
    );

    if (
      !(
        response.data &&
        'rates' in response.data &&
        'GBP' in response.data.rates &&
        !Number.isNaN(response.data.rates.GBP)
      )
    ) {
      logger.warn('Failed to fetch currency prices');

      return {};
    }

    const poundRate = response.data.rates.GBP;

    logger.verbose(`Using current USD/GBP = ${poundRate}`);

    return {
      GBP: poundRate,
    };
  } catch (err) {
    return {};
  }
}