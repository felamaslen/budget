import { ListCalcItem } from '~client/reducers/list';

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
