import { getCurrencyPrices } from '~api/scripts/scrape-funds/currencies';
import { fundHash } from '~api/routes/data/funds/common';
import { getRawData } from '~api/scripts/scrape-funds/scrape';
import { scrapeFundHoldings } from '~api/scripts/scrape-funds/holdings';
import { scrapeFundPrices } from '~api/scripts/scrape-funds/prices';

function getBroker(config, name) {
    if (name.match(config.data.funds.scraper.regex)) {
        // At the moment, only Hargreaves Lansdown is supported

        return 'hl';
    }

    throw new Error('invalid fund name');
}

function getEligibleFunds(config, logger, rows) {
    const fundsByHash = rows.reduce((funds, { uid, item, units, cost }) => {
        if (!(units && !isNaN(units) && cost && !isNaN(cost))) {
            return funds;
        }

        const broker = getBroker(config, item);
        if (!broker) {
            return funds;
        }

        const hash = fundHash(item, config.data.funds.salt);

        const unitsRounded = Number(units.toFixed(5));

        if (funds[hash]) {
            return {
                ...funds,
                [hash]: {
                    ...funds[hash],
                    units: funds[hash].units + unitsRounded,
                    cost: funds[hash].cost + cost
                }
            };
        }

        return {
            ...funds,
            [hash]: {
                uid,
                name: item,
                hash,
                broker,
                units: unitsRounded,
                cost
            }
        };
    }, {});

    return Object.keys(fundsByHash).filter(hash => fundsByHash[hash].units > 0)
        .map(hash => fundsByHash[hash]);
}

async function getFunds(config, db, logger) {
    const rows = await db.select(
        'f.uid',
        'f.item',
        db.raw('SUM(ft.units)::float AS units'),
        db.raw('SUM(ft.cost)::float AS cost')
    )
        .from('funds as f')
        .innerJoin('funds_transactions as ft', 'ft.fund_id', 'f.id')
        .groupBy('f.uid', 'f.item');

    return getEligibleFunds(config, logger, rows);
}

async function processScrape(config, flags, db, logger) {
    const { holdings, prices } = flags;

    if (!holdings && !prices) {
        logger.info('Usage: node api/src/scripts/scrape-funds/process.js [--holdings|--prices]');

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
            const currencyPrices = await getCurrencyPrices(config, logger);

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
