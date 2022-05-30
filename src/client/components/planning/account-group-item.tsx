import { useCallback, useEffect, useRef } from 'react';

import {
  OnAddTransaction,
  OnChangeTransaction,
  OnRemoveTransaction,
  useEditMode,
  useTransactionFormElements,
} from './form/hooks';
import * as Styled from './styles';
import type { AccountTransaction, PlanningData } from './types';

import { useCTA } from '~client/hooks';
import { VOID } from '~client/modules/data';
import { formatCurrency } from '~client/modules/format';
import { ButtonDelete } from '~client/styled/shared';

export type Props = {
  transaction: AccountTransaction;
  accountGroup: PlanningData['accounts'][0]['accountGroup'];
  onAddTransaction: OnAddTransaction;
  onChangeTransaction: OnChangeTransaction;
  onRemoveTransaction: OnRemoveTransaction;
};

type AccountGroupItemWrapperProps = {
  onClick?: () => void;
  onSave?: () => void;
  name: string | React.ReactElement;
  transaction: Pick<Props['transaction'], 'color' | 'isVerified'>;
};

export const AccountGroupItemWrapper: React.FC<AccountGroupItemWrapperProps> = ({
  children,
  onClick = VOID,
  onSave,
  name,
  transaction,
}) => {
  const onActivate = useCTA(onClick);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!onSave) {
      return undefined;
    }
    const onClickOutside = (e: TouchEvent): void => {
      if (!ref.current?.contains(e.target as Node | null)) {
        onSave();
      }
    };
    document.addEventListener('touchstart', onClickOutside);
    return (): void => document.removeEventListener('touchstart', onClickOutside);
  }, [onSave]);

  return (
    <Styled.AccountGroup ref={ref} isVerified={transaction.isVerified} {...onActivate}>
      <Styled.AccountGroupItem>{name}</Styled.AccountGroupItem>
      <Styled.AccountGroupValue color={transaction.color}>{children}</Styled.AccountGroupValue>
    </Styled.AccountGroup>
  );
};

type AccountGroupItemEditableProps = Props & {
  onCancelEdit: () => void;
};

const AccountGroupItemEditable: React.FC<AccountGroupItemEditableProps> = ({
  accountGroup,
  transaction,
  onCancelEdit,
  onChangeTransaction,
  onRemoveTransaction,
}) => {
  const onChange = useCallback(
    (delta: Pick<AccountTransaction, 'name' | 'value' | 'formula'>): void => {
      onChangeTransaction(accountGroup.netWorthSubcategoryId, transaction.name, delta);
      setTimeout(onCancelEdit, 0);
    },
    [accountGroup.netWorthSubcategoryId, onCancelEdit, transaction.name, onChangeTransaction],
  );

  const elements = useTransactionFormElements(onChange, transaction);

  return (
    <AccountGroupItemWrapper
      transaction={transaction}
      name={
        <>
          {elements.name}
          <ButtonDelete
            size={16}
            onClick={(): void =>
              onRemoveTransaction(accountGroup.netWorthSubcategoryId, transaction.name)
            }
          >
            &minus;
          </ButtonDelete>
        </>
      }
      onSave={elements.onUpdate}
    >
      {elements.value}
    </AccountGroupItemWrapper>
  );
};

export const AccountGroupItem: React.FC<Props> = (props) => {
  const [isEditing, onEdit, onCancelEdit] = useEditMode(!props.transaction.isComputed);

  if (isEditing) {
    return <AccountGroupItemEditable {...props} onCancelEdit={onCancelEdit} />;
  }

  return (
    <AccountGroupItemWrapper
      {...props}
      onClick={onEdit}
      name={<Styled.AccountGroupItemText>{props.transaction.name}</Styled.AccountGroupItemText>}
    >
      {typeof props.transaction.computedValue === 'undefined'
        ? ''
        : formatCurrency(props.transaction.computedValue, { brackets: true })}
    </AccountGroupItemWrapper>
  );
};
