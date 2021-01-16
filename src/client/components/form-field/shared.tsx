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

export type FieldComponent<V, E extends Record<string, unknown> = never> = React.FC<
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

export const makeInlineField = <V, P extends Record<string, unknown> = Record<string, unknown>>({
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
    value,
    onChange: onChangeInput,
    ...props
  }) => {
    const { inputValue, onChange, inputRef, onBlur } = useField<V>({
      ...props,
      value,
      onChange: onChangeInput,
      active,
      inline: false,
      ...hookOptions,
    });

    const inputOnBlur = inputProps.onBlur;
    const customOnBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        onBlur();
        inputOnBlur?.(event);
      },
      [onBlur, inputOnBlur],
    );

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
          onBlur={customOnBlur}
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
    id,
    inputProps = {},
    value,
    onChange: onChangeInput,
    ...props
  }) => {
    const { inputValue, currentValue, onChange, inputRef, onBlur, onCancel } = useField<
      V | undefined
    >({
      ...props,
      value,
      onChange: onChangeInput,
      inline: true,
      ...hookOptionsInline,
    });

    const inputIsEmpty = typeof currentValue === 'undefined';
    const inputOnBlur = inputProps.onBlur;
    const customOnBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (inputIsEmpty) {
          onCancel();
        }
        onBlur();
        inputOnBlur?.(event);
      },
      [inputIsEmpty, onCancel, onBlur, inputOnBlur],
    );

    return (
      <Wrapper item={item} active={!!props.active} invalid={invalid} small={small}>
        {Children}
        <input
          ref={inputRef}
          aria-label={label}
          id={id}
          {...inputProps}
          type="text"
          value={inputValue ?? ''}
          onChange={onChange}
          onBlur={customOnBlur}
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
