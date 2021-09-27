import omit from 'lodash/omit';
import moize from 'moize';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import * as Urql from 'urql';

import { useFetchingState } from './crud';
import { errorOpened, listItemCreated, listItemDeleted, listItemUpdated } from '~client/actions';
import { ErrorLevel } from '~client/constants/error';
import * as gql from '~client/hooks/gql';
import { omitTypeName, toRawFund, toRawIncome, withRawDate } from '~client/modules/data';

import type { FundInputNative, Id, PageList, StandardInput, WithIds } from '~client/types';
import { PageListStandard, PageNonStandard } from '~client/types/enum';
import type {
  FundInput,
  Income,
  IncomeInput,
  ListItemInput,
  ListItemStandardInput,
  Mutation,
  MutationCreateFundArgs,
  MutationCreateIncomeArgs,
  MutationCreateListItemArgs,
  MutationDeleteFundArgs,
  MutationDeleteIncomeArgs,
  MutationDeleteListItemArgs,
  MutationUpdateFundArgs,
  MutationUpdateIncomeArgs,
  MutationUpdateListItemArgs,
} from '~client/types/gql';
import { NativeDate } from '~shared/types';

export type OnCreateList<I extends ListItemInput> = (item: I) => void;
export type OnUpdateList<I extends ListItemInput> = (
  id: Id,
  delta: Partial<I>,
  item: WithIds<I>,
) => void;
export type OnDeleteList<I extends ListItemInput> = (id: Id, item: I) => void;

export type ListCrud<I extends ListItemInput> = {
  onCreate: OnCreateList<I>;
  onUpdate: OnUpdateList<I>;
  onDelete: OnDeleteList<I>;
};

type ResponseKeys = {
  create: 'createListItem' | 'createFund' | 'createIncome';
  update: 'updateListItem' | 'updateFund' | 'updateIncome';
  delete: 'deleteListItem' | 'deleteFund' | 'deleteIncome';
};

function useServerError(result: { error?: Error }, prefix: string, dispatch: Dispatch): void {
  useEffect(() => {
    if (result.error) {
      dispatch(errorOpened(`${prefix}: ${result.error.message}`, ErrorLevel.Err));
    }
  }, [dispatch, result.error, prefix]);
}

type GenericHookOptions<
  I extends ListItemInput,
  J extends ListItemInput,
  P extends PageList,
  ArgsCreate extends { fakeId: Id; input: J },
  ArgsUpdate extends { id: Id; input: J },
  ArgsDelete extends { id: Id }
> = {
  page: P;
  responseKeys: ResponseKeys;
  mutations: {
    useCreate: () => Urql.UseMutationResponse<Pick<Mutation, ResponseKeys['create']>, ArgsCreate>;
    useUpdate: () => Urql.UseMutationResponse<Pick<Mutation, ResponseKeys['update']>, ArgsUpdate>;
    useDelete: () => Urql.UseMutationResponse<Pick<Mutation, ResponseKeys['delete']>, ArgsDelete>;
  };
  getArgs: {
    create: (item: I, fakeId: Id) => ArgsCreate;
    update: (id: Id, delta: Partial<I>, item: WithIds<I>) => ArgsUpdate;
    delete: (id: Id) => ArgsDelete;
  };
};

function useListCrudGeneric<
  I extends ListItemInput,
  J extends ListItemInput,
  P extends PageList,
  ArgsCreate extends { fakeId: Id; input: J },
  ArgsUpdate extends { id: Id; input: J },
  ArgsDelete extends { id: Id }
>({
  page,
  responseKeys,
  mutations,
  getArgs,
}: GenericHookOptions<I, J, P, ArgsCreate, ArgsUpdate, ArgsDelete>): ListCrud<I> {
  const dispatch = useDispatch();

  const [resultCreate, createItem] = mutations.useCreate();
  const [resultUpdate, updateItem] = mutations.useUpdate();
  const [resultDelete, deleteItem] = mutations.useDelete();

  useFetchingState(resultCreate, resultUpdate, resultDelete);

  useServerError(resultCreate, 'Error creating list item', dispatch);
  useServerError(resultUpdate, 'Error updating list item', dispatch);
  useServerError(resultDelete, 'Error deleting list item', dispatch);

  const onCreate = useCallback(
    async (item: I): Promise<void> => {
      const optimisticAction = listItemCreated(page, item, false);
      dispatch(optimisticAction);

      const result = await createItem(getArgs.create(item, optimisticAction.id));

      const error = result.data?.[responseKeys.create]?.error;

      if (error) {
        dispatch(errorOpened(`Error creating list item: ${error}`, ErrorLevel.Warn));
      }
    },
    [dispatch, responseKeys, getArgs, page, createItem],
  );

  const onUpdate = useCallback(
    async (id: Id, delta: Partial<I>, item: WithIds<I>): Promise<void> => {
      const optimisticAction = listItemUpdated(page, id, delta, item, false);
      dispatch(optimisticAction);

      const result = await updateItem(getArgs.update(id, delta, item));

      const error = result.data?.[responseKeys.update]?.error;

      if (error) {
        dispatch(errorOpened(`Error updating list item: ${error}`, ErrorLevel.Warn));
      }
    },
    [dispatch, responseKeys, getArgs, page, updateItem],
  );

  const onDelete = useCallback(
    async (id: Id, item: I): Promise<void> => {
      const optimisticAction = listItemDeleted(page, id, item, false);
      dispatch(optimisticAction);

      const result = await deleteItem(getArgs.delete(id));

      const error = result.data?.[responseKeys.delete]?.error;

      if (error) {
        dispatch(errorOpened(`Error deleting list item: ${error}`, ErrorLevel.Warn));
      }
    },
    [dispatch, responseKeys, getArgs, page, deleteItem],
  );

  return { onCreate, onUpdate, onDelete };
}

export type MutationHookStandard<
  I extends ListItemInput,
  P extends PageListStandard
> = () => Urql.UseMutationResponse<Partial<Mutation>, { page: P; fakeId: Id; input: I }>;

const standardOptions = moize(
  (
    page: PageListStandard,
  ): GenericHookOptions<
    StandardInput,
    ListItemStandardInput,
    PageListStandard,
    MutationCreateListItemArgs,
    MutationUpdateListItemArgs,
    MutationDeleteListItemArgs
  > => ({
    page,
    responseKeys: {
      create: 'createListItem',
      update: 'updateListItem',
      delete: 'deleteListItem',
    },
    mutations: {
      useCreate: gql.useCreateListItemMutation,
      useUpdate: gql.useUpdateListItemMutation,
      useDelete: gql.useDeleteListItemMutation,
    },
    getArgs: {
      create: (input, fakeId): MutationCreateListItemArgs => ({
        page,
        fakeId,
        input: withRawDate<'date', typeof input>('date')(omitTypeName(input)),
      }),
      update: (id, delta, item): MutationUpdateListItemArgs => ({
        page,
        id,
        input: withRawDate<'date', StandardInput>('date')({
          ...omit(item, '__typename', 'id'),
          ...delta,
        }),
      }),
      delete: (id): MutationDeleteListItemArgs => ({ page, id }),
    },
  }),
);

export function useListCrudStandard(page: PageListStandard): ListCrud<StandardInput> {
  return useListCrudGeneric(standardOptions(page));
}

const incomeOptions: GenericHookOptions<
  NativeDate<Income, 'date'>,
  IncomeInput,
  PageListStandard.Income,
  MutationCreateIncomeArgs,
  MutationUpdateIncomeArgs,
  MutationDeleteIncomeArgs
> = {
  page: PageListStandard.Income,
  responseKeys: {
    create: 'createIncome',
    update: 'updateIncome',
    delete: 'deleteIncome',
  },
  mutations: {
    useCreate: gql.useCreateIncomeMutation,
    useUpdate: gql.useUpdateIncomeMutation,
    useDelete: gql.useDeleteIncomeMutation,
  },
  getArgs: {
    create: (input, fakeId): MutationCreateIncomeArgs => ({
      fakeId,
      input: toRawIncome(input),
    }),
    update: (id, delta, item): MutationUpdateIncomeArgs => ({
      id,
      input: toRawIncome({ ...item, ...delta }),
    }),
    delete: (id): MutationDeleteIncomeArgs => ({ id }),
  },
};

export function useListCrudIncome(): ListCrud<NativeDate<Income, 'date'>> {
  return useListCrudGeneric(incomeOptions);
}

const fundOptions: GenericHookOptions<
  FundInputNative,
  FundInput,
  PageNonStandard.Funds,
  MutationCreateFundArgs,
  MutationUpdateFundArgs,
  MutationDeleteFundArgs
> = {
  page: PageNonStandard.Funds,
  responseKeys: {
    create: 'createFund',
    update: 'updateFund',
    delete: 'deleteFund',
  },
  mutations: {
    useCreate: gql.useCreateFundMutation,
    useUpdate: gql.useUpdateFundMutation,
    useDelete: gql.useDeleteFundMutation,
  },
  getArgs: {
    create: (input, fakeId): MutationCreateFundArgs => ({
      fakeId,
      input: toRawFund(input),
    }),
    update: (id, delta, fund): MutationUpdateFundArgs => ({
      id,
      input: toRawFund({ ...omit(fund, 'id'), ...delta }),
    }),
    delete: (id): MutationDeleteFundArgs => ({ id }),
  },
};

export function useListCrudFunds(): ListCrud<FundInputNative> {
  return useListCrudGeneric(fundOptions);
}
