import React, { useCallback } from 'react';

import { AccountGroupItem, Props as AccountGroupItemProps } from './account-group-item';
import { CreditGroupItem } from './credit-group-item';
import { OnChangeCreditCard, useTransactionFormElements } from './form/hooks';
import * as Styled from './styles';
import type { AccountTransaction, PlanningData } from './types';

import { CREATE_ID } from '~client/constants/data';
import { ButtonAdd } from '~client/styled/shared';

export type Props = {
  account: PlanningData['accounts'][0];
} & Pick<
  AccountGroupItemProps,
  'onAddTransaction' | 'onChangeTransaction' | 'onRemoveTransaction'
> & {
    onChangeCreditCard: OnChangeCreditCard;
  };

export const MonthAccount: React.FC<Props> = ({
  account,
  onAddTransaction,
  onChangeTransaction,
  onRemoveTransaction,
  onChangeCreditCard,
}) => {
  const { accountGroup, creditCards, transactions } = account;

  const onAddTransactionCallback = useCallback(
    (delta: Pick<AccountTransaction, 'name' | 'value' | 'formula'>): void => {
      onAddTransaction(accountGroup.netWorthSubcategoryId, delta);
    },
    [onAddTransaction, accountGroup.netWorthSubcategoryId],
  );

  const addElements = useTransactionFormElements(onAddTransactionCallback);

  return (
    <Styled.AccountGroupWrapper key={accountGroup.account}>
      {creditCards.map((creditCard) => (
        <CreditGroupItem
          key={`cc-${creditCard.netWorthSubcategoryId}`}
          netWorthSubcategoryId={accountGroup.netWorthSubcategoryId}
          creditCard={creditCard}
          onChangeValue={onChangeCreditCard}
        />
      ))}
      {transactions.map((transaction) => (
        <AccountGroupItem
          key={`transaction-${transaction.id}`}
          accountGroup={accountGroup}
          transaction={transaction}
          onAddTransaction={onAddTransaction}
          onChangeTransaction={onChangeTransaction}
          onRemoveTransaction={onRemoveTransaction}
        />
      ))}
      <Styled.AccountGroup key={CREATE_ID}>
        <Styled.AccountGroupItem>
          {addElements.name}
          <ButtonAdd size={16} onClick={addElements.onUpdate}>
            +
          </ButtonAdd>
        </Styled.AccountGroupItem>
        <Styled.AccountGroupValue>{addElements.value}</Styled.AccountGroupValue>
      </Styled.AccountGroup>
    </Styled.AccountGroupWrapper>
  );
};
