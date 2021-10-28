import type { ActionApi } from './api';
import type { ActionError } from './error';
import type { ActionFunds } from './funds';
import type { ActionList, ActionReceiptCreated } from './list';
import type { ActionLogin } from './login';
import type { ActionNetWorth } from './net-worth';
import { isStandardListPage } from '~client/constants/data';
import type { IncomeExtraState } from '~client/reducers/types';
import type { StandardInput } from '~client/types';
import type {
  Fund,
  FundInput,
  Income,
  ListItemStandard,
  PageListStandard,
} from '~client/types/gql';
import { PageNonStandard } from '~shared/constants';

export * from './api';
export * from './error';
export * from './funds';
export * from './list';
export * from './login';
export * from './net-worth';

export type Action =
  | ActionApi
  | ActionError
  | ActionFunds
  | ActionReceiptCreated
  | ActionList<StandardInput, Income, PageListStandard.Income, IncomeExtraState>
  | ActionList<StandardInput, ListItemStandard, PageListStandard, Record<string, never>>
  | ActionLogin
  | ActionNetWorth;

export const isStandardListAction = (
  action:
    | ActionList<FundInput, Fund, PageNonStandard.Funds>
    | ActionList<StandardInput, ListItemStandard, PageListStandard>,
): action is ActionList<StandardInput, ListItemStandard, PageListStandard> =>
  isStandardListPage(action.page);
