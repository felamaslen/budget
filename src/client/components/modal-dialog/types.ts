import type { FieldKey, Id } from '~client/types';
import type { ListItemInput } from '~client/types/gql';

export type DialogType = 'edit' | 'add';

export type State = {
  visible: boolean;
  title: string;
  canRemove: boolean;
};

export type FieldWrapper<V = never> = React.FC<{
  id: string;
  invalid?: boolean;
  value: V;
  onChange: (value: V) => void;
}>;

export type ModalFields<I extends ListItemInput> = {
  [K in FieldKey<I>]?: FieldWrapper<Exclude<I[K], null | undefined>>;
};

export type Props<I extends ListItemInput> = {
  active: boolean;
  loading?: boolean;
  type?: DialogType;
  id?: Id;
  item?: Partial<I>;
  fields?: ModalFields<I>;
  onCancel: () => void;
  onSubmit: (id: Id, item: I) => void;
  onRemove?: () => void;
};
