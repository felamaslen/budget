import type { ActionApi } from './api';
import type { ActionError } from './error';
import type { ActionFunds } from './funds';
import type { ActionList, ActionReceiptCreated } from './list';
import type { ActionLogin } from './login';
import type { ActionNetWorth } from './net-worth';
import { isStandardListPage } from '~client/constants/data';
import type { IncomeExtraState } from '~client/reducers/types';
import type { PageList, StandardInput } from '~client/types';
import type { ListItemInput, PageListStandard } from '~client/types/gql';

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
  | ActionList<StandardInput, PageListStandard.Income, IncomeExtraState>
  | ActionList<StandardInput, PageListStandard>
  | ActionLogin
  | ActionNetWorth;

export const isStandardListAction = (
  action: ActionList<ListItemInput, PageList> | ActionList<StandardInput, PageListStandard>,
): action is ActionList<StandardInput, PageListStandard> => isStandardListPage(action.page);
