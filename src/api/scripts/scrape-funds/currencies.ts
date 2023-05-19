import { CurrencyPrices } from './types';
import { getOrFetchExchangeRates } from '~api/controllers/exchange-rates';
import logger from '~api/modules/logger';

export async function getCurrencyPrices(): Promise<CurrencyPrices> {
  logger.verbose('Fetching currency prices for conversion...');

  try {
    const res = await getOrFetchExchangeRates();

    const poundRate = res.rates.GBP;
    if (!poundRate) {
      logger.warn('No base rate present on exchange rates response');
      return {};
    }

    logger.verbose(`Using current USD/GBP = ${poundRate}`);

    return {
      GBP: poundRate,
    };
  } catch (err) {
    logger.warn('Error fetching currency prices', err);
    return {};
  }
}
