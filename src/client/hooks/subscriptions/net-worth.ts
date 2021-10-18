import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Action } from 'redux';
import { SubscriptionHandler, UseSubscriptionResponse } from 'urql';

import { SubscriptionArgs } from './list';

import {
  dataRead,
  netWorthCategoryCreated,
  netWorthCategoryDeleted,
  netWorthCategoryUpdated,
  netWorthEntryCreated,
  netWorthEntryDeleted,
  netWorthEntryUpdated,
  netWorthSubcategoryCreated,
  netWorthSubcategoryDeleted,
  netWorthSubcategoryUpdated,
} from '~client/actions';
import * as gql from '~client/hooks/gql';
import { composeWithoutArgs } from '~client/modules/compose-without-args';
import type { Id, Item, NetWorthEntryRead } from '~client/types';
import type { Maybe, NetWorthCategory, NetWorthSubcategory } from '~client/types/gql';

type ResponseKeys = {
  created: 'netWorthCategoryCreated' | 'netWorthSubcategoryCreated' | 'netWorthEntryCreated';
  updated: 'netWorthCategoryUpdated' | 'netWorthSubcategoryUpdated' | 'netWorthEntryUpdated';
  deleted: 'netWorthCategoryDeleted' | 'netWorthSubcategoryDeleted' | 'netWorthEntryDeleted';
};

type CreateUpdate<T extends Item> = {
  item?: Maybe<T>;
};

type SubscriptionCreateUpdate<T extends Item> = Partial<{
  [key in ResponseKeys['created'] | ResponseKeys['updated']]: CreateUpdate<T>;
}>;

type SubscriptionDelete = Partial<{ [key in ResponseKeys['deleted']]: { id: Id } }>;

type CrudOptions<
  T extends Item,
  ActionCreate extends Action = Action,
  ActionUpdate extends Action = Action,
  ActionDelete extends Action = Action,
> = {
  responseKeys: ResponseKeys;
  actions: {
    onCreate: (item: T) => ActionCreate;
    onUpdate: (item: T) => ActionUpdate;
    onDelete: (id: Id) => ActionDelete;
  };
  subscriptions: {
    useOnCreate: (
      options?: SubscriptionArgs,
      handler?: SubscriptionHandler<SubscriptionCreateUpdate<T>, SubscriptionCreateUpdate<T>>,
    ) => UseSubscriptionResponse<Partial<Record<ResponseKeys['created'], CreateUpdate<T>>>>;
    useOnUpdate: (
      options?: SubscriptionArgs,
      handler?: SubscriptionHandler<SubscriptionCreateUpdate<T>, SubscriptionCreateUpdate<T>>,
    ) => UseSubscriptionResponse<Partial<Record<ResponseKeys['updated'], CreateUpdate<T>>>>;
    useOnDelete: (
      options?: SubscriptionArgs,
      handler?: SubscriptionHandler<SubscriptionDelete, SubscriptionDelete>,
    ) => UseSubscriptionResponse<Partial<Record<ResponseKeys['deleted'], { id: Id }>>>;
  };
};

function useNetWorthCrud<
  T extends Item,
  ActionCreate extends Action = Action,
  ActionUpdate extends Action = Action,
  ActionDelete extends Action = Action,
>({
  responseKeys,
  subscriptions,
  actions,
}: CrudOptions<T, ActionCreate, ActionUpdate, ActionDelete>): () => void {
  const dispatch = useDispatch();

  const [created, onReconnectCreate] = subscriptions.useOnCreate();
  const [updated, onReconnectUpdate] = subscriptions.useOnUpdate();
  const [deleted, onReconnectDelete] = subscriptions.useOnDelete();

  useEffect(() => {
    const item = created.data?.[responseKeys.created]?.item;
    if (item) {
      dispatch(actions.onCreate(item));
    }
  }, [created, dispatch, responseKeys.created, actions]);
  useEffect(() => {
    const item = updated.data?.[responseKeys.updated]?.item;
    if (item) {
      dispatch(actions.onUpdate(item));
    }
  }, [updated, dispatch, responseKeys.updated, actions]);
  useEffect(() => {
    const id = deleted.data?.[responseKeys.deleted]?.id;
    if (id) {
      dispatch(actions.onDelete(id));
    }
  }, [deleted, dispatch, responseKeys.deleted, actions]);

  return composeWithoutArgs(onReconnectCreate, onReconnectUpdate, onReconnectDelete);
}

const optionsCategory: CrudOptions<NetWorthCategory> = {
  responseKeys: {
    created: 'netWorthCategoryCreated',
    updated: 'netWorthCategoryUpdated',
    deleted: 'netWorthCategoryDeleted',
  },
  subscriptions: {
    useOnCreate: gql.useNetWorthCategoryCreatedSubscription,
    useOnUpdate: gql.useNetWorthCategoryUpdatedSubscription,
    useOnDelete: gql.useNetWorthCategoryDeletedSubscription,
  },
  actions: {
    onCreate: netWorthCategoryCreated,
    onUpdate: netWorthCategoryUpdated,
    onDelete: netWorthCategoryDeleted,
  },
};

const optionsSubcategory: CrudOptions<NetWorthSubcategory> = {
  responseKeys: {
    created: 'netWorthSubcategoryCreated',
    updated: 'netWorthSubcategoryUpdated',
    deleted: 'netWorthSubcategoryDeleted',
  },
  subscriptions: {
    useOnCreate: gql.useNetWorthSubcategoryCreatedSubscription,
    useOnUpdate: gql.useNetWorthSubcategoryUpdatedSubscription,
    useOnDelete: gql.useNetWorthSubcategoryDeletedSubscription,
  },
  actions: {
    onCreate: netWorthSubcategoryCreated,
    onUpdate: netWorthSubcategoryUpdated,
    onDelete: netWorthSubcategoryDeleted,
  },
};

const optionsEntry: CrudOptions<NetWorthEntryRead> = {
  responseKeys: {
    created: 'netWorthEntryCreated',
    updated: 'netWorthEntryUpdated',
    deleted: 'netWorthEntryDeleted',
  },
  subscriptions: {
    useOnCreate: gql.useNetWorthEntryCreatedSubscription,
    useOnUpdate: gql.useNetWorthEntryUpdatedSubscription,
    useOnDelete: gql.useNetWorthEntryDeletedSubscription,
  },
  actions: {
    onCreate: netWorthEntryCreated,
    onUpdate: netWorthEntryUpdated,
    onDelete: netWorthEntryDeleted,
  },
};

export function useNetWorthSubscriptions(): () => void {
  const dispatch = useDispatch();

  const onReconnectCategory = useNetWorthCrud(optionsCategory);
  const onReconnectSubcategory = useNetWorthCrud(optionsSubcategory);
  const onReconnectEntry = useNetWorthCrud(optionsEntry);

  const [cashTotal, onReconnectCashTotal] = gql.useNetWorthCashTotalUpdatedSubscription();
  useEffect(() => {
    if (cashTotal.data) {
      dispatch(dataRead({ netWorthCashTotal: cashTotal.data.netWorthCashTotalUpdated }));
    }
  }, [cashTotal, dispatch]);

  return composeWithoutArgs(
    onReconnectCategory,
    onReconnectSubcategory,
    onReconnectEntry,
    onReconnectCashTotal,
  );
}
