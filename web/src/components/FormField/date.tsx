import React from 'react';
import parseISO from 'date-fns/parseISO';
import setYear from 'date-fns/setYear';
import setMonth from 'date-fns/setMonth';
import setDate from 'date-fns/setDate';
import getYear from 'date-fns/getYear';
import getMonth from 'date-fns/getMonth';
import startOfDay from 'date-fns/startOfDay';
import format from 'date-fns/format';

import { Wrapper, WrapperProps } from '~client/components/FormField';
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

  return setYear(
    setMonth(setDate(now, Number(day)), Number(month) - 1 || getMonth(now)),
    parseYear(year) || getYear(now),
  );
}

type Props = WrapperProps<Date> & {
  onChange: (value: Date) => void;
  inline?: boolean;
  label?: string | null;
  invalid?: boolean;
};

const FormFieldDate: React.FC<Props> = ({
  label = null,
  invalid = false,
  value: fieldValue,
  onChange,
  ...props
}) => {
  const setValue = props.inline ? setValueString : setValueDate;
  const type = props.inline ? 'text' : 'date';

  const value = React.useMemo<Date>(() => fieldValue ?? new Date(), [fieldValue]);

  const onChangeBackwardsCompatible = React.useCallback(
    (newValue: Date): void => {
      onChange(newValue);
    },
    [onChange],
  );

  const [, , onChangeInput, ref, onBlur] = useField({
    ...props,
    value,
    setValue,
    onChange: onChangeBackwardsCompatible,
  });

  const defaultValue = format(value, props.inline ? 'dd/MM/yyyy' : 'yyyy-MM-dd');

  return (
    <Wrapper<Date> item="date" value={value} active={props.active} invalid={invalid}>
      <input
        ref={ref}
        aria-label={label || undefined}
        type={type}
        defaultValue={defaultValue}
        onChange={onChangeInput}
        onBlur={onBlur}
      />
    </Wrapper>
  );
};

export default FormFieldDate;
