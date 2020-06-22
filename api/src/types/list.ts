import { Create, Item } from './shared';

export interface ListItem extends Item {
  item: string;
}

export interface ListCalcItem extends ListItem {
  date: string;
  cost: number;
}

interface ShopItem extends ListCalcItem {
  shop: string;
}

export type Income = ListCalcItem;
export type Bill = ListCalcItem;
export type Food = ShopItem & { category: string };
export type General = ShopItem & { category: string };
export type Holiday = ShopItem & { holiday: string };
export type Social = ShopItem & { society: string };

export type ColumnMap<I extends object> = { [key: string]: keyof I };

export type AbbreviatedItem<I extends ListItem, K extends ColumnMap<I> = ColumnMap<I>> = {
  [key in keyof K]: I[K[key]];
};

export type ListResponse<I extends ListItem> = {
  data: AbbreviatedItem<I>[];
  total: number;
  olderExists: boolean;
};

export type CreateList<I extends ListItem> = Create<I>;
export type UpdateList<I extends Create<ListItem>> = Partial<I> & { id: number };

export type CreateListCalc<I extends ListCalcItem> = Create<I>;
export type UpdateListCalc<I extends ListCalcItem> = UpdateList<CreateListCalc<I>>;

export type UpdateResponse = { total: number; weekly?: number };
export type CreateResponse = UpdateResponse & { id: number };
export type DeleteResponse = UpdateResponse;
