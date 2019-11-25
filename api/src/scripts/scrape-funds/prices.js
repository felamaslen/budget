import { DateTime } from 'luxon';
import { getPriceFromDataHL } from '~api/scripts/scrape-funds/hl';

function getPriceFromData(fund, currencyPrices, data) {
    if (!data) {
        throw new Error('Data empty');
    }

    if (fund.broker === 'hl') {
        return getPriceFromDataHL(data, currencyPrices);
    }

    throw new Error('Unknown broker');
}

function getPricesFromData(logger, currencyPrices, funds, data) {
    return funds.reduce((results, fund, index) => {
        try {
            const price = getPriceFromData(fund, currencyPrices, data[index]);

            logger.verbose(`Price update: ${price} for ${fund.name}`);

            return [...results, { ...fund, price }];
        } catch (err) {
            logger.warn(`Couldn't get price for fund with name: ${fund.name}`);
            logger.debug(err.stack);

            return results;
        }
    }, []);
}

async function insertNewSinglePriceCache(db, logger, cid, fund) {
    const { hash, broker, price } = fund;

    const cachedHash = await db.select('fid')
        .from('fund_hash')
        .where({ hash, broker });

    let fid = null;

    if (cachedHash && cachedHash.length) {
        fid = cachedHash[0].fid;
    } else {
        [fid] = await db.insert({ hash, broker })
            .returning('fid')
            .into('fund_hash');

        logger.debug(`Creating previously non-existent fund hash with fid ${fid}`, hash);
    }

    // cache this value for display in the app
    await db.insert({ cid, fid, price })
        .into('fund_cache');
}

async function insertNewPriceCache(db, logger, fundsWithPrices, now) {
    const [cid] = await db.insert({ time: now, done: false })
        .returning('cid')
        .into('fund_cache_time');

    await Promise.all(fundsWithPrices.map((fund) => insertNewSinglePriceCache(db, logger, cid, fund)));

    await db('fund_cache_time').where({ cid })
        .update({ done: true });
}

export async function scrapeFundPrices(config, db, logger, currencyPrices, funds, data) {
    logger.info('Processing fund prices...');

    const fundsWithPrices = getPricesFromData(logger, currencyPrices, funds, data);

    const currentValue = (fundsWithPrices.reduce(
        (value, { units, price }) => value + units * price, 0,
    ) / 100).toFixed(2);

    logger.verbose(`Total value: ${config.data.currencyUnit}${currentValue}`);

    logger.debug('Inserting prices into database');

    await insertNewPriceCache(db, logger, fundsWithPrices, DateTime.local());
}
