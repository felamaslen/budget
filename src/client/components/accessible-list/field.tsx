import { useMemo } from 'react';

import { FieldComponent } from '~client/components/form-field';

type PropsField<V, E extends Record<string, unknown>> = {
  Field: FieldComponent<V, E>;
  field: string | number | symbol;
  value: V;
  onChange: (value: V) => void;
  onType?: (value: V) => void;
  active?: boolean;
  onFocus?: () => void;
  allowEmpty?: boolean;
  extraProps?: Partial<E>;
};

export function AccessibleListItemField<V = never, E extends Record<string, unknown> = never>({
  Field,
  field,
  value,
  onChange,
  active = false,
  allowEmpty = false,
  onFocus,
  onType,
  extraProps,
}: PropsField<V, E>): React.ReactElement<PropsField<V, E>> {
  const inputProps = useMemo(() => ({ onFocus }), [onFocus]);
  return (
    <Field
      item={field as string}
      value={value}
      onChange={onChange}
      onType={onType}
      active={active}
      allowEmpty={allowEmpty}
      inputProps={inputProps}
      extraProps={extraProps}
    />
  );
}
