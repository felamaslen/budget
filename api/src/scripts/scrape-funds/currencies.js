import axios from 'axios';

export async function getCurrencyPrices(config, logger) {
    logger.verbose('Fetching currency prices for conversion...');

    if (process.env.NODE_ENV === 'test') {
        return {
            GBP: 0.76746
        };
    }

    try {
        const response = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${config.openExchangeRatesApiKey}`);

        if (!(response.data &&
            'rates' in response.data &&
            'GBP' in response.data.rates &&
            !isNaN(response.data.rates.GBP)
        )) {

            logger.warn('Failed to fetch currency prices');

            return {};
        }

        const poundRate = response.data.rates.GBP;

        logger.verbose('Using current USD/GBP =', poundRate);

        return {
            GBP: poundRate
        };

    } catch (err) {
        return {};
    }
}
