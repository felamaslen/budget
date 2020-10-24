import { ActionAnalysis } from './analysis';
import { ActionApi } from './api';
import { ActionError } from './error';
import { ActionFunds } from './funds';
import { ActionList } from './list';
import { ActionLogin } from './login';
import { ActionNetWorth } from './net-worth';
import { ActionStocks } from './stocks';
import { isCalcPage } from '~client/constants/data';
import {
  Page,
  PageList,
  PageListCalc,
  ListItem,
  ListCalcItem,
  Income,
  Bill,
  Food,
  General,
  Holiday,
  Social,
} from '~client/types';

export * from './analysis';
export * from './api';
export * from './error';
export * from './funds';
export * from './list';
export * from './login';
export * from './net-worth';
export * from './stocks';

export type Action =
  | ActionAnalysis
  | ActionApi
  | ActionError
  | ActionFunds
  | ActionList<Income, Page.income>
  | ActionList<Bill, Page.bills>
  | ActionList<Food, Page.food>
  | ActionList<General, Page.general>
  | ActionList<Holiday, Page.holiday>
  | ActionList<Social, Page.social>
  | ActionLogin
  | ActionNetWorth
  | ActionStocks;

export const isCalcListAction = (
  action: ActionList<ListItem, PageList>,
): action is ActionList<ListCalcItem, PageListCalc> => isCalcPage(action.page);

export const isGeneralListAction = (
  action: ActionList<ListItem, PageList>,
): action is ActionList<General, Page.general> => action.page === Page.general;
