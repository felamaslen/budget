import React from 'react';

import { makeInlineField } from './shared';
import { Split } from '~client/hooks';

export const setValueInline = (
  setValue: (inputValue: string) => number = Number,
  getInputValueFromFieldValue: (fieldValue?: number) => string = String,
) => (
  { target: { value: inputValue } }: React.ChangeEvent<HTMLInputElement>,
  allowEmpty?: boolean,
): Split<number | undefined> => {
  if ((allowEmpty && !inputValue) || /^-?\.$/.test(inputValue)) {
    return { __split: true, fieldValue: 0, inputValue };
  }
  if (/^-?$/.test(inputValue)) {
    return { __split: true, fieldValue: undefined, inputValue };
  }
  if (Number.isNaN(Number(inputValue))) {
    throw new Error('Invalid value');
  }

  const fieldValue = setValue(inputValue);

  if (/\./.test(inputValue)) {
    return { __split: true, fieldValue, inputValue };
  }

  return { __split: true, fieldValue, inputValue: getInputValueFromFieldValue(fieldValue) };
};

const { Field, FieldInline } = makeInlineField<number>({
  hookOptions: {
    convertExternalToInputValue: String,
    convertInputToExternalValue: ({ target: { value } }): number => Number(value),
  },
  hookOptionsInline: {
    convertExternalToInputValue: (value: number | undefined): string => String(value ?? ''),
    convertInputToExternalValue: setValueInline(),
  },
  inputProps: {
    type: 'number',
  },
});

export { Field as FormFieldNumber };
export { FieldInline as FormFieldNumberInline };
