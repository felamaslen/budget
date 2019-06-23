const { getCurrencyPrices } = require('./currencies');
const { fundHash } = require('../../src/routes/data/funds/common');
const { getRawData } = require('./scrape');
const { scrapeFundHoldings } = require('./holdings');
const { scrapeFundPrices } = require('./prices');

function getBroker(config, name) {
    if (name.match(config.data.funds.scraper.regex)) {
        // At the moment, only Hargreaves Lansdown is supported

        return 'hl';
    }

    throw new Error('invalid fund name');
}

function getEligibleFunds(config, logger, rows) {
    const fundsByHash = rows.reduce((funds, { uid, item, units }) => {
        if (!units || isNaN(units)) {
            return funds;
        }

        const broker = getBroker(config, item);
        if (!broker) {
            return funds;
        }

        const hash = fundHash(item, config.data.funds.salt);

        if (hash in funds) {
            funds[hash].units += Math.round(units * 10000) / 10000;

            return funds;
        }

        return {
            ...funds,
            [hash]: {
                uid,
                name: item,
                hash,
                broker,
                units
            }
        };
    }, {});

    return Object.keys(fundsByHash).filter(hash => fundsByHash[hash].units > 0)
        .map(hash => fundsByHash[hash]);
}

async function getFunds(config, db, logger) {
    const rows = await db.select('uid', 'item', 'units')
        .from('funds')
        .innerJoin('funds_transactions', 'funds_transactions.fund_id', 'funds.id');

    return getEligibleFunds(config, logger, rows);
}

async function processScrape(config, flags, db, logger) {
    const { holdings, prices } = flags;

    if (!holdings && !prices) {
        logger.info('Usage: node api/scripts/scrapeFunds/process.js [--holdings|--prices]');

        return 0;
    }

    logger.info('Starting fund scraper...');

    try {
        const funds = await getFunds(config, db, logger);

        if (!funds.length) {
            logger.info('No funds to scrape - exiting!');

            return 0;
        }

        const currencyPrices = await getCurrencyPrices(config, logger);

        const rawData = await getRawData(config, logger, funds);

        if (holdings) {
            await scrapeFundHoldings(config, db, logger, funds, rawData);
        }
        if (prices) {
            await scrapeFundPrices(config, db, logger, currencyPrices, funds, rawData);
        }

        logger.info('Finished scraping funds');

        return 0;
    }
    catch (err) {
        logger.error('Error scraping funds:', err.message);
        logger.debug(err.stack);

        return 1;
    }
}

module.exports = {
    getBroker,
    getEligibleFunds,
    processScrape
};
