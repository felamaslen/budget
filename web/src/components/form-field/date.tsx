import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import parseISO from 'date-fns/parseISO';
import startOfDay from 'date-fns/startOfDay';

import { makeInlineField } from './shared';
import { Split } from '~client/hooks';
import { toISO, toLocal } from '~client/modules/format';

const setValueDate: (event: React.ChangeEvent<HTMLInputElement>) => Date = (event): Date =>
  event.target.value ? parseISO(event.target.value ?? '') : new Date();

const parseYear = (year: string): number =>
  year && year.length <= 2 ? 2000 + Number(year) : Number(year);

function parseDate(value: string): Date | undefined {
  const shortMatch = value.match(/^((\d{1,2})\/?)((\d{1,2})\/?((\d{2,4})\/?)?)?$/);
  if (!shortMatch) {
    return undefined;
  }

  const [, , day, , month, , year] = shortMatch;
  const now = startOfDay(new Date());

  return new Date(
    parseYear(year) || getYear(now),
    month ? Number(month) - 1 : getMonth(now),
    Number(day),
  );
}

const setValueString = ({
  target: { value },
}: React.ChangeEvent<HTMLInputElement>): Split<Date | undefined> => ({
  __split: true,
  fieldValue: parseDate(value),
  inputValue: value,
});

const { Field, FieldInline } = makeInlineField<Date>({
  hookOptions: {
    convertExternalToInputValue: toISO,
    convertInputToExternalValue: setValueDate,
    immediate: true,
  },
  hookOptionsInline: {
    convertExternalToInputValue: toLocal,
    convertInputToExternalValue: setValueString,
  },
  inputProps: {
    type: 'date',
  },
});

export { Field as FormFieldDate };
export { FieldInline as FormFieldDateInline };
