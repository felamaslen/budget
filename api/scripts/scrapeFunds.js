/**
 * Script to scrape fund prices from broker
 */

/* eslint max-statements: 0 */

require('dotenv').config();

const request = require('request');

const config = require('../src/config')();
const { fundHash } = require('../src/routes/data/funds/common');
const { logger, connectToDatabase } = require('./common');

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
            }
            catch (err) {
                if (!flags.quiet) {
                    logger(`Couldn't get price for ${fund.name}!`, 'ERROR');
                }
            }

            return Object.assign({}, fund, { price });
        });
}

function getFundUrlHL(fund) {
    // returns a URL like:
    // http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hl-multi-manager-uk-growth-accumulation
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

        return urlParts.join('/');
    }

    urlParts.push('funds/fund-discounts,-prices--and--factsheets/search-results');
    urlParts.push(firstLetter);
    urlParts.push(`${systemName}-${systemType}`);

    return urlParts.join('/');
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
        }
        catch (err) {
            if (!flags.quiet) {
                logger(err, 'WARN');
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

    return new Promise(resolve => {
        if (flags.verbose) {
            logger(`[dl] ${url}`);
        }

        return req.get({
            url,
            headers: {
                'User-Agent': config.data.funds.scraper.userAgent
            }
        }, (err, res) => {
            if (err) {
                return resolve(null);
            }

            return resolve(res);
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
        logger('Data fetched');
    }

    return dataMapped;
}

async function scrapeFundHoldings(db, funds, data, flags) {
    // TODO
}

async function insertNewSinglePriceCache(db, cid, fund) {
    // add this fund to the hash list if it's not there
    const hashExistsQuery = db.query(`
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

    return 0;
}

async function insertNewPriceCache(db, fundsWithPrices) {
    const now = Math.floor(new Date().getTime() / 1000);

    const insertQuery = await db.query(`
    INSERT INTO fund_cache_time (time, done) VALUES (?, 0)
    `, now);

    const cid = insertQuery.insertId;

    const promises = fundsWithPrices
        .filter(fund => fund.price)
        .map(fund => insertNewSinglePriceCache(db, cid, fund));

    await Promise.all(promises);

    return 0;
}

async function scrapeFundPrices(db, funds, data, flags) {
    if (flags.verbose) {
        logger('Processing prices from data');
    }
    const fundsWithPrices = getPricesFromData(funds, data, flags);

    if (flags.verbose) {
        logger('Inserting prices into database');
    }
    await insertNewPriceCache(db, fundsWithPrices);

    return 0;
}

function getBroker(name) {
    if (name.match(config.data.funds.scraper.regex)) {
        // At the moment, only Hargreaves Lansdown is supported

        return 'hl';
    }

    return null;
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
                        name: fund.item,
                        uid: fund.uid,
                        units,
                        cost: fund.cost
                    };
                }

                return null;

            }
            catch (err) {
                return null;
            }
        })
        .filter(item => item !== null);
}

async function getFunds(db) {
    const result = await db.query(`
    SELECT item, uid, transactions, cost
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

async function run() {
    logger('Scraping funds....');

    const flags = {
        verbose: isArgumentEnabled('verbose'),
        quiet: isArgumentEnabled('quiet')
    };

    const getHoldings = isArgumentEnabled('holdings');
    const getPrices = !getHoldings;

    let db = null;
    try {
        db = await connectToDatabase();
    }
    catch (err) {
        return logger(`Couldn't connect to database: ${err}`, 'FATAL');
    }

    let funds = null;
    try {
        funds = await getFunds(db);
    }
    catch (err) {
        return logger(`Error getting list of funds: ${err}`, 'FATAL');
    }

    if (!funds.length) {
        if (!flags.quiet) {
            logger('No funds to scrape!');
        }

        return 0;
    }

    if (flags.verbose) {
        logger('Fetching data...');
    }
    const dataMapped = await getRawData(funds, flags);

    if (getHoldings) {
        await scrapeFundHoldings(db, funds, dataMapped, flags);
    }

    if (getPrices) {
        await scrapeFundPrices(db, funds, dataMapped, flags);
    }

    await db.end();

    if (!flags.quiet) {
        logger('Finished scraping funds');
    }

    return 0;
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

