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
    });

    logger.debug(`Downloaded ${url}`);

    return res.data;
  } catch (err) {
    logger.error(`Error downloading ${url}: ${err.message}`);

    return '';
  }
}
