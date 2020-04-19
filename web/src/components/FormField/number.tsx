import React from 'react';

import { Wrapper, WrapperProps } from '.';
import { useField, Split } from '~client/hooks/field';

export const setValueInline = (
  setValue: (inputValue: string) => number = Number,
  getInputValueFromFieldValue: (fieldValue?: number) => string = String,
) => (inputValue: string): Split<number> => {
  if (inputValue === '.') {
    return { __split: true, fieldValue: 0, inputValue: '.' };
  }
  if (Number.isNaN(Number(inputValue))) {
    throw new Error('Invalid value');
  }

  const fieldValue = setValue(inputValue);

  if (inputValue.match('.')) {
    return { __split: true, fieldValue, inputValue };
  }

  return { __split: true, fieldValue, inputValue: getInputValueFromFieldValue(fieldValue) };
};

type Props = WrapperProps<number | undefined> & {
  onChange: (value?: number) => void;
  type?: 'number' | 'range';
  active?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

const FormFieldNumber: React.FC<Props> = ({
  value,
  type = 'number',
  disabled = false,
  min,
  max,
  step,
  ...props
}) => {
  const [currentValue, , onChange, ref, onBlur] = useField<number | undefined>({
    ...props,
    value,
    setValue: Number,
  });

  return (
    <Wrapper item="number" value={value} active={props.active} {...props}>
      <input
        ref={ref}
        type={type}
        value={currentValue}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
      />
    </Wrapper>
  );
};

export default FormFieldNumber;
