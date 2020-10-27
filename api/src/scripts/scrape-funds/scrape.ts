import axios from 'axios';

import { getFundUrlHL } from './hl';
import { Broker, Fund } from './types';
import config from '~api/config';
import logger from '~api/modules/logger';

export const getFundUrl = (fund: Pick<Fund, 'name' | 'broker'>): string | null =>
  fund.broker === Broker.HL ? getFundUrlHL(fund) : null;

export async function downloadUrl(url: string | null): Promise<string | null> {
  if (!url) {
    return null;
  }
  try {
    logger.verbose(`Downloading ${url}...`);

    const res = await axios.get<string>(url, {
      headers: {
        'User-Agent': config.data.funds.scraper.userAgent,
      },
      timeout: config.scrapeTimeout,
    });

    logger.debug(`Downloaded ${url}`);

    return res.data;
  } catch (err) {
    logger.error(`Error downloading ${url}: ${err.message}`);

    return null;
  }
}

export async function downloadMultipleUrls(urls: (string | null)[]): Promise<(string | null)[]> {
  if (urls.length === 0) {
    return [];
  }

  return [await downloadUrl(urls[0]), ...(await downloadMultipleUrls(urls.slice(1)))];
}
