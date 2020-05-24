import { PageProps, Page } from './app';
import { Fund } from './funds';

export type Item = { id: string };

export type FieldKey<I extends Item> = keyof Omit<I, 'id'>;

export interface ListCalcItem extends Item {
  date: Date;
  cost: number;
}

export interface ListItem extends ListCalcItem {
  item: string;
}

export interface ShopItem extends ListItem {
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

export type Pages = {
  [Page.overview]: PageProps;
  [Page.analysis]: PageProps;
  [Page.funds]: PageProps<Fund>;
  [Page.income]: PageProps<Income>;
  [Page.bills]: PageProps<Bill>;
  [Page.food]: PageProps<Food>;
  [Page.general]: PageProps<General>;
  [Page.holiday]: PageProps<Holiday>;
  [Page.social]: PageProps<Social>;
};
