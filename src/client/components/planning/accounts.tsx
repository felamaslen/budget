import React, { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { ToggleButton } from './button';
import { usePlanningDispatch, usePlanningState } from './context';
import { CreditEditForm } from './form/credit';
import { IncomeEditForm } from './form/income';
import * as Styled from './styles';
import type { Account } from './types';

import { FormFieldSelect, FormFieldText, SelectOptions } from '~client/components/form-field';
import { useCTA } from '~client/hooks';
import { partialModification } from '~client/modules/data';
import { getCategories, getSubcategories } from '~client/selectors';
import type { PlanningAccount, PlanningAccountInput } from '~client/types/gql';
import { NetWorthAggregate } from '~shared/constants';
import type { GQL } from '~shared/types';
import { optionalDeep } from '~shared/utils';

export const AddAccount: React.FC = () => {
  const state = usePlanningState();
  const categories = useSelector(getCategories);
  const subcategories = useSelector(getSubcategories);

  const categoryIdCash =
    categories.find(({ category }) => category === NetWorthAggregate.cashEasyAccess)?.id ?? 0;

  const options = useMemo<SelectOptions<number>>(
    () =>
      subcategories
        .filter(
          ({ categoryId, id }) =>
            categoryId === categoryIdCash &&
            !state.accounts.some((account) => account.netWorthSubcategoryId === id),
        )
        .map(({ id, subcategory }) => ({
          internal: id,
          external: subcategory,
        })),
    [categoryIdCash, subcategories, state.accounts],
  );

  const [account, setAccount] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<number>(options[0]?.internal ?? 0);

  const dispatch = usePlanningDispatch();

  const onAdd = useCallback(() => {
    if (!(subcategoryId && account)) {
      return;
    }

    dispatch((last) => ({
      ...last,
      accounts: last.accounts.some((compare) => compare.netWorthSubcategoryId === subcategoryId)
        ? last.accounts
        : [
            ...last.accounts,
            {
              account,
              netWorthSubcategoryId: subcategoryId,
              income: [],
              pastIncome: [],
              creditCards: [],
              values: [],
            },
          ],
    }));
  }, [dispatch, subcategoryId, account]);

  if (!options.length) {
    return null;
  }

  return (
    <Styled.AccountGroupHeader>
      <FormFieldSelect options={options} value={subcategoryId} onChange={setSubcategoryId} />
      <FormFieldText value={account} onChange={setAccount} />
      <Styled.Button onClick={onAdd}>+</Styled.Button>
    </Styled.AccountGroupHeader>
  );
};

type PropsAccountEditForm = {
  account: GQL<PlanningAccount>;
};

const AccountEditForm: React.FC<PropsAccountEditForm> = ({ account }) => {
  const dispatch = usePlanningDispatch();
  const [tempAccount, setTempAccount] = useState<Account>(account);
  useEffect(() => {
    setTempAccount(account);
  }, [account]);

  const onSave = useCallback(
    (nextAccount: GQL<PlanningAccountInput>) => {
      dispatch((last) => ({
        ...last,
        accounts: partialModification(
          last.accounts,
          last.accounts.findIndex((compare) => compare.id === account.id),
          optionalDeep(nextAccount, 'id'),
        ),
      }));
    },
    [dispatch, account.id],
  );

  const onSaveLatest = useCallback(() => onSave(tempAccount), [tempAccount, onSave]);
  const onSaveCTA = useCTA(onSaveLatest);

  const updateAndSave = useCallback(
    (action: SetStateAction<Account>): void => {
      setTempAccount((last) => {
        const nextAccount = typeof action === 'function' ? action(last) : action;
        setTimeout(() => onSave(nextAccount), 0);
        return nextAccount;
      });
    },
    [onSave],
  );

  return (
    <Styled.AccountEditForm>
      <div>
        <h5>Edit account #{account.id}</h5>
      </div>
      <IncomeEditForm
        tempAccount={tempAccount}
        setTempAccount={setTempAccount}
        updateAndSave={updateAndSave}
      />
      <CreditEditForm
        tempAccount={tempAccount}
        setTempAccount={setTempAccount}
        updateAndSave={updateAndSave}
      />
      <div>
        <Styled.Button {...onSaveCTA}>Save</Styled.Button>
      </div>
    </Styled.AccountEditForm>
  );
};

type PropsModifyAccount = {
  account: PlanningAccountInput;
};

export const ModifyAccount: React.FC<PropsModifyAccount> = ({ account }) => {
  const [editing, setEditing] = useState<boolean>(false);
  const onToggleEditing = useCallback(() => setEditing((last) => !last), []);

  return (
    <Styled.AccountGroupHeader>
      <span>{account.account}</span>
      <ToggleButton active={editing} onToggle={onToggleEditing} />
      {editing && !!account.id && <AccountEditForm account={account as GQL<PlanningAccount>} />}
    </Styled.AccountGroupHeader>
  );
};
