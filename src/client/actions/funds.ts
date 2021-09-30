import type { ActionList } from './list';
import type { FundQuotes, HistoryOptions } from '~client/types';
import type { FundHistory, FundInput, TargetDelta } from '~client/types/gql';
import { PageNonStandard } from '~shared/constants';
import type { GQL } from '~shared/types';

export const enum ActionTypeFunds {
  QueryUpdated = '@@funds/QUERY_UPDATED',
  PricesUpdated = '@@funds/PRICES_UPDATED',
  ViewSoldToggled = '@@funds/VIEW_SOLD_TOGGLED',
  CashTargetUpdated = '@@funds/CASH_TARGET_UPDATED',
  AllocationTargetsUpdated = '@@funds/ALLOCATIONS_UPDATED',
  TodayPricesFetched = '@@funds/TODAY_PRICES_FETCHED',
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
  res: GQL<Omit<FundHistory, 'latestValue'>>;
};

export const fundPricesUpdated = (
  res: GQL<Omit<FundHistory, 'latestValue'>>,
): FundPricesUpdated => ({
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

export type TodayPricesFetched = {
  type: ActionTypeFunds.TodayPricesFetched;
  quotes: FundQuotes;
  refreshTime: string | null;
};

export const todayPricesFetched = (
  quotes: FundQuotes,
  refreshTime: string | null = null,
): TodayPricesFetched => ({
  type: ActionTypeFunds.TodayPricesFetched,
  quotes,
  refreshTime,
});

export type ActionFunds =
  | FundQueryUpdated
  | FundPricesUpdated
  | ViewSoldToggled
  | CashTargetUpdated
  | AllocationTargetsUpdated
  | TodayPricesFetched
  | ActionList<GQL<FundInput>, PageNonStandard.Funds>;
