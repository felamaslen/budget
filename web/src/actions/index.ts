import { ActionApi } from './api';
import { ActionError } from './error';
import { ActionFunds } from './funds';
import { ActionList, ActionReceiptCreated } from './list';
import { ActionLogin } from './login';
import { ActionNetWorth } from './net-worth';
import { ActionStocks } from './stocks';
import { isStandardListPage } from '~client/constants/data';
import {
  ListItemInput,
  ListItemStandardInput,
  PageList,
  PageListExtended,
  PageListStandard,
  StandardInput,
} from '~client/types';

export * from './api';
export * from './error';
export * from './funds';
export * from './list';
export * from './login';
export * from './net-worth';
export * from './stocks';

export type Action =
  | ActionApi
  | ActionError
  | ActionFunds
  | ActionReceiptCreated
  | ActionList<ListItemInput, PageList>
  | ActionList<ListItemStandardInput, PageListExtended>
  | ActionLogin
  | ActionNetWorth
  | ActionStocks;

export const isStandardListAction = (
  action: ActionList<ListItemInput, PageList> | ActionList<StandardInput, PageListStandard>,
): action is ActionList<StandardInput, PageListStandard> => isStandardListPage(action.page);
