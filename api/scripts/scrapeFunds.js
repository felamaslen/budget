/**
 * Script to scrape fund prices from broker
 */

/* eslint max-lines: 0, max-statements: 0 */

require('dotenv').config();

const request = require('request');
const prompt = require('prompt');

const config = require('../src/config')();
const { fundHash } = require('../src/routes/data/funds/common');
const { logger, connectToDatabase } = require('./common');

const ERR_DB = 1;
const ERR_FUNDS_LIST = 2;
const ERR_SCRAPE = 3;
const ERR_SCRAPE_PRICES = 4;
const ERR_SCRAPE_HOLDINGS = 5;
const ERR_USER = 6;

function promptUser(schema) {
    return new Promise((resolve, reject) => {
        prompt.start();

        prompt.get(schema, (err, result) => {
            if (err) {
                return reject(err);
            }

            return resolve(result);
        });
    });
}

function removeWhitespace(data) {
    return data
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s+>/g, '>');
}

function isHLFundShare(fund) {
    return Boolean(fund.name.match(/^.*\(share\.?\)$/));
}

function getHoldingsFromDataHL(fund, data) {
    // gets the top holdings from raw HTML data (HL)
    const isShare = isHLFundShare(fund);

    const dataWithoutNewLines = removeWhitespace(data);

    const table = isShare
        ? '<table class="factsheet-table" summary="Top 10 exposures">'
        : '<table class="factsheet-table" summary="Top 10 holdings">';

    const matchTable = dataWithoutNewLines.match(new RegExp([
        table,
        '(.*?)',
        '<\\/table>'
    ].join('')));

    if (!matchTable || !matchTable[0]) {
        throw new Error('invalid data');
    }

    const matchRows = matchTable[0].match(/<tr[^>]*><td(.*?)<\/tr>/g);

    const regexCells = /<td[^>]*>(.*?)<\/td>/g;

    const holdings = matchRows
        .map(row => {
            const matchCells = row.match(regexCells);

            try {
                const name = matchCells[0].replace(/<[^>]*>/g, '');

                const value = parseFloat(matchCells[1].replace(/[^\d.]/g, ''), 10);

                return { name, value };
            }
            catch (err) {
                return null;
            }
        });

    return holdings;
}

function getFundHoldings(fund, data) {
    // get the top stock holdings for a fund
    if (!data) {
        throw new Error('data empty');
    }

    if (fund.broker === 'hl') {
        return getHoldingsFromDataHL(fund, data);
    }

    throw new Error('unknown broker');
}

function getHoldingsFromData(funds, data, flags) {
    // get the top stock holdings for a list of funds and add it to the array
    return funds
        .map((fund, index) => {
            let holdings = null;
            try {
                holdings = getFundHoldings(fund, data[index]);

                if (!flags.quiet) {
                    logger(`Processed holdings for ${fund.name}`, 'SUCCESS');
                }

                const numErrors = holdings.filter(item => item === null).length;

                if (numErrors > 0 && !flags.quiet) {
                    logger(`Couldn't process ${numErrors} item(s)`, 'WARN');
                }

                holdings = holdings.filter(item => item !== null);
            }
            catch (err) {
                if (!flags.quiet) {
                    logger(`Couldn't get holdings for ${fund.name}!`, 'ERROR');
                    if (flags.verbose) {
                        logger(err.stack, 'DEBUG');
                    }
                }
            }

            return Object.assign({}, fund, { holdings });
        });
}

function getPriceFromDataHL(data) {
    // gets the fund price from raw html (HL)

    // build a regex to match the specific part of the html
    // containing the bid (sell) price
    const regex = new RegExp([
        '<div id="security-price">',
        '.*',
        '<span class="bid price-divide"[^>]*>([0-9]+(\\.[0-9]*)?)p<\\/span>'
    ].join(''));

    const dataWithoutNewLines = removeWhitespace(data);

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

    const isShare = systemType === 'share';

    const firstLetter = systemName.substring(0, 1);

    const urlParts = ['http://www.hl.co.uk'];

    if (config.test) {
        // return a testing URL
        if (isShare) {
            return process.env.FUND_TEST_URL_SHARE;
        }

        return process.env.FUND_TEST_URL;
    }

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

            if (!flags.quiet) {
                logger(`Downloaded: ${url}`, 'SUCCESS');
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

async function getStockCodes(db) {
    // get a saved map of saved stock codes so that the user doesn't need to enter
    // them every time
    const results = await db.query(`
    SELECT name, code FROM stock_codes
    `);

    return results.reduce((map, row) => {
        map[row.name] = row.code;

        return map;
    }, {});
}

function saveStockCodes(db, stockCodes) {
    const names = Object.keys(stockCodes);
    const codes = Object.values(stockCodes);

    if (!names.length) {
        return null;
    }

    const queryValues = names.map(() => '(?, ?)');

    const args = codes.reduce((list, code, key) => {
        return list.concat([names[key], code]);
    }, []);

    return db.query(`
    INSERT INTO stock_codes (name, code)
    VALUES ${queryValues.join(', ')}
    `, ...args);
}

async function saveStocksList(db, stocksList) {
    await db.query(`
    TRUNCATE stocks
    `);

    if (!stocksList.length) {
        return null;
    }

    const queryValues = stocksList.map(row => {
        const placeholders = Object.keys(row).map(() => '?');

        return `(${placeholders.join(', ')})`;
    });

    const args = stocksList.reduce((list, row) => {
        return list.concat(Object.values(row));
    }, []);

    const keys = Object.keys(stocksList[0]).join(', ');

    return db.query(`
    INSERT INTO stocks (${keys})
    VALUES ${queryValues.join(', ')}
    `, ...args);
}

async function getCodeForStock(name, stockCodes, newStockCodes, flags) {
    if (name in stockCodes) {
        return stockCodes[name];
    }
    if (name in newStockCodes) {
        return newStockCodes[name];
    }

    if (flags.quiet) {
        return null;
    }

    const result = await promptUser({
        properties: {
            code: {
                description: `Enter code for ${name}`
            }
        }
    });

    return result.code;
}

async function updateHoldings(db, fundsWithHoldings, flags) {
    if (flags.verbose) {
        logger('Getting list of stock codes from database', 'DEBUG');
    }
    const stockCodes = await getStockCodes(db);

    const fundsHoldings = fundsWithHoldings
        .filter(fund => fund.holdings)
        .reduce((rows, fund) => {
            const holdings = fund.holdings;
            const uid = fund.uid;
            const weight = fund.cost;

            return rows.concat(holdings.map(holding => {
                const name = holding.name;
                const subweight = holding.value;

                return { uid, name, weight, subweight };
            }));
        }, []);

    const newStocks = [];
    const newStockCodes = {};

    if (flags.verbose) {
        logger('Getting any missing stock codes from user input', 'DEBUG');
    }
    for (const row of fundsHoldings) {
        const name = row.name;

        let code = null;
        try {
            // eslint-disable-next-line no-await-in-loop
            code = await getCodeForStock(name, stockCodes, newStockCodes, flags);
        }
        catch (err) {
            if (err.message === 'canceled') {
                // this happens iff the user cancels a prompt for a stock code
                // in this case, we exit the entire process (for good UX)
                logger('Process cancelled by user', 'WARN');

                return ERR_USER;
            }
        }

        if (!(name in stockCodes)) {
            newStockCodes[name] = code || null;
        }

        if (code) {
            newStocks.push(Object.assign({}, row, { code }));
        }
        else if (!flags.quiet) {
            logger(`Skipped null code for stock: ${name}`, 'WARN');
        }
    }

    if (flags.verbose) {
        logger('Saving updated stock codes to database', 'DEBUG');
    }
    await saveStockCodes(db, newStockCodes);

    if (!flags.quiet) {
        logger('Inserting stocks list into database');
    }
    await saveStocksList(db, newStocks);

    return 0;
}

async function scrapeFundHoldings(db, funds, data, flags) {
    if (flags.verbose) {
        logger('Processing holdings from data');
    }
    const fundsWithHoldings = getHoldingsFromData(funds, data, flags);

    try {
        const status = await updateHoldings(db, fundsWithHoldings, flags);

        return status;
    }
    catch (err) {
        if (!flags.quiet) {
            logger('Error inserting holdings into database', 'ERROR');
            if (flags.verbose) {
                logger(err.stack, 'DEBUG');
            }
        }

        return ERR_SCRAPE_HOLDINGS;
    }
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

    const currentValuePence = fundsWithPrices.reduce(
        (value, fund) => value + (fund.units * fund.price), 0
    );

    const currentValue = Math.round(currentValuePence) / 100;

    if (!flags.quiet) {
        logger(`Total value: ${config.data.currencyUnit}${currentValue}`);
    }

    if (flags.verbose) {
        logger('Inserting prices into database');
    }
    try {
        await insertNewPriceCache(db, fundsWithPrices, now);

        return 0;
    }
    catch (err) {
        if (!flags.quiet) {
            logger('Error inserting prices into database', 'ERROR');
            if (flags.verbose) {
                logger(err.stack, 'DEBUG');
            }
        }

        return ERR_SCRAPE_PRICES;
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
                const cost = transactions.reduce((sum, item) => sum + item.c, 0);

                if (!units || !cost) {
                    return null;
                }

                const broker = getBroker(fund.name);

                if (!broker) {
                    return null;
                }

                if (units > 0) {
                    return {
                        name: fund.name,
                        uid: fund.uid,
                        hash: fundHash(fund.name, config.data.funds.salt),
                        broker,
                        units,
                        cost
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
            const hashIndex = red.hashes.indexOf(fund.hash);
            if (hashIndex === -1) {
                red.hashes.push(fund.hash);
                red.funds.push(fund);
            }
            else {
                red.funds[hashIndex].units += fund.units;
                red.funds[hashIndex].cost += fund.cost;
            }

            return red;
        }, { hashes: [], funds: [] })
        .funds;
}

async function getFunds(db) {
    const result = await db.query(`
    SELECT item AS name, uid, transactions
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

    let status = 0;

    if (getHoldings) {
        if (!flags.quiet) {
            logger('Getting holdings...');
        }
        const holdingsStatus = await scrapeFundHoldings(db, funds, dataMapped, flags);

        status += holdingsStatus;
    }

    if (getPrices) {
        if (!flags.quiet) {
            logger('Getting prices...');
        }
        const pricesStatus = await scrapeFundPrices(db, funds, dataMapped, flags);

        status += pricesStatus;
    }

    await db.end();

    if (!flags.quiet && !status) {
        logger('Finished scraping funds', 'SUCCESS');
    }

    return status;
}

async function run() {
    const status = await processScrape();

    process.exit(status); // eslint-disable-line no-process-exit
}

if (require.main === module) {
    run();
}

module.exports = {
    isHLFundShare,
    getHoldingsFromDataHL,
    getFundHoldings,
    getHoldingsFromData,
    getPriceFromDataHL,
    getPriceFromData,
    getPricesFromData,
    getFundUrlHL,
    getFundUrl,
    getCacheUrlMap,
    downloadUrl,
    getRawData,
    getStockCodes,
    saveStockCodes,
    saveStocksList,
    getCodeForStock,
    scrapeFundHoldings,
    insertNewSinglePriceCache,
    insertNewPriceCache,
    scrapeFundPrices,
    getBroker,
    getEligibleFunds,
    getFunds
};

