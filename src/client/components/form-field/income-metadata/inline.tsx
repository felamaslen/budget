import { FormFieldCostInline } from '../cost';
import { useModalFocus } from '../metadata/hooks';
import * as StyledCommon from '../metadata/styles';
import { Wrapper, WrapperProps } from '../shared';
import { FormFieldTextInline } from '../text';

import * as Styled from './styles';
import { IncomeDeductionNative, PropsFormFieldIncomeDeduction } from './types';
import { useDeductionsField, useSingleDeductionField } from './use-deductions-field';
import { getComponentKey } from './utils';

import { ButtonAdd, ButtonDelete } from '~client/styled/shared';

export type PropsComposite = WrapperProps & {
  value: IncomeDeductionNative[];
  onChange: (value: IncomeDeductionNative[] | undefined) => void;
};

const emptyComposite: IncomeDeductionNative[] = [];

const FormFieldIncomeDeductionInline: React.FC<PropsFormFieldIncomeDeduction> = ({
  children,
  create = false,
  ...props
}) => {
  const {
    item: { name, value },
  } = props;
  const { onChangeName, onChangeValue } = useSingleDeductionField(props.onChange, props.index);

  return (
    <StyledCommon.ComponentListItem
      data-testid={create ? 'income-deduction-create-input' : 'income-deduction-edit-input'}
    >
      <Styled.DeductionRowName>
        <FormFieldTextInline value={name} onChange={onChangeName} />
      </Styled.DeductionRowName>
      <Styled.DeductionRowValue>
        <FormFieldCostInline value={value} onChange={onChangeValue} />
      </Styled.DeductionRowValue>
      {children}
    </StyledCommon.ComponentListItem>
  );
};

export const FormFieldIncomeMetadata: React.FC<PropsComposite> = ({
  value = emptyComposite,
  onChange,
  ...props
}) => {
  const { ref, focused, toggleEvents, onBlurModal } = useModalFocus(props.active);
  const { items, newItem, onChangeAddField, onCreate, onUpdate, onDelete } = useDeductionsField({
    ...props,
    value,
    onChange,
  });

  return (
    <Wrapper item="deductions">
      <StyledCommon.InactiveToggleIndicator active={props.active} {...toggleEvents}>
        {value.length}
      </StyledCommon.InactiveToggleIndicator>
      {focused && (
        <StyledCommon.ComponentModal ref={ref} onBlur={onBlurModal}>
          <StyledCommon.ModalInner>
            <StyledCommon.ModalHead>
              <Styled.ModalHeadDeductionName>Name</Styled.ModalHeadDeductionName>
              <Styled.ModalHeadDeductionValue>Value</Styled.ModalHeadDeductionValue>
            </StyledCommon.ModalHead>
            <StyledCommon.ComponentList>
              <FormFieldIncomeDeductionInline item={newItem} onChange={onChangeAddField} create>
                <StyledCommon.ComponentRowButton>
                  <ButtonAdd onClick={onCreate}>+</ButtonAdd>
                </StyledCommon.ComponentRowButton>
              </FormFieldIncomeDeductionInline>
              {items.map((item, index) => (
                <FormFieldIncomeDeductionInline
                  key={getComponentKey(item, index)}
                  index={index}
                  item={item}
                  onChange={onUpdate}
                >
                  <span>
                    <ButtonDelete onClick={(): void => onDelete(index)}>&minus;</ButtonDelete>
                  </span>
                </FormFieldIncomeDeductionInline>
              ))}
            </StyledCommon.ComponentList>
          </StyledCommon.ModalInner>
        </StyledCommon.ComponentModal>
      )}
    </Wrapper>
  );
};
