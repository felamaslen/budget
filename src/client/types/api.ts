import type { HistoryOptions } from './funds';
import type { AppConfig } from './gql';
import type { RequiredNotNull } from '~shared/types';

export type LocalAppConfig = RequiredNotNull<
  Pick<AppConfig, 'birthDate' | 'fundMode' | 'realTimePrices'>
> & {
  historyOptions: HistoryOptions;
};
