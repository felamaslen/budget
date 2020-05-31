import { DataKeyAbbr } from '~client/constants/api';

export type PickUnion<T extends object, K extends keyof T> = { [P in K]: T[P] };
export type PickRequire<T extends object, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type IdMap<V> = {
  [id: string]: V;
};

export type Item = { id: string };

export type FieldKey<I extends Item> = keyof Omit<I, 'id'>;

export interface ListItem extends Item {
  item: string;
}

export interface RawListItem {
  [DataKeyAbbr.id]: string;
  [DataKeyAbbr.item]: string;
}
