import { useCallback, useEffect } from 'react';
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
import { toNativeFund, withNativeDate } from '~client/modules/data';
import type { FundInputNative, Id, Item, PageList, StandardInput } from '~client/types';
import { PageListStandard, PageNonStandard } from '~client/types/enum';
import type {
  Exact,
  FundCreateUpdate,
  FundData,
  FundDelete,
  ListItemCreateUpdate,
  ListItemDelete,
  ListItemInput,
  ListItemStandardInput,
  Maybe,
  ReceiptCreatedSubscription,
} from '~client/types/gql';

type ResponseKeys = {
  created: 'listItemStandardCreated' | 'listItemExtendedCreated' | 'fundCreated';
  updated: 'listItemStandardUpdated' | 'listItemExtendedUpdated' | 'fundUpdated';
  deleted: 'listItemDeleted' | 'fundDeleted';
};

type OverviewSubscription = {
  overviewCost: number[];
  total?: Maybe<number>;
  weekly?: Maybe<number>;
};

type CreateUpdateBase<T extends ListItemInput = ListItemInput> = {
  id: Id;
  fakeId?: Maybe<Id>;
  item: T;
} & OverviewSubscription;

type DeleteBase = {
  id: Id;
} & OverviewSubscription;

type SubscriptionCreateUpdate<T extends CreateUpdateBase> = Partial<
  { [key in ResponseKeys['created'] | ResponseKeys['updated']]: T }
>;
type SubscriptionDelete<T extends Item> = Partial<{ [key in ResponseKeys['deleted']]: T }>;

export type SubscriptionArgs = Omit<
  UseSubscriptionArgs<Exact<{ [key: string]: never }>, unknown>,
  'query'
>;

type GenericHookOptions<
  I extends ListItemInput,
  J extends ListItemInput,
  P extends PageList,
  ResponseCreateUpdate extends CreateUpdateBase<I>,
  ResponseDelete extends DeleteBase
> = {
  getPage: (res: ResponseCreateUpdate | ResponseDelete) => P;
  responseKeys: ResponseKeys;
  subscriptions: {
    useOnCreate: (
      options: SubscriptionArgs,
      handler?: SubscriptionHandler<SubscriptionCreateUpdate<ResponseCreateUpdate>, void>,
    ) => UseSubscriptionResponse<
      void,
      Partial<Record<ResponseKeys['created'], ResponseCreateUpdate>>
    >;
    useOnUpdate: (
      options: SubscriptionArgs,
      handler?: SubscriptionHandler<SubscriptionCreateUpdate<ResponseCreateUpdate>, void>,
    ) => UseSubscriptionResponse<
      void,
      Partial<Record<ResponseKeys['updated'], ResponseCreateUpdate>>
    >;
    useOnDelete?: (
      options: SubscriptionArgs,
      handler?: SubscriptionHandler<SubscriptionDelete<ResponseDelete>, void>,
    ) => UseSubscriptionResponse<void, Partial<Record<ResponseKeys['deleted'], ResponseDelete>>>;
  };
  toNative: (input: I) => J;
};

function useListSubscriptionsGeneric<
  I extends ListItemInput,
  J extends ListItemInput,
  P extends PageList,
  ResponseCreateUpdate extends CreateUpdateBase<I>,
  ResponseDelete extends DeleteBase | never
>({
  responseKeys,
  subscriptions,
  toNative,
  getPage,
}: GenericHookOptions<I, J, P, ResponseCreateUpdate, ResponseDelete>): void {
  const dispatch = useDispatch();

  const onListItemCreated = useCallback<
    SubscriptionHandler<SubscriptionCreateUpdate<ResponseCreateUpdate>, void>
  >(
    (_, { [responseKeys.created]: res }) => {
      if (!res) {
        return;
      }
      const page = getPage(res);
      dispatch(listItemCreated(page, toNative(res.item), true, res.id, res.fakeId ?? 0));
      dispatch(listOverviewUpdated(page, res.overviewCost, res.total, res.weekly));
    },
    [dispatch, responseKeys.created, getPage, toNative],
  );

  const onListItemUpdated = useCallback<
    SubscriptionHandler<SubscriptionCreateUpdate<ResponseCreateUpdate>, void>
  >(
    (_, { [responseKeys.updated]: res }) => {
      if (!res) {
        return;
      }
      const page = getPage(res);
      dispatch(listItemUpdated(page, res.id, toNative(res.item), null, true));
      dispatch(listOverviewUpdated(page, res.overviewCost, res.total, res.weekly));
    },
    [dispatch, responseKeys.updated, getPage, toNative],
  );

  const onListItemDeleted = useCallback<
    SubscriptionHandler<SubscriptionDelete<ResponseDelete>, void>
  >(
    (_, { [responseKeys.deleted]: res }) => {
      if (!res) {
        return;
      }
      const page = getPage(res);
      dispatch(listItemDeleted(page, res.id, {} as ListItemInput, true));
      dispatch(listOverviewUpdated(page, res.overviewCost, res.total, res.weekly));
    },
    [dispatch, responseKeys.deleted, getPage],
  );

  const [resultItemCreated] = subscriptions.useOnCreate({}, onListItemCreated);
  const [resultItemUpdated] = subscriptions.useOnUpdate({}, onListItemUpdated);
  const resultItemDeleted = subscriptions.useOnDelete?.({}, onListItemDeleted);

  const error = resultItemCreated.error ?? resultItemUpdated.error ?? resultItemDeleted?.[0].error;

  useEffect(() => {
    if (error) {
      dispatch(errorOpened(`Error subscribing to list: ${error.message}`, ErrorLevel.Err));
    }
  }, [dispatch, error]);
}

const standardOptions: GenericHookOptions<
  ListItemStandardInput,
  StandardInput,
  PageListStandard,
  ListItemCreateUpdate,
  ListItemDelete
> = {
  responseKeys: {
    created: 'listItemStandardCreated',
    updated: 'listItemStandardUpdated',
    deleted: 'listItemDeleted',
  },
  subscriptions: {
    useOnCreate: gql.useListItemStandardCreatedSubscription,
    useOnUpdate: gql.useListItemStandardUpdatedSubscription,
    useOnDelete: gql.useListItemDeletedSubscription,
  },
  getPage: (res) => res.page,
  toNative: withNativeDate('date'),
};

const extendedOptions: GenericHookOptions<
  ListItemStandardInput,
  StandardInput,
  PageListStandard,
  ListItemCreateUpdate,
  never
> = {
  ...standardOptions,
  responseKeys: {
    created: 'listItemExtendedCreated',
    updated: 'listItemExtendedUpdated',
    deleted: 'listItemDeleted',
  },
  subscriptions: {
    useOnCreate: gql.useListItemExtendedCreatedSubscription,
    useOnUpdate: gql.useListItemExtendedUpdatedSubscription,
  },
};

const fundOptions: GenericHookOptions<
  FundData,
  FundInputNative,
  PageNonStandard.Funds,
  FundCreateUpdate,
  FundDelete
> = {
  responseKeys: {
    created: 'fundCreated',
    updated: 'fundUpdated',
    deleted: 'fundDeleted',
  },
  subscriptions: {
    useOnCreate: gql.useFundCreatedSubscription,
    useOnUpdate: gql.useFundUpdatedSubscription,
    useOnDelete: gql.useFundDeletedSubscription,
  },
  getPage: () => PageNonStandard.Funds,
  toNative: toNativeFund,
};

function useReceiptSubscription(): void {
  const dispatch = useDispatch();

  const onReceiptCreated = useCallback(
    (_, res: ReceiptCreatedSubscription): void => {
      if (res.receiptCreated.items) {
        dispatch(receiptCreated(res.receiptCreated.items));
      }
    },
    [dispatch],
  );

  gql.useReceiptCreatedSubscription({}, onReceiptCreated);
}

export function useListSubscriptions(): void {
  useListSubscriptionsGeneric(standardOptions);
  useListSubscriptionsGeneric(extendedOptions);
  useListSubscriptionsGeneric(fundOptions);

  useReceiptSubscription();
}
