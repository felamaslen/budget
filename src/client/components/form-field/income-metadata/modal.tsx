import { useMemo } from 'react';
import shortid from 'shortid';

import { FormFieldCost } from '../cost';
import * as StyledCommon from '../metadata/styles';
import { Wrapper } from '../shared';
import { FormFieldText } from '../text';

import * as Styled from './styles';
import type {
  IncomeDeductionNative,
  PropsFormFieldIncomeDeduction,
  PropsFormFieldModalIncomeDeductions,
} from './types';
import { useDeductionsField, useSingleDeductionField } from './use-deductions-field';
import { getComponentKey } from './utils';

import { ButtonAdd, ButtonDelete } from '~client/styled/shared';

const FormFieldIncomeDeduction: React.FC<PropsFormFieldIncomeDeduction> = ({
  children,
  create = false,
  ...props
}) => {
  const {
    item: { name, value },
  } = props;
  const { onChangeName, onChangeValue } = useSingleDeductionField(props.onChange, props.index);

  const id = useMemo(() => shortid.generate(), []);

  return (
    <StyledCommon.ComponentListItem
      data-testid={create ? 'income-deduction-create-input' : 'income-deduction-edit-input'}
    >
      <StyledCommon.ComponentFields>
        <Styled.DeductionRowName>
          <Styled.DeductionLabel>
            <label htmlFor={`name-${id}`}>Name:</label>
          </Styled.DeductionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldText id={`name-${id}`} value={name} onChange={onChangeName} />
          </StyledCommon.ComponentCol>
        </Styled.DeductionRowName>
        <Styled.DeductionRowValue>
          <Styled.DeductionLabel>
            <label htmlFor={`value-${id}`}>Value:</label>
          </Styled.DeductionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldCost id={`value-${id}`} value={value} onChange={onChangeValue} />
          </StyledCommon.ComponentCol>
        </Styled.DeductionRowValue>
      </StyledCommon.ComponentFields>
      {children}
    </StyledCommon.ComponentListItem>
  );
};

const emptyValue: IncomeDeductionNative[] = [];

export const FormFieldIncomeDeductions: React.FC<PropsFormFieldModalIncomeDeductions> = ({
  invalid,
  ...props
}) => {
  const { items, newItem, onChangeAddField, onCreate, onUpdate, onDelete } = useDeductionsField({
    ...props,
    value: props.value ?? emptyValue,
  });

  return (
    <Wrapper item="deductions" invalid={invalid}>
      <StyledCommon.ComponentList>
        <FormFieldIncomeDeduction item={newItem} onChange={onChangeAddField} create>
          <StyledCommon.ComponentRowButton>
            <ButtonAdd onClick={onCreate}>+</ButtonAdd>
          </StyledCommon.ComponentRowButton>
        </FormFieldIncomeDeduction>
        {items.map((item, index) => (
          <FormFieldIncomeDeduction
            key={getComponentKey(item, index)}
            item={item}
            index={index}
            onChange={onUpdate}
          >
            <StyledCommon.ComponentRowButton>
              <ButtonDelete onClick={(): void => onDelete(index)}>&minus;</ButtonDelete>
            </StyledCommon.ComponentRowButton>
          </FormFieldIncomeDeduction>
        ))}
      </StyledCommon.ComponentList>
    </Wrapper>
  );
};
