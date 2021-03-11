import { GRAPH_FUNDS_OVERALL_ID } from '~client/constants';
import { abbreviateFundName } from '~client/modules/finance';
import type { Id } from '~client/types';

export const getFundLineName = (id: Id, item: string): string =>
  id === GRAPH_FUNDS_OVERALL_ID ? 'Overall' : abbreviateFundName(item);
