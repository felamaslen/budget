import { useCallback, useState } from 'react';

import { OnChangeCreditCard, useEditMode, useEnterKeyDown } from './form/hooks';
import * as Styled from './styles';
import { AccountCreditCardPayment } from './types';

import { FormFieldCostInline } from '~client/components/form-field';
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
  const [tempValue, setTempValue] = useState<number | undefined>(creditCard.value);

  const onFinishEditing = useCallback(() => {
    onChangeValue(netWorthSubcategoryId, { ...creditCard, value: tempValue });
    onCancelEdit();
  }, [netWorthSubcategoryId, creditCard, onCancelEdit, onChangeValue, tempValue]);

  const onKeyDown = useEnterKeyDown(onFinishEditing);

  return (
    <Styled.AccountGroup isVerified={creditCard.isVerified} onClick={onEdit}>
      <Styled.AccountGroupItem>{creditCard.name}</Styled.AccountGroupItem>
      <Styled.AccountGroupValue>
        {isEditing ? (
          <FormFieldCostInline
            value={creditCard.value}
            onChange={onFinishEditing}
            onType={setTempValue}
            inputProps={{ onKeyDown }}
          />
        ) : (
          <ButtonUnStyled>
            {typeof creditCard.value === 'undefined'
              ? ''
              : formatCurrency(creditCard.value, { brackets: true })}
          </ButtonUnStyled>
        )}
      </Styled.AccountGroupValue>
    </Styled.AccountGroup>
  );
};
