/**
 * Script to scrape fund prices from broker
 */

/* eslint max-statements: 0 */

require('dotenv').config();

const request = require('request');

const config = require('../src/config')();
const { fundHash } = require('../src/routes/data/funds/common');
const { logger, connectToDatabase } = require('./common');

const ERR_DB = 1;
const ERR_FUNDS_LIST = 2;
const ERR_SCRAPE = 3;

function getPriceFromDataHL(data) {
    // gets the fund price from raw html (HL)

    // build a regex to match the specific part of the html
    // containing the bid (sell) price
    const regex = new RegExp([
        '<div id="security-price">',
        '.*',
        '<span class="bid price-divide"[^>]*>([0-9]+(\\.[0-9]*)?)p<\\/span>'
    ].join(''));

    const dataWithoutNewLines = data
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s+>/g, '>');

    const matches = dataWithoutNewLines.match(regex);

    if (!matches || !matches[1]) {
        throw new Error('data formatted incorrectly');
    }

    const price = parseFloat(matches[1], 10);

    return price;
}

function getPriceFromData(fund, data) {
    if (!data) {
        throw new Error('data empty');
    }

    if (fund.broker === 'hl') {
        return getPriceFromDataHL(data);
    }

    throw new Error('unknown broker');
}

function getPricesFromData(funds, data, flags) {
    return funds
        .map((fund, index) => {
            let price = null;
            try {
                price = getPriceFromData(fund, data[index]);

                if (!flags.quiet) {
                    logger(`Price: ${price} for ${fund.name}`, 'SUCCESS');
                }
            }
            catch (err) {
                if (!flags.quiet) {
                    logger(`Couldn't get price for ${fund.name}!`, 'ERROR');
                    if (flags.verbose) {
                        logger(err.stack, 'DEBUG');
                    }
                }
            }

            return Object.assign({}, fund, { price });
        });
}

function getFundUrlHL(fund) {
    // returns a URL like:
    // http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hl-multi-manager-uk-growth-accumulation
    if (config.test) {
        // return a testing URL
        return process.env.FUND_TEST_URL;
    }

    const matches = fund.name.match(config.data.funds.scraper.regex);

    const humanName = matches[1];
    const humanType = matches[2].toLowerCase();

    const systemName = humanName.toLowerCase().replace(/\s/g, '-');

    let systemType = null;
    if (humanType === 'inc') {
        systemType = 'income';
    }
    else if (humanType === 'accum') {
        systemType = 'accumulation';
    }
    else if (humanType === 'share') {
        systemType = 'share';
    }

    const firstLetter = systemName.substring(0, 1);

    const urlParts = ['http://www.hl.co.uk'];

    if (systemType === 'share') {
        urlParts.push('shares/shares-search-results');
        urlParts.push(firstLetter);
        urlParts.push(systemName);
    }
    else {
        urlParts.push('funds/fund-discounts,-prices--and--factsheets/search-results');
        urlParts.push(firstLetter);
        urlParts.push(`${systemName}-${systemType}`);
    }

    const url = urlParts.join('/');

    return url;
}

function getFundUrl(fund) {
    if (fund.broker === 'hl') {
        return getFundUrlHL(fund);
    }

    throw new Error('unknown fund broker');
}

function getCacheUrlMap(funds, flags) {
    // never download the same data twice
    const cacheMap = funds.reduce((red, fund) => {
        let url = null;
        try {
            url = getFundUrl(fund);

            if (flags.verbose) {
                logger(`URL: \`${fund.name}\` -> \`${url}\``, 'DEBUG');
            }
        }
        catch (err) {
            if (!flags.quiet) {
                logger(`Couldn't get fund URL for ${fund.name}!`, 'WARN');
                if (flags.verbose) {
                    logger(err.stack, 'DEBUG');
                }
            }

            return red;
        }

        const urlIndex = red.urls.indexOf(url);
        if (urlIndex === -1) {
            red.urlIndices.push(red.urls.length);
            red.urls.push(url);

            return red;
        }

        red.urlIndices.push(urlIndex);

        return red;

    }, { urls: [], urlIndices: [] });

    return cacheMap;
}

function downloadUrl(url, flags, requester = request) {
    const req = requester.defaults({
        jar: true,
        rejectUnauthorized: false,
        followAllRedirects: true
    });

    return new Promise((resolve, reject) => {
        if (flags.verbose) {
            logger(`Downloading: ${url}`, 'DEBUG');
        }

        return req.get({
            url,
            headers: {
                'User-Agent': config.data.funds.scraper.userAgent
            }
        }, (err, res) => {
            if (err) {
                return reject(err);
            }

            return resolve(res.body);
        });
    });
}

async function getRawData(funds, flags, requester = request) {
    const cacheUrlMap = getCacheUrlMap(funds, flags);

    const promises = cacheUrlMap.urls
        .map(url => downloadUrl(url, flags, requester));

    const data = await Promise.all(promises);

    const dataMapped = cacheUrlMap.urlIndices.map(urlIndex => data[urlIndex]);

    if (flags.verbose) {
        logger('Data fetched', 'SUCCESS');
    }

    return dataMapped;
}

async function scrapeFundHoldings(db, funds, data, flags) {
    // TODO
}

async function insertNewSinglePriceCache(db, cid, fund) {
    // add this fund to the hash list if it's not there
    const hashExistsQuery = await db.query(`
    SELECT fid FROM fund_hash
    WHERE hash = ? AND broker = ?
    `, fund.hash, fund.broker);

    let fid = null;
    if (hashExistsQuery.length) {
        fid = hashExistsQuery[0].fid;
    }
    else {
        const hashPutQuery = await db.query(`
        INSERT INTO fund_hash (broker, hash) VALUES (?, ?)
        `, fund.broker, fund.hash);

        fid = hashPutQuery.insertId;
    }

    // cache this value for display in the app
    await db.query(`
    INSERT INTO fund_cache (cid, fid, price) VALUES (?, ?, ?)
    `, cid, fid, fund.price);
}

async function insertNewPriceCache(db, fundsWithPrices, now) {
    const insertQuery = await db.query(`
    INSERT INTO fund_cache_time (time, done) VALUES (?, 0)
    `, Math.floor(now / 1000));

    const cid = insertQuery.insertId;

    const promises = fundsWithPrices
        .filter(fund => fund.price)
        .map(fund => insertNewSinglePriceCache(db, cid, fund));

    await Promise.all(promises);

    await db.query(`
    UPDATE fund_cache_time SET done = 1 WHERE cid = ?
    `, cid);
}

async function scrapeFundPrices(db, funds, data, flags, now = new Date()) {
    if (flags.verbose) {
        logger('Processing prices from data');
    }
    const fundsWithPrices = getPricesFromData(funds, data, flags);

    if (flags.verbose) {
        logger('Inserting prices into database');
    }
    try {
        await insertNewPriceCache(db, fundsWithPrices, now);
    }
    catch (err) {
        if (!flags.quiet) {
            logger('Error inserting prices into database', 'ERROR');
            if (flags.verbose) {
                logger(err.stack, 'DEBUG');
            }
        }
    }
}

function getBroker(name) {
    if (name.match(config.data.funds.scraper.regex)) {
        // At the moment, only Hargreaves Lansdown is supported

        return 'hl';
    }

    throw new Error('invalid fund name');
}

function getEligibleFunds(queryResult) {
    if (!queryResult || !Array.isArray(queryResult) || !queryResult.length) {
        return [];
    }

    return queryResult
        .map(fund => {
            try {
                const transactions = JSON.parse(fund.transactions);
                const units = transactions.reduce((sum, item) => sum + item.u, 0);

                if (!units) {
                    return null;
                }

                const broker = getBroker(fund.name);

                if (!broker) {
                    return null;
                }

                if (units > 0) {
                    return {
                        hash: fundHash(fund.name, config.data.funds.salt),
                        broker,
                        name: fund.name
                    };
                }

                return null;

            }
            catch (err) {
                return null;
            }
        })
        .filter(item => item !== null)
        .reduce((red, fund) => {
            // filter by unique fund hash
            if (red.hashes.indexOf(fund.hash) === -1) {
                red.hashes.push(fund.hash);
                red.funds.push(fund);
            }

            return red;
        }, { hashes: [], funds: [] })
        .funds;
}

async function getFunds(db) {
    const result = await db.query(`
    SELECT item AS name, transactions
    FROM funds
    WHERE transactions != '' AND cost > 0
    `);

    return getEligibleFunds(result);
}

function isArgumentEnabled(name) {
    const short = `-${name.substring(0, 1)}`;
    const long = `--${name}`;

    return process.argv.indexOf(short) !== -1 ||
        process.argv.indexOf(long) !== -1;
}

async function processScrape() {
    const flags = {
        verbose: isArgumentEnabled('verbose'),
        quiet: isArgumentEnabled('quiet')
    };

    if (!flags.quiet) {
        logger('Starting fund scraper...');
    }

    const getHoldings = isArgumentEnabled('holdings');
    const getPrices = !getHoldings;

    let db = null;
    try {
        db = await connectToDatabase();
        db.debug = 1;
    }
    catch (err) {
        logger('Couldn\'t connect to database!', 'FATAL');
        if (!flags.quiet) {
            logger(err.stack, 'DEBUG');
        }

        return ERR_DB;
    }

    let funds = null;
    try {
        funds = await getFunds(db);
    }
    catch (err) {
        logger('Error getting list of funds!', 'FATAL');
        if (!flags.quiet) {
            logger(err.stack, 'DEBUG');
        }

        return ERR_FUNDS_LIST;
    }

    if (!funds.length) {
        if (!flags.quiet) {
            logger('No funds to scrape!', 'WARN');
        }

        return 0;
    }

    let dataMapped = null;
    try {
        dataMapped = await getRawData(funds, flags);
    }
    catch (err) {
        logger('Error scraping data!', 'FATAL');
        if (flags.verbose) {
            logger(err.stack, 'DEBUG');
        }

        await db.end();

        return ERR_SCRAPE;
    }

    if (getHoldings) {
        if (!flags.quiet) {
            logger('Getting holdings...');
        }
        await scrapeFundHoldings(db, funds, dataMapped, flags);
    }

    if (getPrices) {
        if (!flags.quiet) {
            logger('Getting prices...');
        }
        await scrapeFundPrices(db, funds, dataMapped, flags);
    }

    await db.end();

    if (!flags.quiet) {
        logger('Finished scraping funds', 'SUCCESS');
    }

    return 0;
}

async function run() {
    const status = await processScrape();

    process.exit(status); // eslint-disable-line no-process-exit
}

if (require.main === module) {
    run();
}

module.exports = {
    getPriceFromDataHL,
    getPriceFromData,
    getPricesFromData,
    getFundUrlHL,
    getFundUrl,
    getCacheUrlMap,
    downloadUrl,
    getRawData,
    scrapeFundHoldings,
    insertNewSinglePriceCache,
    insertNewPriceCache,
    scrapeFundPrices,
    getBroker,
    getEligibleFunds,
    getFunds
};

