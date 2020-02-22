import request from 'request';

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

export function downloadUrl(url: string): Promise<string> {
  const req = request.defaults({
    jar: true,
    rejectUnauthorized: false,
    followAllRedirects: true,
  });

  return new Promise((resolve, reject) => {
    logger.verbose(`Downloading ${url}...`);

    return req.get(
      {
        url,
        headers: {
          'User-Agent': config.data.funds.scraper.userAgent,
        },
      },
      (
        err: Error,
        res: {
          body: string;
        },
      ): void => {
        if (err) {
          reject(err);
        } else {
          logger.debug(`Downloaded ${url}`);
          resolve(res.body);
        }
      },
    );
  });
}
