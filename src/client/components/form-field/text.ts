import { InlineField, makeInlineField } from './shared';

export function makeInlineTextField<V extends string = string>(): InlineField<
  V,
  Record<string, unknown>
> {
  const { Field, FieldInline } = makeInlineField<V>({
    inputProps: {
      type: 'text',
    },
    hookOptionsInline: {
      convertInputToExternalValue: ({ target: { value } }, allowEmpty): V | undefined =>
        allowEmpty ? (value as V) : (value as V) || undefined,
    },
  });

  return { Field, FieldInline };
}

const { Field, FieldInline } = makeInlineTextField<string>();

export { Field as FormFieldText };
export { FieldInline as FormFieldTextInline };
