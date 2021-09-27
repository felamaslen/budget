import type { CommonProps, WrapperProps } from '../shared';

export type FieldProps<F> = {
  value: F[] | undefined;
  onChange: (value: F[] | undefined) => void;
};

export type ModalFieldProps<F> = WrapperProps & Pick<CommonProps<F[]>, 'value' | 'onChange'>;
export type ModalFieldPropsOptional<F> = WrapperProps &
  Pick<CommonProps<F[] | undefined>, 'value' | 'onChange'>;

export type PropsFormFieldPart<F> = {
  item: F;
  index?: number;
  onChange: (index: number, delta: Partial<F>) => void;
  create?: boolean;
};
