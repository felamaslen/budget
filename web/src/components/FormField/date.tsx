import format from 'date-fns/format';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import parseISO from 'date-fns/parseISO';
import setDate from 'date-fns/setDate';
import setMonth from 'date-fns/setMonth';
import setYear from 'date-fns/setYear';
import startOfDay from 'date-fns/startOfDay';

import { makeInlineField } from './shared';
import { Split } from '~client/hooks/field';

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

  return setYear(
    setMonth(setDate(now, Number(day)), Number(month) - 1 || getMonth(now)),
    parseYear(year) || getYear(now),
  );
}

const setValueString = ({
  target: { value },
}: React.ChangeEvent<HTMLInputElement>): Split<Date | undefined> => ({
  __split: true,
  fieldValue: parseDate(value),
  inputValue: value,
});

const toISO = (value: Date): string => format(value, 'yyyy-MM-dd');
const toLocal = (value: Date | undefined): string => format(value ?? new Date(), 'dd/MM/yyyy');

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
