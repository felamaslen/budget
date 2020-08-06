import { ActionList } from './list';
import { Period } from '~client/constants/graph';
import { ReadResponseFunds, Fund, Page } from '~client/types';

export const enum ActionTypeFunds {
  Requested = '@@funds/REQUESTED',
  Received = '@@funds/RECEIVED',
  ViewSoldToggled = '@@funds/VIEW_SOLD_TOGGLED',
  CashTargetUpdated = '@@funds/CASH_TARGET_UPDATED',
}

export type FundsRequested = {
  type: ActionTypeFunds.Requested;
  fromCache: boolean;
  period: Period | null;
};

export const fundsRequested = (fromCache = true, period: Period | null = null): FundsRequested => ({
  type: ActionTypeFunds.Requested,
  fromCache,
  period,
});

export type FundsReceived = {
  type: ActionTypeFunds.Received;
  period: Period;
  res: {
    data: ReadResponseFunds;
  } | null;
};

export const fundsReceived = (
  period: Period,
  res: { data: ReadResponseFunds } | null = null,
): FundsReceived => ({
  type: ActionTypeFunds.Received,
  res,
  period,
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

export type ActionFunds =
  | FundsRequested
  | FundsReceived
  | ViewSoldToggled
  | CashTargetUpdated
  | ActionList<Fund, Page.funds>;
