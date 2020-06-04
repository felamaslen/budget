import React, { useCallback } from 'react';

import * as Styled from './styles';
import { useField, FieldOptions as Options } from '~client/hooks';

type CommonProps<V> = WrapperProps & {
  id?: string;
  inputProps?: Partial<React.HTMLProps<HTMLInputElement>>;
  value: V;
  onChange: (value: V) => void;
  onType?: (value: V) => void;
  allowEmpty?: boolean;
  label?: string;
};

type FormField<V, P> = React.FC<P & CommonProps<V>>;

export type InlineField<V, P> = {
  Field: FormField<V, P>;
  FieldInline: FormField<V | undefined, P>;
};

export type FieldComponent<V, E extends {} = {}> = React.FC<
  CommonProps<V> & {
    extraProps?: Partial<E>;
  }
>;

export type WrapperProps = React.PropsWithChildren<{
  item?: string;
  active?: boolean;
  invalid?: boolean;
  small?: boolean;
}>;

export const Wrapper: React.FC<WrapperProps> = ({
  item = '',
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
    {children}
  </Styled.FormField>
);

type InlineFieldHookKeys =
  | 'convertExternalToInputValue'
  | 'convertInputToExternalValue'
  | 'immediate';

export const makeInlineField = <V, P extends {} = {}>({
  hookOptions = {},
  hookOptionsInline = {},
  inputProps: staticInputProps = {},
  Children,
}: Partial<{
  hookOptions: Pick<Options<V>, InlineFieldHookKeys>;
  hookOptionsInline: Pick<Options<V | undefined>, InlineFieldHookKeys>;
  inputProps: Partial<React.HTMLProps<HTMLInputElement>>;
  Children: React.ReactElement;
}> = {}): InlineField<V, P> => {
  const Field: FormField<V, P> = ({
    children,
    item,
    active,
    invalid,
    small,
    label,
    id,
    inputProps = {},
    ...props
  }) => {
    const { inputValue, onChange, inputRef, onBlur } = useField<V>({
      ...props,
      active,
      inline: false,
      ...hookOptions,
    });

    return (
      <Wrapper item={item} active={active} invalid={invalid} small={small}>
        {Children}
        <input
          ref={inputRef}
          aria-label={label}
          id={id}
          {...inputProps}
          {...staticInputProps}
          value={inputValue}
          onChange={onChange}
          onBlur={onBlur}
        />
        {children}
      </Wrapper>
    );
  };

  const FieldInline: FormField<V | undefined, P> = ({
    children,
    item,
    invalid,
    small,
    label,
    inputProps = {},
    ...props
  }) => {
    const { inputValue, currentValue, onChange, inputRef, onBlur, onCancel } = useField<
      V | undefined
    >({
      ...props,
      inline: true,
      ...hookOptionsInline,
    });

    const inputIsEmpty = typeof currentValue === 'undefined';
    const onBlurInput = useCallback((): void => {
      if (inputIsEmpty) {
        onCancel();
      }
      onBlur();
    }, [inputIsEmpty, onCancel, onBlur]);

    return (
      <Wrapper item={item} active={props.active} invalid={invalid} small={small}>
        {Children}
        <input
          ref={inputRef}
          aria-label={label}
          {...inputProps}
          type="text"
          value={inputValue ?? ''}
          onChange={onChange}
          onBlur={onBlurInput}
        />
        {children}
      </Wrapper>
    );
  };

  return {
    Field,
    FieldInline,
  };
};
