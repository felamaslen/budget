import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { UseSubscriptionArgs, SubscriptionHandler, UseSubscriptionResponse } from 'urql';

import {
  errorOpened,
  listItemCreated,
  listItemDeleted,
  listItemUpdated,
  listOverviewUpdated,
  receiptCreated,
} from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import * as gql from '~client/hooks/gql';
import { composeWithoutArgs } from '~client/modules/compose-without-args';
import { toNativeFund } from '~client/modules/data';
import { IncomeExtraState } from '~client/reducers/types';
import type { Id, NativeFund, PageList, StandardInput } from '~client/types';
import { PageListStandard, PageNonStandard } from '~client/types/enum';
import {
  Exact,
  Fund,
  FundsChangedSubscription,
  IncomeChangedSubscription,
  IncomeInput,
  ListChangedSubscription,
  ListItemInput,
  ListItemStandardInput,
  Maybe,
  useFundsChangedSubscription,
} from '~client/types/gql';
import { GQLShallow, NativeDate } from '~shared/types';
import { withNativeDate } from '~shared/utils';

export type SubscriptionArgs = Omit<
  UseSubscriptionArgs<Exact<{ [key: string]: never }>, unknown>,
  'query'
>;

type SubscriptionResponseGeneric<J extends ListItemInput> = {
  created?: Maybe<{
    fakeId: Id;
    item: J;
  }>;
  updated?: Maybe<J>;
  deleted?: Maybe<Id>;

  overviewCost: number[];
  total?: Maybe<number>;
  weekly?: Maybe<number>;
};

export type GenericHookOptions<
  I extends ListItemInput & { id: Id },
  J extends ListItemInput,
  P extends PageList,
  SubscriptionResponse extends Record<S, SubscriptionResponseGeneric<I>>,
  S extends string,
  ExtraState extends Record<string, unknown> = never,
> = {
  responseKey: S;
  getPage: (res: SubscriptionResponse) => P;
  useSubscription: (
    options: Omit<UseSubscriptionArgs<Record<string, never>>, 'query'>,
    handler?: SubscriptionHandler<SubscriptionResponse, SubscriptionResponse>,
  ) => UseSubscriptionResponse<SubscriptionResponse, Record<string, never>>;
  toNative: (input: I) => J;
  getExtraState?: (res: SubscriptionResponse[S]) => ExtraState;
};

export function useListSubscriptionsGeneric<
  I extends ListItemInput & { id: Id },
  J extends ListItemInput,
  P extends PageList,
  SubscriptionResponse extends Record<S, SubscriptionResponseGeneric<I>>,
  S extends string,
  ExtraState extends Record<string, unknown> = never,
>({
  responseKey,
  useSubscription,
  toNative,
  getPage,
  getExtraState,
}: GenericHookOptions<I, J, P, SubscriptionResponse, S, ExtraState>): () => void {
  const dispatch = useDispatch();

  const [{ data, error }, onReconnect] = useSubscription({});

  useEffect(() => {
    if (error) {
      dispatch(errorOpened(`Error subscribing to list: ${error.message}`, ErrorLevel.Err));
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (!data) {
      return;
    }
    const page = getPage(data);

    const created = data[responseKey].created;
    if (created) {
      dispatch(
        listItemCreated(page, toNative(created.item), true, created.item.id, created.fakeId),
      );
    }

    const updated = data[responseKey].updated;
    if (updated) {
      dispatch(listItemUpdated(page, updated.id, toNative(updated), null, true));
    }

    const deleted = data[responseKey].deleted;
    if (deleted) {
      dispatch(listItemDeleted(page, deleted, {} as ListItemInput, true));
    }

    dispatch(
      listOverviewUpdated(
        page,
        data[responseKey].overviewCost,
        data[responseKey].total,
        data[responseKey].weekly,
        getExtraState?.(data[responseKey]),
      ),
    );
  }, [dispatch, responseKey, getPage, getExtraState, toNative, data]);

  return onReconnect;
}

const standardOptions: GenericHookOptions<
  ListItemStandardInput & { id: Id },
  StandardInput,
  PageListStandard,
  ListChangedSubscription,
  'listChanged'
> = {
  responseKey: 'listChanged',
  useSubscription: gql.useListChangedSubscription,
  getPage: (res) => res.listChanged.page,
  toNative: withNativeDate('date'),
};

const incomeOptions: GenericHookOptions<
  IncomeInput & { id: Id },
  NativeDate<IncomeInput, 'date'> & { id: Id },
  PageListStandard.Income,
  IncomeChangedSubscription,
  'incomeChanged',
  IncomeExtraState
> = {
  responseKey: 'incomeChanged',
  useSubscription: gql.useIncomeChangedSubscription,
  getPage: () => PageListStandard.Income,
  getExtraState: (res) => ({
    totalDeductions: res.totalDeductions ?? [],
  }),
  toNative: withNativeDate('date'),
};

const fundOptions: GenericHookOptions<
  GQLShallow<Fund>,
  NativeFund<GQLShallow<Fund>>,
  PageNonStandard.Funds,
  FundsChangedSubscription,
  'fundsChanged'
> = {
  responseKey: 'fundsChanged',
  useSubscription: useFundsChangedSubscription,
  getPage: () => PageNonStandard.Funds,
  toNative: toNativeFund,
};

function useReceiptSubscription(): () => void {
  const dispatch = useDispatch();

  const [res, onReconnect] = gql.useReceiptCreatedSubscription({});
  useEffect(() => {
    if (res.data?.receiptCreated.items) {
      dispatch(receiptCreated(res.data.receiptCreated.items));
    }
  }, [dispatch, res.data]);

  return onReconnect;
}

export function useListSubscriptions(): () => void {
  const onReconnectStandard = useListSubscriptionsGeneric(standardOptions);
  const onReconnectIncome = useListSubscriptionsGeneric(incomeOptions);
  const onReconnectFunds = useListSubscriptionsGeneric(fundOptions);

  const onReconnectReceipt = useReceiptSubscription();

  return composeWithoutArgs(
    onReconnectStandard,
    onReconnectIncome,
    onReconnectFunds,
    onReconnectReceipt,
  );
}
