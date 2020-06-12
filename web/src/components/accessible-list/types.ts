import React from 'react';
import { StyledComponent } from 'styled-components';

import { OnCreateList, OnUpdateList, OnDeleteList } from '~client/actions';
import { FieldComponent } from '~client/components/form-field';
import { ModalFields } from '~client/components/modal-dialog';
import { State as AppState } from '~client/reducers';
import { ListState } from '~client/reducers/list';
import { WithCrud, Delta, Item, PickUnion, FieldKey } from '~client/types';

export type State<I extends Item, P extends string> = Record<P, ListState<I>> &
  Partial<Pick<AppState, 'api'>>;

export { FieldKey } from '~client/types';

export type Fields<I extends Item, E extends {} = {}> = {
  [K in FieldKey<I>]: FieldComponent<WithCrud<I>[K] | undefined, E>;
};

export type ComponentType<
  P extends object,
  C extends keyof JSX.IntrinsicElements | React.ComponentType<P> = 'div'
> = React.FC<P> | StyledComponent<C, P>;

type RowComponent<I extends Item, E extends {}> = ComponentType<
  { isMobile: boolean; item: I } & Partial<E>,
  'li'
>;

export type FieldsMobile<I extends Item, MK extends keyof I = FieldKey<I>, E extends {} = {}> = {
  [K in MK]?: ComponentType<{ field: MK; value: I[K] } & Partial<E>>;
};

export type HeaderProps<I extends Item, P, MK extends keyof I, H extends {} = {}> = H & {
  page: P;
  isMobile: boolean;
  fields: FieldKey<I>[];
  fieldsMobile: MK[];
};

export type CustomSelector<I extends Item, E extends {}> = (
  items: I[],
) => { [id: string]: Partial<E> };
type ItemProcessor<I extends Item, E extends {}> = (item: I) => Partial<E>;

export type PropsCrud<I extends Item, P extends string> = {
  onCreate: OnCreateList<I, P, void>;
  onUpdate: OnUpdateList<I, P, void>;
  onDelete: OnDeleteList<I, P, void>;
};

type CommonProps<I extends Item, P extends string, E extends {}> = {
  page: P;
  fields: Fields<I, E>;
  modalFields?: ModalFields<I>;
  itemProcessor?: ItemProcessor<I, E>;
  Row?: RowComponent<I, E>;
  suggestionFields?: FieldKey<I>[];
};

export type SortItemsPre<I extends Item> = (items: I[]) => I[];
export type SortItemsPost<I extends Item, E extends {}> = (
  items: I[],
  extraMap: { [id: string]: Partial<E> },
) => I[];

export type Props<
  I extends Item,
  P extends string,
  MK extends keyof I = never,
  E extends {} = {},
  H extends {} = {}
> = CommonProps<I, P, E> & {
  windowise?: boolean;
  color?: string;
  fieldsMobile?: FieldsMobile<I, MK, E>;
  deltaSeed?: () => Delta<I>;
  Header?: React.FC<HeaderProps<I, P, MK, H>> | StyledComponent<'div', HeaderProps<I, P, MK, H>>;
  headerProps?: H;
  sortItems?: SortItemsPre<I>;
  sortItemsPost?: SortItemsPost<I, E>;
  customSelector?: CustomSelector<I, E>;
};

export type PropsItem<I extends Item, P extends string, MK extends keyof I, E extends {} = {}> = {
  id: string;
  isMobile: boolean;
  style?: object;
  extraProps?: Partial<E>;
  onActivateModal: (id: string) => void;
} & PickUnion<Props<I, P, MK, E>, 'fieldsMobile'> &
  Omit<CommonProps<I, P, E>, 'suggestionFields'> &
  Pick<PropsCrud<I, P>, 'onUpdate' | 'onDelete'>;

export type PropsMemoisedItem = {
  id: string;
  style?: object;
};

export type PropsItemCreate<I extends Item, P extends string, E extends {} = {}> = {
  deltaSeed?: () => Delta<I>;
} & PickUnion<CommonProps<I, P, E>, 'page' | 'fields' | 'modalFields' | 'suggestionFields'> &
  Pick<PropsCrud<I, P>, 'onCreate'>;

export const ADD_BUTTON = '__add-button' as const;

export type ActiveField<I extends Item> = FieldKey<I> | null | typeof ADD_BUTTON;
