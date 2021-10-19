import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { UseMutationResponse } from 'urql';
import { apiLoaded, apiLoading } from '~client/actions';
import { useUpdateEffect } from '~client/hooks/effect';
import * as gql from '~client/hooks/gql';
import { IDENTITY, toRawNetWorthEntry } from '~client/modules/data';
import type { Id, NetWorthEntryNative } from '~client/types';
import { RequestType } from '~client/types/enum';
import type {
  Mutation,
  NetWorthCategoryInput,
  NetWorthEntryInput,
  NetWorthSubcategoryInput,
} from '~client/types/gql';
import type { Create } from '~shared/types';

export type OnCreate<I> = (item: I) => void;
export type OnUpdate<I> = (id: Id, item: I) => void;
export type OnDelete = (id: Id) => void;

export type CrudProps<I extends Record<string, unknown>> = {
  onCreate: OnCreate<I>;
  onUpdate: OnUpdate<I>;
  onDelete: OnDelete;
};

export type HookOptions<I extends Record<string, unknown>, J extends Record<string, unknown>> = {
  mutations: {
    useCreate: () => UseMutationResponse<Partial<Mutation>, { input: I }>;
    useUpdate: () => UseMutationResponse<Partial<Mutation>, { id: Id; input: I }>;
    useDelete: () => UseMutationResponse<Partial<Mutation>, { id: Id }>;
  };
  transformToInput?: (item: J) => I;
};

export type HookCallOptions = {
  onError: (message: string, operationType: RequestType) => void;
};

export function useFetchingState(...mutationResults: { fetching: boolean }[]): void {
  const dispatch = useDispatch();
  const isFetching = mutationResults.some(({ fetching }) => fetching);
  useUpdateEffect(() => {
    if (isFetching) {
      dispatch(apiLoading);
    } else {
      dispatch(apiLoaded);
    }
  }, [isFetching, dispatch]);
}

function useCrud<I extends Record<string, unknown>, J extends Record<string, unknown>>(
  { mutations, transformToInput = IDENTITY }: HookOptions<I, J>,
  callOptions?: Partial<HookCallOptions>,
): CrudProps<J> {
  const [resultCreate, createItem] = mutations.useCreate();
  const [resultUpdate, updateItem] = mutations.useUpdate();
  const [resultDelete, deleteItem] = mutations.useDelete();

  useFetchingState(resultCreate, resultUpdate, resultDelete);

  const onCreate = useCallback(
    (item: J): void => {
      createItem({ input: transformToInput(item) });
    },
    [transformToInput, createItem],
  );

  const onUpdate = useCallback(
    (id: Id, item: J): void => {
      updateItem({ id, input: transformToInput(item) });
    },
    [transformToInput, updateItem],
  );

  const onDelete = useCallback(
    (id: Id): void => {
      deleteItem({ id });
    },
    [deleteItem],
  );

  const onError = callOptions?.onError;

  useEffect(() => {
    if (resultCreate.error) {
      onError?.(resultCreate.error.message, RequestType.create);
    }
  }, [resultCreate.error, onError]);

  useEffect(() => {
    if (resultUpdate.error) {
      onError?.(resultUpdate.error.message, RequestType.update);
    }
  }, [resultUpdate.error, onError]);

  useEffect(() => {
    if (resultDelete.error) {
      onError?.(resultDelete.error.message, RequestType.delete);
    }
  }, [resultDelete.error, onError]);

  return { onCreate, onUpdate, onDelete };
}

const optionsNetWorthCategory: HookOptions<NetWorthCategoryInput, NetWorthCategoryInput> = {
  mutations: {
    useCreate: gql.useCreateNetWorthCategoryMutation,
    useUpdate: gql.useUpdateNetWorthCategoryMutation,
    useDelete: gql.useDeleteNetWorthCategoryMutation,
  },
};

export function useNetWorthCategoryCrud(
  options?: Partial<HookCallOptions>,
): CrudProps<NetWorthCategoryInput> {
  return useCrud<NetWorthCategoryInput, NetWorthCategoryInput>(optionsNetWorthCategory, options);
}

const optionsNetWorthSubcategory: HookOptions<NetWorthSubcategoryInput, NetWorthSubcategoryInput> =
  {
    mutations: {
      useCreate: gql.useCreateNetWorthSubcategoryMutation,
      useUpdate: gql.useUpdateNetWorthSubcategoryMutation,
      useDelete: gql.useDeleteNetWorthSubcategoryMutation,
    },
  };

export function useNetWorthSubcategoryCrud(
  options?: Partial<HookCallOptions>,
): CrudProps<NetWorthSubcategoryInput> {
  return useCrud<NetWorthSubcategoryInput, NetWorthSubcategoryInput>(
    optionsNetWorthSubcategory,
    options,
  );
}

const optionsNetWorthEntry: HookOptions<NetWorthEntryInput, Create<NetWorthEntryNative>> = {
  mutations: {
    useCreate: gql.useCreateNetWorthEntryMutation,
    useUpdate: gql.useUpdateNetWorthEntryMutation,
    useDelete: gql.useDeleteNetWorthEntryMutation,
  },
  transformToInput: toRawNetWorthEntry,
};

export function useNetWorthEntryCrud(
  options?: Partial<HookCallOptions>,
): CrudProps<Create<NetWorthEntryNative>> {
  return useCrud<NetWorthEntryInput, Create<NetWorthEntryNative>>(optionsNetWorthEntry, options);
}
