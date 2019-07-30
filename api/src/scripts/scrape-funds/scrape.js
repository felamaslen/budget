import fs from 'fs';
import request from 'request';
import { getFundUrlHL } from '~api/scripts/scrape-funds/hl';

export function getFundUrl(config, fund) {
    if (fund.broker === 'hl') {
        return getFundUrlHL(config, fund);
    }

    throw new Error('Unknown fund broker');
}

export function getCacheUrlMap(config, logger, funds) {
    // never download the same data twice
    return funds.reduce(({ urls, urlIndices }, fund) => {
        try {
            const url = getFundUrl(config, fund);

            logger.debug(`Got URL for fund: ${fund.name} -> ${url}`);

            if (urls.includes(url)) {
                const urlIndex = urls.findIndex(otherUrl => otherUrl === url);

                return { urls, urlIndices: [...urlIndices, urlIndex] };
            }

            return { urls: [...urls, url], urlIndices: [...urlIndices, urls.length] };
        } catch (err) {
            logger.error(`Error getting URL for fund: ${fund.name}:`, err.message);
            logger.debug(err.stack);

            return { urls, urlIndices };
        }

    }, { urls: [], urlIndices: [] });
}

export function downloadUrl(config, logger, url) {
    if (url.match(/^file:\/\//)) {
        const filePath = url.substring(7);

        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return reject(err);
                }

                logger.debug(`Downloaded ${filePath}`);

                return resolve(data);
            });
        });
    }

    const req = request.defaults({
        jar: true,
        rejectUnauthorized: false,
        followAllRedirects: true
    });

    return new Promise((resolve, reject) => {
        logger.verbose(`Downloading ${url}...`);

        return req.get({
            url,
            headers: {
                'User-Agent': config.data.funds.scraper.userAgent
            }
        }, (err, res) => {
            if (err) {
                return reject(err);
            }

            logger.debug(`Downloaded ${url}`);

            return resolve(res.body);
        });
    });
}

export async function getRawData(config, logger, funds) {
    const { urls, urlIndices } = getCacheUrlMap(config, logger, funds);

    const data = await Promise.all(urls.map(url => downloadUrl(config, logger, url)));

    const dataMapped = urlIndices.map(index => data[index]);

    logger.verbose('Raw data fetched successfully');

    return dataMapped;
}
