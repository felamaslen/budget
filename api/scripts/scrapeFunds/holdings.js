const { promptUser } = require('./helpers');
const { getHoldingsFromDataHL } = require('./hl');

async function getStockCodes(db, logger) {
    // get a saved map of saved stock codes so that the user doesn't need to enter
    // them every time
    logger.debug('Getting list of stock codes from database');

    const codes = await db.select('name', 'code')
        .from('stock_codes');

    return codes.reduce((items, { name, code }) => ({ ...items, [name]: code }), {});
}

function saveStockCodes(db, logger, stockCodes) {
    logger.debug('Saving updated stock codes to database');

    const names = Object.keys(stockCodes);
    if (!names.length) {
        return null;
    }

    const rows = names.map(name => ({ name, code: stockCodes[name] }));

    return db.batchInsert('stock_codes', rows, 30);
}

async function saveStocksList(db, logger, stocksList) {
    logger.debug('Inserting stocks list into database');

    await db('stocks').truncate();

    if (!stocksList.length) {
        return null;
    }

    return db.batchInsert('stocks', stocksList, 30);
}

async function getCodeForStock(name, stockCodes, newStockCodes) {
    if (name in stockCodes) {
        return stockCodes[name];
    }
    if (name in newStockCodes) {
        return newStockCodes[name];
    }

    const { code } = await promptUser({
        properties: {
            code: {
                description: `Enter code for ${name}`
            }
        }
    });

    return code;
}

async function updateHoldings(db, logger, fundsWithHoldings) {
    const stockCodes = await getStockCodes(db, logger);

    const fundsHoldings = fundsWithHoldings.reduce((rows, { holdings, uid, cost: weight }) => ([
        ...rows,
        ...holdings.map(({ name, value: subweight }) => ({ uid, name, weight, subweight }))
    ]), []);

    const newStocks = [];
    const newStockCodes = {};

    logger.debug('Getting any missing stock codes from user input');

    for (const { name, ...row } of fundsHoldings) {
        try {
            // eslint-disable-next-line no-await-in-loop
            let code = await getCodeForStock(name, stockCodes, newStockCodes);
            if (!(code && code.length)) {
                code = null;
            }

            if (!(name in stockCodes) && !(name in newStockCodes)) {
                newStockCodes[name] = code;
            }

            if (code) {
                newStocks.push({ ...row, name, code });
            }
            else {
                logger.warn(`Skipped null code for stock: ${name}`);
            }
        }
        catch (err) {
            if (err.message === 'canceled') {
                // this happens iff the user cancels a prompt for a stock code
                // in this case, we exit the entire process (for good UX)
                logger.info('Fund holdings update process cancelled by user');
            }
        }
    }

    await saveStockCodes(db, logger, newStockCodes);

    await saveStocksList(db, logger, newStocks);
}

function getFundHoldings(fund, data) {
    // get the top stock holdings for a fund
    if (!data) {
        throw new Error('Holdings data empty');
    }

    if (fund.broker === 'hl') {
        return getHoldingsFromDataHL(fund, data);
    }

    throw new Error('Unknown broker');
}

function getFundsWithHoldings(logger, funds, data) {
    // get the top stock holdings for a list of funds and add it to the array
    return funds.reduce((results, fund, index) => {
        try {
            const holdings = getFundHoldings(fund, data[index]);

            logger.debug(`Processed holdings for ${fund.name}`);

            const numErrors = holdings.filter(item => !item).length;

            if (numErrors > 0) {
                logger.warn(`Couldn't process ${numErrors} item(s)`);
            }

            return [
                ...results,
                {
                    ...fund,
                    holdings: holdings.filter(item => item)
                }
            ];
        }
        catch (err) {
            logger.warn(`Couldn't get holdings for fund with name: ${fund.name}`);
            logger.debug(err.stack);

            return results;
        }
    }, []);
}

async function scrapeFundHoldings(config, db, logger, funds, data) {
    logger.info('Processing fund holdings...');

    const fundsWithHoldings = getFundsWithHoldings(logger, funds, data);

    await updateHoldings(db, logger, fundsWithHoldings);
}

module.exports = {
    scrapeFundHoldings
};

