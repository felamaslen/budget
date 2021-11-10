import { setValueInline } from './number';
import { makeInlineField } from './shared';
import { SYMBOL_CURRENCY_RAW } from '~client/constants';
import { Split } from '~client/hooks';

const setValueRaw = (cost: string | undefined): number =>
  Math.round(Number((100 * (Number(cost) ?? 0)).toPrecision(10)));

const getInputValueFromFieldValue = (value = 0): string => String(value / 100);
const setValueString = setValueInline(setValueRaw, getInputValueFromFieldValue);

function setValueNumber({
  target: { value: inputValue },
}: React.ChangeEvent<HTMLInputElement>): Split<number> {
  const fieldValue = setValueRaw(inputValue);

  return { __split: true, fieldValue, inputValue: getInputValueFromFieldValue(fieldValue) };
}

const toPounds = (value: number, active = false): string =>
  active ? String(value / 100) : (value / 100).toFixed(2);

const { Field, FieldInline } = makeInlineField<number>({
  hookOptions: {
    convertExternalToInputValue: toPounds,
    convertInputToExternalValue: setValueNumber,
  },
  hookOptionsInline: {
    convertExternalToInputValue: (value: number | undefined, active = false): string =>
      typeof value === 'undefined' ? '' : toPounds(value, active),
    convertInputToExternalValue: setValueString,
  },
  inputProps: {
    type: 'number',
    step: 0.01,
  },
  Children: <span>{SYMBOL_CURRENCY_RAW}</span>,
});

export { Field as FormFieldCost };
export { FieldInline as FormFieldCostInline };
