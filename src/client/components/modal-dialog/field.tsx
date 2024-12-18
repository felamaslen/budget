import { useCallback, useState } from 'react';

import * as Styled from './styles';
import type { FieldWrapper } from './types';
import type { FieldComponent } from '~client/components/form-field';

export function makeField<V = never>(
  field: string,
  Field: FieldComponent<V>,
  label = field,
  isToggled = false,
): FieldWrapper<V> {
  const WrappedField: FieldWrapper<V> = ({ id, invalid, value, onChange }) => {
    const [expanded, setExpanded] = useState<boolean>(!isToggled);
    return (
      <>
        <Styled.FormLabelRow>
          <Styled.FormLabel item={field as string}>
            <label htmlFor={id}>{label}</label>
          </Styled.FormLabel>
          {isToggled && (
            <Styled.ToggleButton onClick={(): void => setExpanded((last) => !last)}>
              {expanded ? <>&minus;</> : '+'}
            </Styled.ToggleButton>
          )}
        </Styled.FormLabelRow>
        {expanded && <Field invalid={invalid} value={value} onChange={onChange} />}
      </>
    );
  };

  return WrappedField;
}

type PropsModalField<V> = {
  id: string;
  Field?: FieldWrapper<Exclude<V, null | undefined>>;
  field: string | number | symbol;
  value: V;
  onChange: (field: string, value: V) => void;
  invalid: boolean;
};

export function ModalDialogField<V = never>({
  id,
  Field,
  field,
  value,
  onChange,
  invalid,
}: PropsModalField<V>): React.ReactElement | null {
  const onChangeCallback = useCallback(
    (newValue: V) => onChange(field as string, newValue),
    [onChange, field],
  );

  if (!Field) {
    return null;
  }

  return (
    <Styled.FormRow field={field as string}>
      <Field
        id={id}
        value={value as Exclude<V, null | undefined>}
        onChange={onChangeCallback}
        invalid={invalid}
      />
    </Styled.FormRow>
  );
}
