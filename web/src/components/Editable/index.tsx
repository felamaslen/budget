import React, { useState, useCallback, useEffect } from 'react';
import { DateTime } from 'luxon';

import { PickUnion } from '~client/types';
import { LegacyTransaction as Transaction } from '~client/types/funds';
import { PAGES, PAGES_SUGGESTIONS } from '~client/constants/data';
import SuggestionsList from '~client/components/SuggestionsList';
import FormFieldText from '~client/components/FormField';
import FormFieldDate from '~client/components/FormField/date';
import FormFieldCost from '~client/components/FormField/cost';
import FormFieldTransactions from '~client/components/FormField/transactions';
import * as Styled from './styles';

type DateValue = Date | DateTime;
type Value = DateValue | Transaction[] | number | string | undefined | null;

type OnChange = (item: string, value?: Value) => void;

type FieldProps = {
  id: string;
  item: string;
  active: boolean;
  value?: Value;
  onChange?: OnChange;
  onType: (value: string) => void;
};

const isDate = (value: Value): value is DateValue =>
  typeof value === 'undefined' || value instanceof Date || value instanceof DateTime;

const isTransactions = (value: Value): value is Transaction[] =>
  value === null || Array.isArray(value);

const isNumber = (value?: Value): value is number =>
  typeof value === 'undefined' || typeof value === 'number';

const EditableField: React.FC<FieldProps> = ({ id, item, value, onChange, ...rest }) => {
  const onChangeCallback = useCallback(
    (newValue): void => {
      if (onChange) {
        onChange(item, newValue);
      }
    },
    [onChange, item],
  );

  const props = { ...rest, onChange: onChangeCallback };

  if (item === 'date' && isDate(value)) {
    return <FormFieldDate inline label={`date-input-${id}`} value={value} {...props} />;
  }
  if (item === 'cost' && isNumber(value)) {
    return <FormFieldCost inline label={`cost-input-${id}`} value={value} {...props} />;
  }
  if (item === 'transactions' && isTransactions(value)) {
    return <FormFieldTransactions create value={value} {...props} />;
  }

  return (
    <FormFieldText
      inline
      label={`${item}-input-${id}`}
      value={value ? String(value) : ''}
      {...props}
    />
  );
};

type Props = PickUnion<FieldProps, 'item' | 'value' | 'onChange'> & {
  page: string;
  id?: string;
  active?: boolean;
  onSuggestion?: () => void;
};

const Editable: React.FC<Props> = ({
  page,
  id = '',
  active = false,
  value,
  item,
  onSuggestion,
  ...props
}) => {
  const [typed, onType] = useState<string>('');
  useEffect(() => {
    if (!active) {
      onType('');
    }
  }, [active]);

  const showSuggestions = Boolean(
    active &&
      typed.length &&
      PAGES_SUGGESTIONS.includes(page) &&
      PAGES[page].suggestions?.includes(item),
  );

  return (
    <Styled.Editable active={active} item={item}>
      <EditableField id={id} active={active} item={item} value={value} onType={onType} {...props} />
      {showSuggestions && (
        <SuggestionsList page={page} column={item} search={typed} onConfirm={onSuggestion} />
      )}
    </Styled.Editable>
  );
};

export default Editable;
