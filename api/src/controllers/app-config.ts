import config from '~api/config';
import { AppConfig } from '~api/types';

export function getAppConfig(): AppConfig {
  return {
    birthDate: new Date(config.data.overview.birthDate),
    pieTolerance: config.data.pie.tolerance,
    futureMonths: config.data.overview.numFuture,
  };
}
