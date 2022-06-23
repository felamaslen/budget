import { compose } from '@typed/compose';
import { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { usePlanningDispatch, usePlanningState } from './context';
import { CreditEditForm } from './form/credit';
import { IncomeEditForm } from './form/income';
import * as StyledForm from './form/styles';
import { SidebarSection } from './sidebar-section';
import * as Styled from './styles';
import type { Account, State } from './types';

import {
  FormFieldCostInline,
  FormFieldSelect,
  FormFieldText,
  FormFieldTickbox,
  SelectOptions,
} from '~client/components/form-field';
import { useCTA } from '~client/hooks';
import { partialModification } from '~client/modules/data';
import { getCategories, getSubcategories } from '~client/selectors';
import { Button, FlexColumn, H5 } from '~client/styled/shared';
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
  const [upperLimit, setUpperLimit] = useState<number | undefined>();
  const [lowerLimit, setlowerLimit] = useState<number | undefined>();

  const sync = usePlanningDispatch();

  const onAdd = useCallback(() => {
    if (!(subcategoryId && account)) {
      return;
    }

    sync((last) => ({
      ...last,
      accounts: last.accounts.some((compare) => compare.netWorthSubcategoryId === subcategoryId)
        ? last.accounts
        : [
            ...last.accounts,
            {
              account,
              netWorthSubcategoryId: subcategoryId,
              upperLimit,
              lowerLimit,
              income: [],
              creditCards: [],
              values: [],
              computedValues: [],
            },
          ],
    }));
  }, [sync, subcategoryId, account, upperLimit, lowerLimit]);

  if (!options.length) {
    return null;
  }

  return (
    <SidebarSection title="Add account">
      <StyledForm.ModifyAccountForm>
        <StyledForm.ModifyAccountFormRow>
          <StyledForm.ModifyAccountFormLabel>Account:</StyledForm.ModifyAccountFormLabel>
          <StyledForm.ModifyAccountFormInput>
            <FormFieldSelect options={options} value={subcategoryId} onChange={setSubcategoryId} />
          </StyledForm.ModifyAccountFormInput>
        </StyledForm.ModifyAccountFormRow>
        <StyledForm.ModifyAccountFormRow>
          <StyledForm.ModifyAccountFormLabel>Name:</StyledForm.ModifyAccountFormLabel>
          <StyledForm.ModifyAccountFormInput>
            <FormFieldText value={account} onChange={setAccount} />
          </StyledForm.ModifyAccountFormInput>
        </StyledForm.ModifyAccountFormRow>
        <StyledForm.ModifyAccountFormRow>
          <StyledForm.ModifyAccountFormLabel>
            <Button onClick={onAdd}>+</Button>
          </StyledForm.ModifyAccountFormLabel>
        </StyledForm.ModifyAccountFormRow>
        <StyledForm.ModifyAccountFormRow>
          <StyledForm.ModifyAccountFormLabel>Lower limit</StyledForm.ModifyAccountFormLabel>
          <StyledForm.ModifyAccountFormInput>
            <FormFieldCostInline value={lowerLimit} onChange={setlowerLimit} />
          </StyledForm.ModifyAccountFormInput>
        </StyledForm.ModifyAccountFormRow>
        <StyledForm.ModifyAccountFormRow>
          <StyledForm.ModifyAccountFormLabel>Upper limit</StyledForm.ModifyAccountFormLabel>
          <StyledForm.ModifyAccountFormInput>
            <FormFieldCostInline value={upperLimit} onChange={setUpperLimit} />
          </StyledForm.ModifyAccountFormInput>
        </StyledForm.ModifyAccountFormRow>
      </StyledForm.ModifyAccountForm>
    </SidebarSection>
  );
};

type PropsAccountEditForm = {
  account: GQL<PlanningAccount>;
};

const ensureSingleIncludeBillsAccount =
  (nextAccount: GQL<PlanningAccountInput>) =>
  (accounts: State['accounts']): State['accounts'] =>
    nextAccount.includeBills
      ? accounts.map((sibling) =>
          sibling.netWorthSubcategoryId === nextAccount.netWorthSubcategoryId ||
          !sibling.includeBills
            ? sibling
            : { ...sibling, includeBills: false },
        )
      : accounts;

const upsertAccountDelta =
  (accountId: number, nextAccount: GQL<PlanningAccountInput>) =>
  (accounts: State['accounts']): State['accounts'] =>
    partialModification(
      accounts,
      accounts.findIndex((compare) => compare.id === accountId),
      optionalDeep(nextAccount, 'id'),
    );

const AccountEditForm: React.FC<PropsAccountEditForm> = ({ account }) => {
  const sync = usePlanningDispatch();
  const [tempAccount, setTempAccount] = useState<Account>(account);
  useEffect(() => {
    setTempAccount(account);
  }, [account]);

  const onSave = useCallback(
    (nextAccount: GQL<PlanningAccountInput>) => {
      sync((last) => ({
        ...last,
        accounts: compose(
          upsertAccountDelta(account.id, nextAccount),
          ensureSingleIncludeBillsAccount(nextAccount),
        )(last.accounts),
      }));
    },
    [sync, account.id],
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

  const setName = useCallback(
    (name: string) => setTempAccount((prevAccount) => ({ ...prevAccount, account: name })),
    [setTempAccount],
  );
  const setUpperLimit = useCallback(
    (upperLimit: number | undefined) =>
      setTempAccount((prevAccount) => ({ ...prevAccount, upperLimit: upperLimit || null })),
    [setTempAccount],
  );
  const setLowerLimit = useCallback(
    (lowerLimit: number | undefined) =>
      setTempAccount((prevAccount) => ({ ...prevAccount, lowerLimit: lowerLimit || null })),
    [setTempAccount],
  );
  const onToggleIncludeBills = useCallback(() => {
    setTempAccount((prevAccount) => ({ ...prevAccount, includeBills: !prevAccount.includeBills }));
  }, []);

  return (
    <Styled.AccountEditForm>
      <FlexColumn>
        <H5>Edit account #{account.id}</H5>
        <StyledForm.ModifyAccountFormRow>
          <StyledForm.ModifyAccountFormLabel>Name</StyledForm.ModifyAccountFormLabel>
          <StyledForm.ModifyAccountFormInput>
            <FormFieldText value={tempAccount.account} onChange={setName} />
          </StyledForm.ModifyAccountFormInput>
        </StyledForm.ModifyAccountFormRow>
        <StyledForm.ModifyAccountFormRow>
          <StyledForm.ModifyAccountFormLabel>Lower limit</StyledForm.ModifyAccountFormLabel>
          <StyledForm.ModifyAccountFormInput>
            <FormFieldCostInline
              value={tempAccount.lowerLimit ?? undefined}
              onChange={setLowerLimit}
            />
          </StyledForm.ModifyAccountFormInput>
        </StyledForm.ModifyAccountFormRow>
        <StyledForm.ModifyAccountFormRow>
          <StyledForm.ModifyAccountFormLabel>Upper limit</StyledForm.ModifyAccountFormLabel>
          <StyledForm.ModifyAccountFormInput>
            <FormFieldCostInline
              value={tempAccount.upperLimit ?? undefined}
              onChange={setUpperLimit}
            />
          </StyledForm.ModifyAccountFormInput>
        </StyledForm.ModifyAccountFormRow>
        <StyledForm.ModifyAccountFormRow>
          <StyledForm.ModifyAccountFormLabel>Include bills</StyledForm.ModifyAccountFormLabel>
          <StyledForm.ModifyAccountFormInput>
            <FormFieldTickbox value={!!tempAccount.includeBills} onChange={onToggleIncludeBills} />
          </StyledForm.ModifyAccountFormInput>
        </StyledForm.ModifyAccountFormRow>
      </FlexColumn>
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
  account: GQL<PlanningAccount>;
};

export const ModifyAccount: React.FC<PropsModifyAccount> = ({ account }) => (
  <SidebarSection title={`[Account] ${account.account}`}>
    <AccountEditForm account={account} />
  </SidebarSection>
);
