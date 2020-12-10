import { ActionList } from './list';
import {
  FundHistory,
  FundInput,
  GQL,
  HistoryOptions,
  PageNonStandard,
  TargetDelta,
} from '~client/types';

export const enum ActionTypeFunds {
  QueryUpdated = '@@funds/QUERY_UPDATED',
  PricesUpdated = '@@funds/PRICES_UPDATED',
  ViewSoldToggled = '@@funds/VIEW_SOLD_TOGGLED',
  CashTargetUpdated = '@@funds/CASH_TARGET_UPDATED',
  AllocationTargetsUpdated = '@@funds/ALLOCATIONS_UPDATED',
}

export type FundQueryUpdated = {
  type: ActionTypeFunds.QueryUpdated;
  historyOptions: HistoryOptions;
};

export const fundQueryUpdated = (historyOptions: HistoryOptions): FundQueryUpdated => ({
  type: ActionTypeFunds.QueryUpdated,
  historyOptions,
});

export type FundPricesUpdated = {
  type: ActionTypeFunds.PricesUpdated;
  res: GQL<FundHistory>;
};

export const fundPricesUpdated = (res: GQL<FundHistory>): FundPricesUpdated => ({
  type: ActionTypeFunds.PricesUpdated,
  res,
});

type ViewSoldToggled = {
  type: ActionTypeFunds.ViewSoldToggled;
};

export const fundsViewSoldToggled = (): ViewSoldToggled => ({
  type: ActionTypeFunds.ViewSoldToggled,
});

export type CashTargetUpdated = {
  type: ActionTypeFunds.CashTargetUpdated;
  cashTarget: number;
};

export const cashTargetUpdated = (cashTarget: number): CashTargetUpdated => ({
  type: ActionTypeFunds.CashTargetUpdated,
  cashTarget,
});

export type AllocationTargetsUpdated = {
  type: ActionTypeFunds.AllocationTargetsUpdated;
  deltas: TargetDelta[];
};

export const allocationTargetsUpdated = (deltas: TargetDelta[]): AllocationTargetsUpdated => ({
  type: ActionTypeFunds.AllocationTargetsUpdated,
  deltas,
});

export type ActionFunds =
  | FundQueryUpdated
  | FundPricesUpdated
  | ViewSoldToggled
  | CashTargetUpdated
  | AllocationTargetsUpdated
  | ActionList<GQL<FundInput>, PageNonStandard.Funds>;
