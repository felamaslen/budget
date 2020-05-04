import React from 'react';

import { formatItem } from '~client/modules/format';
import { useField } from '~client/hooks/field';

import * as Styled from './styles';

export type WrapperProps<V = string> = React.PropsWithChildren<{
  item?: string;
  value?: V;
  active?: boolean;
  invalid?: boolean;
  small?: boolean;
}>;

export const Wrapper: <V = string>(
  props: WrapperProps<V>,
) => React.ReactElement<WrapperProps<V>> = ({
  item = '',
  value,
  active = true,
  invalid = false,
  small = false,
  children,
}) => (
  <Styled.FormField
    data-testid={`form-field-${item}`}
    item={item}
    active={active}
    invalid={invalid}
    small={small}
  >
    {active && children}
    {!active && formatItem(item, value)}
  </Styled.FormField>
);

type Props = {
  onChange: (value: string) => void;
  inline?: boolean;
  label?: string;
  item?: string;
  value?: string;
  active?: boolean;
  invalid?: boolean;
  small?: boolean;
};

const FormFieldText: React.FC<Props> = ({
  label = null,
  item = 'text',
  value = '',
  invalid = false,
  small = false,
  ...props
}) => {
  const [currentValue, , onChange, ref, onBlur] = useField({ value, ...props });

  return (
    <Wrapper<string>
      item={item}
      value={value}
      active={props.active}
      invalid={invalid}
      small={small}
    >
      <input
        ref={ref}
        aria-label={label || undefined}
        type="text"
        value={currentValue}
        onChange={onChange}
        onBlur={onBlur}
      />
    </Wrapper>
  );
};

export default FormFieldText;
