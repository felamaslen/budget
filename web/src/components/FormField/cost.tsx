import React from 'react';

import { Wrapper, WrapperProps } from '.';
import { setValueInline } from './number';
import { useField, Split } from '~client/hooks/field';

const setValue = (cost: string): number =>
  Math.round(Number((100 * (Number(cost) || 0)).toPrecision(10)));

const getInputValueFromFieldValue = (value = 0): string => String(value / 100);
const setValueString = setValueInline(setValue, getInputValueFromFieldValue);

function setValueNumber(inputValue: string): Split<number> {
  const fieldValue = setValue(inputValue);

  return { __split: true, fieldValue, inputValue: getInputValueFromFieldValue(fieldValue) };
}

function getInitialInputValue(value: number | undefined): string {
  if (typeof value !== 'number') {
    return '';
  }

  return String(value / 100);
}

type Props = WrapperProps<number | undefined> & {
  onChange: (value?: number) => void;
  label?: string;
  inline?: boolean;
};

const FormFieldCost: React.FC<Props> = ({ label = null, value, invalid = false, ...props }) => {
  const [, inputValue, onChange, ref, onBlur] = useField<number | undefined>({
    ...props,
    value,
    getInitialInputValue,
    setValue: props.inline ? setValueString : setValueNumber,
  });

  const inputProps = props.inline ? { type: 'text' } : { type: 'number', step: 0.01 };

  return (
    <Wrapper item="cost" value={value} active={props.active} invalid={invalid} small={props.small}>
      <input
        ref={ref}
        aria-label={label || undefined}
        {...inputProps}
        value={inputValue}
        onChange={onChange}
        onBlur={onBlur}
      />
    </Wrapper>
  );
};

export default FormFieldCost;
