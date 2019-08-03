import { removeWhitespace, localFile } from '~api/scripts/scrape-funds/helpers';

export function isHLFundShare(fund) {
    return Boolean(fund.name.match(/^.*\(share\.?\)$/));
}

export function getHoldingsFromDataHL(fund, data) {
    if (isHLFundShare(fund)) {
        const [, name] = fund.name.match(/^(.*?)(\s+\(share\))?$/);

        return [{ name, value: 100 }];
    }

    const dataWithoutNewLines = removeWhitespace(data);

    const table = '<table class="factsheet-table" summary="Top 10 holdings">';

    try {
        const tableMatch = dataWithoutNewLines.match(new RegExp([
            table,
            '(.*?)',
            '<\\/table>'
        ].join('')));

        if (!tableMatch) {
            return null;
        }

        const [matchRowsRaw] = tableMatch;

        const matchRows = matchRowsRaw.match(/<tr[^>]*><td(.*?)<\/tr>/g);

        const regexCells = /<td[^>]*>(.*?)<\/td>/g;

        const holdings = matchRows
            .map(row => {
                try {
                    const [nameRaw, valueRaw] = row.match(regexCells);

                    const name = nameRaw.replace(/<[^>]*>/g, '');

                    const value = Number(valueRaw.replace(/[^\d.]/g, ''));

                    return { name, value };
                } catch {
                    return null;
                }
            });

        return holdings;
    } catch {
        throw new Error('Invalid data');
    }
}

export function getPriceFromDataHL(data, currencyPrices) {
    // gets the fund price from raw html (HL)

    // build a regex to match the specific part of the html
    // containing the bid (sell) price
    const regex = new RegExp([
        '<div id="security-price">',
        '.*',
        '<span class="bid price-divide"[^>]*>(\\$?)([0-9]+(\\.[0-9]*)?)p?<\\/span>'
    ].join(''));

    const dataWithoutNewLines = removeWhitespace(data);

    try {
        const [, dollar, price] = dataWithoutNewLines.match(regex);

        const rawPrice = Number(price);

        if (dollar) {
            if (!(currencyPrices && 'GBP' in currencyPrices)) {
                throw new Error('no GBP/USD currency conversion available');
            }

            return rawPrice * currencyPrices.GBP * 100;
        }

        return rawPrice;
    } catch {
        throw new Error('data formatted incorrectly');
    }
}

function getSystemType(humanType) {
    if (humanType === 'inc') {
        return 'income';
    }
    if (humanType === 'accum') {
        return 'accumulation';
    }
    if (humanType === 'accum-inc') {
        return 'accumulation-inclusive';
    }
    if (humanType === 'share') {
        return 'share';
    }

    return null;
}

export function getFundUrlHL(config, fund) {
    // returns a URL like:
    // http://www.hl.co.uk/funds/fund-discounts,-prices--and--factsheets/search-results/h/hl-multi-manager-uk-growth-accumulation
    const [, humanName, humanTypeRaw] = fund.name.match(config.data.funds.scraper.regex);

    const humanType = humanTypeRaw.toLowerCase();

    const systemName = humanName.toLowerCase().replace(/\s/g, '-');

    const systemType = getSystemType(humanType);

    const isShare = systemType === 'share';

    if (config.testIntegration) {
        // return a testing URL
        if (isShare) {
            return localFile(process.env.FUND_TEST_URL_SHARE);
        }

        return localFile(process.env.FUND_TEST_URL);
    }

    const firstLetter = systemName[0];

    let urlParts = ['http://www.hl.co.uk'];

    if (systemType === 'share') {
        urlParts = [...urlParts, 'shares/shares-search-results', firstLetter, systemName];
    } else {
        urlParts = [
            ...urlParts,
            'funds/fund-discounts,-prices--and--factsheets/search-results',
            firstLetter,
            `${systemName}-${systemType}`
        ];
    }

    return urlParts.join('/');
}
