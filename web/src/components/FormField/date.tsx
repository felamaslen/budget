import React from 'react';
import parseISO from 'date-fns/parseISO';
import setYear from 'date-fns/setYear';
import setMonth from 'date-fns/setMonth';
import setDate from 'date-fns/setDate';
import getYear from 'date-fns/getYear';
import getMonth from 'date-fns/getMonth';
import getDate from 'date-fns/getDate';
import startOfDay from 'date-fns/startOfDay';
import isValid from 'date-fns/isValid';
import format from 'date-fns/format';

import { Wrapper } from '~client/components/FormField';
import { useField } from '~client/hooks/field';

const setValueDate: (value: string) => Date = parseISO;

const parseYear = (year: string): number =>
  year && year.length <= 2 ? 2000 + Number(year) : Number(year);

function setValueString(value: string): Date {
  const shortMatch = value.match(/^(\d{1,2})(\/(\d{1,2})(\/(\d{2,4}))?)?$/);
  if (!shortMatch) {
    throw new Error('Not a valid date');
  }

  const [, day, , month, , year] = shortMatch;

  const now = startOfDay(new Date());

  const result = setYear(
    setMonth(setDate(now, Number(day) || getDate(now)), Number(month) - 1 || getMonth(now)),
    parseYear(year) || getYear(now),
  );

  return isValid(result) ? result : now;
}

type Props = {
  onChange: () => void;
  inline?: boolean;
  label?: string | null;
  value?: Date;
  active?: boolean;
  invalid?: boolean;
};

const FormFieldDate: React.FC<Props> = ({
  label = null,
  invalid = false,
  value = new Date(),
  ...props
}) => {
  const setValue = props.inline ? setValueString : setValueDate;
  const type = props.inline ? 'text' : 'date';

  const [, , onChange, ref, onBlur] = useField({
    ...props,
    value,
    setValue,
  });

  const defaultValue = format(value, props.inline ? 'dd/MM/yyyy' : 'yyyy-MM-dd');

  return (
    <Wrapper<Date> item="date" value={value} active={props.active} invalid={invalid}>
      <input
        ref={ref}
        aria-label={label || undefined}
        type={type}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
      />
    </Wrapper>
  );
};

export default FormFieldDate;
