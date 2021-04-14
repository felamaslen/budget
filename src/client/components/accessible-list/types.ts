import type { StyledComponent } from '@emotion/styled';
import type { CSSProperties, FC } from 'react';

import type { FieldComponent } from '~client/components/form-field';
import type { ModalFields } from '~client/components/modal-dialog/field';
import type { ListCrud, OnCreateList, OnDeleteList, OnUpdateList } from '~client/hooks';
import type { ApiListState } from '~client/selectors/list';
import type { Create, Delta, FieldKey, Id, PageList, PickUnion, WithIds } from '~client/types';
import type { ListItem, ListItemInput } from '~client/types/gql';

export type State<I extends ListItem, P extends string> = ApiListState<I, P>;

export { FieldKey } from '~client/types';

export type Fields<
  I extends ListItemInput,
  E extends Record<string, unknown> = Record<string, unknown>
> = {
  [K in FieldKey<I>]: FieldComponent<I[K] | undefined, E>;
};

export type ComponentType<P extends Record<string, unknown>> = FC<P> | StyledComponent<Partial<P>>;

export type RowComponent<
  I extends ListItemInput,
  E extends Record<string, unknown>
> = ComponentType<Partial<E> & { isMobile: boolean; item: WithIds<I>; odd?: boolean }>;

export type FieldsMobile<
  I extends ListItemInput,
  MK extends keyof I = FieldKey<I>,
  E extends Record<string, unknown> = Record<string, unknown>
> = {
  [K in MK]?: ComponentType<{ field: MK; value: I[K] } & Partial<E>>;
};

export type HeaderProps<
  I extends ListItemInput,
  P,
  MK extends keyof I,
  H extends Record<string, unknown> = Record<string, unknown>
> = H & {
  page: P;
  isMobile: boolean;
  fields: FieldKey<Create<I>>[];
  fieldsMobile: MK[];
  labels?: Partial<Record<keyof I, string>>;
};

export type CustomSelector<I extends ListItemInput, E extends Record<string, unknown>> = (
  items: WithIds<I>[],
) => Record<Id, Partial<E>>;

export type ItemProcessor<I extends ListItemInput, E extends Record<string, unknown>> = (
  item: I,
) => Partial<E>;

export type PropsCrud<I extends ListItemInput> = {
  onCreate: OnCreateList<I>;
  onUpdate: OnUpdateList<I>;
  onDelete: OnDeleteList<I>;
};

type CommonProps<I extends ListItemInput, P extends PageList, E extends Record<string, unknown>> = {
  page: P;
  fields: Fields<Create<I>, E>;
  modalFields?: ModalFields<I>;
  itemProcessor?: ItemProcessor<I, E>;
  Row?: RowComponent<I, E>;
  suggestionFields?: FieldKey<I>[];
};

export type SortItemsPre<I extends ListItemInput> = (items: I[]) => I[];
export type SortItemsPost<I extends ListItemInput, E extends Record<string, unknown>> = (
  items: I[],
  extraMap: { [id: number]: Partial<E> },
) => I[];

export type Props<
  I extends ListItemInput,
  P extends PageList,
  MK extends keyof I = never,
  E extends Record<string, unknown> = never,
  H extends Record<string, unknown> = Record<string, unknown>
> = CommonProps<I, P, E> & {
  windowise?: boolean;
  color?: string;
  fieldsMobile?: FieldsMobile<I, MK, E>;
  deltaSeed?: () => Partial<I>;
  Header?: FC<HeaderProps<I, P, MK, H>> | StyledComponent<HeaderProps<I, P, MK, H>>;
  headerProps?: H;
  FirstItem?: FC;
  sortItems?: SortItemsPre<WithIds<I>>;
  sortItemsPost?: SortItemsPost<WithIds<I>, E>;
  customSelector?: CustomSelector<I, E>;
} & ListCrud<I>;

export type PropsItem<
  I extends ListItemInput,
  P extends PageList,
  MK extends keyof I,
  E extends Record<string, unknown> = never
> = {
  id: Id;
  isMobile: boolean;
  style?: CSSProperties;
  odd: boolean;
  extraProps?: Partial<E>;
  onActivateModal: (id: Id) => void;
} & PickUnion<Props<I, P, MK, E>, 'fieldsMobile'> &
  Omit<CommonProps<I, P, E>, 'suggestionFields'> &
  Pick<PropsCrud<I>, 'onUpdate' | 'onDelete'>;

export type PropsMemoisedItem<E extends Record<string, unknown>> = {
  id: Id;
  style?: CSSProperties;
  odd: boolean;
  extraProps?: Partial<E>;
};

export type PropsItemCreate<
  I extends ListItemInput,
  P extends PageList,
  E extends Record<string, unknown> = Record<string, unknown>
> = {
  deltaSeed?: () => Delta<I>;
} & PickUnion<CommonProps<I, P, E>, 'page' | 'fields' | 'modalFields' | 'suggestionFields'> &
  Pick<PropsCrud<I>, 'onCreate'>;

export type ActiveField<I extends ListItemInput> = FieldKey<I> | null | '__add-button';

export type DailyRecord = {
  dailyTotal?: number;
};
