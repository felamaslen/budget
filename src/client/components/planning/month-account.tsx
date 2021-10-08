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
  numRows: number;
} & Pick<
  AccountGroupItemProps,
  'onAddTransaction' | 'onChangeTransaction' | 'onRemoveTransaction'
> & {
    onChangeCreditCard: OnChangeCreditCard;
  };

export const MonthAccount: React.FC<Props> = ({
  account,
  numRows,
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
  const numBlankRows = Math.max(0, numRows - (creditCards.length + transactions.length + 1));

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
          key={transaction.key}
          accountGroup={accountGroup}
          transaction={transaction}
          onAddTransaction={onAddTransaction}
          onChangeTransaction={onChangeTransaction}
          onRemoveTransaction={onRemoveTransaction}
        />
      ))}
      {Array(numBlankRows)
        .fill(0)
        .map((_, index) => (
          <Styled.AccountGroup key={`blank-row-${index}`}>
            <Styled.AccountGroupItem />
            <Styled.AccountGroupValue />
          </Styled.AccountGroup>
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
