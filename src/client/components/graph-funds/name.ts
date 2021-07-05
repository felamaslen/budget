import { GRAPH_FUNDS_OVERALL_ID } from '~client/constants';
import type { Id } from '~client/types';
import { abbreviateFundName } from '~shared/abbreviation';

export const getFundLineName = (id: Id, item: string): string =>
  id === GRAPH_FUNDS_OVERALL_ID ? 'Overall' : abbreviateFundName(item);
