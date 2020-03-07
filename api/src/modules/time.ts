import { convertToLocalTime } from 'date-fns-timezone';

import config from '~api/config';

export const getNow = (): Date => convertToLocalTime(new Date(), { timeZone: config.timeZone });
