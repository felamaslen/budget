import { PAGES } from '~client/constants/data';
import { PageList } from './app';

export type Item = { id: string; cost?: number };

export interface ListCalcItem extends Item {
  date: Date;
  cost: number;
}

interface ListItem extends ListCalcItem {
  item: string;
}

interface ShopItem extends ListItem {
  shop: string;
}

export type Income = ListItem;
export type Bill = ListItem;
export type Food = ShopItem & {
  category: string;
};
export type General = Food;
export type Holiday = ShopItem & {
  holiday: string;
};
export type Social = ShopItem & { society: string };

export type Column<I extends {} = {}> = keyof I;

export const getColumns = <I extends {}>(page?: PageList): Column<I>[] =>
  (page && ((PAGES[page].cols ?? []) as Column<I>[])) ?? [];
