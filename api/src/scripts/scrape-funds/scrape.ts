import axios from 'axios';

import config from '~api/config';
import logger from '~api/modules/logger';
import { Broker, Fund } from './types';
import { getFundUrlHL } from './hl';

export function getFundUrl(fund: Pick<Fund, 'name' | 'broker'>): string {
  if (fund.broker === Broker.HL) {
    return getFundUrlHL(fund);
  }

  return '';
}

export async function downloadUrl(url: string): Promise<string> {
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

    return '';
  }
}

export async function downloadMultipleUrls(urls: string[]): Promise<string[]> {
  if (urls.length === 0) {
    return [];
  }

  return [await downloadUrl(urls[0]), ...(await downloadMultipleUrls(urls.slice(1)))];
}
