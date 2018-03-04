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
    const fundsByHash = rows.reduce((funds, { name, transactions, uid }) => {
        try {
            const transactionsList = JSON.parse(transactions);
            const totalUnits = transactionsList.reduce((sum, { units }) => sum + units, 0);
            const totalCost = transactionsList.reduce((sum, { cost }) => sum + cost, 0);

            if (!(totalUnits && totalCost)) {
                return funds;
            }

            const broker = getBroker(config, name);
            if (!broker) {
                return funds;
            }

            const hash = fundHash(name, config.data.funds.salt);

            // combine duplicate funds
            if (hash in funds) {
                return {
                    ...funds,
                    [hash]: {
                        ...funds[hash],
                        units: totalUnits + funds[hash].units,
                        cost: totalUnits + funds[hash].cost
                    }
                };
            }

            return {
                ...funds,
                [hash]: {
                    name,
                    uid,
                    hash,
                    broker,
                    units: totalUnits,
                    cost: totalUnits
                }
            };
        }
        catch (err) {
            logger.warn(`Error processing fund with name "${name}":`, err.message);

            return funds;
        }

    }, {});

    return Object.keys(fundsByHash).map(hash => ({ hash, ...fundsByHash[hash] }));
}

async function getFunds(config, db, logger) {
    const rows = await db.select('item AS name', 'uid', 'transactions')
        .from('funds')
        .where('transactions', '!=', '')
        .andWhere('cost', '>', 0);

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

        const rawData = await getRawData(config, logger, funds);

        if (holdings) {
            await scrapeFundHoldings(config, db, logger, funds, rawData);
        }
        if (prices) {
            await scrapeFundPrices(config, db, logger, funds, rawData);
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
    processScrape
};

