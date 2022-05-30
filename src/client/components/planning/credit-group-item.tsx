import { useCallback, useState } from 'react';

import { AccountGroupItemWrapper } from './account-group-item';
import { OnChangeCreditCard, useEditMode, useEnterKeyDown } from './form/hooks';
import { AccountCreditCardPayment } from './types';

import { FormFieldTextInline } from '~client/components/form-field';
import { formatCurrency } from '~client/modules/format';
import { ButtonUnStyled } from '~client/styled/shared/reset';

export type Props = {
  netWorthSubcategoryId: number;
  creditCard: AccountCreditCardPayment;
  onChangeValue: OnChangeCreditCard;
};

export const CreditGroupItem: React.FC<Props> = ({
  netWorthSubcategoryId,
  creditCard,
  onChangeValue,
}) => {
  const [isEditing, onEdit, onCancelEdit] = useEditMode();
  const [rawValue, setRawValue] = useState<string | undefined>(
    ((creditCard.value ?? 0) / 100).toFixed(2),
  );

  const onUpdate = useCallback(() => {
    const parsedValue = Math.round((Number(rawValue) || 0) * 100);
    if (!rawValue?.length) {
      onChangeValue(netWorthSubcategoryId, { ...creditCard, value: undefined });
    } else if (!Number.isNaN(parsedValue)) {
      onChangeValue(netWorthSubcategoryId, { ...creditCard, value: parsedValue });
    }
    setTimeout(onCancelEdit, 0);
  }, [creditCard, netWorthSubcategoryId, onCancelEdit, onChangeValue, rawValue]);

  const onKeyDown = useEnterKeyDown(onUpdate);

  return (
    <AccountGroupItemWrapper
      transaction={creditCard}
      onClick={onEdit}
      onSave={isEditing ? onUpdate : undefined}
      name={creditCard.name}
    >
      {isEditing ? (
        <FormFieldTextInline
          value={rawValue}
          onChange={setRawValue}
          onType={setRawValue}
          inputProps={{ onKeyDown }}
        />
      ) : (
        <ButtonUnStyled>
          {typeof creditCard.value === 'undefined'
            ? ''
            : formatCurrency(creditCard.value, { brackets: true })}
        </ButtonUnStyled>
      )}
    </AccountGroupItemWrapper>
  );
};
