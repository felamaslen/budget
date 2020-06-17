import { Page } from './app';
import { Fund } from './funds';
import { ListItem, RawListItem } from './shared';
import { DataKeyAbbr } from '~client/constants/api';

export interface ListCalcItem extends ListItem {
  date: Date;
  cost: number;
}

export interface ShopItem extends ListCalcItem {
  shop: string;
}

export type Income = ListCalcItem;
export type Bill = ListCalcItem;
export type Food = ShopItem & {
  category: string;
};
export type General = Food;
export type Holiday = ShopItem & {
  holiday: string;
};
export type Social = ShopItem & { society: string };

type PageProps<I = never> = {
  path?: string;
  cols?: (keyof I)[];
  list?: boolean;
  daily?: boolean;
  suggestions?: string[];
};

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

// types which come from the API response
interface RawListCalcItem extends RawListItem {
  [DataKeyAbbr.date]: string;
  [DataKeyAbbr.cost]: number;
}

interface RawShopItem extends RawListCalcItem {
  [DataKeyAbbr.shop]: string;
}

type ReadResponseList<Item extends RawListItem> = {
  data: Item[];
  total?: number;
  weekly?: number;
  olderExists?: boolean | null;
};

export type ReadResponseIncome = ReadResponseList<RawListCalcItem>;
export type ReadResponseBill = ReadResponseList<RawListCalcItem>;
export type ReadResponseFood = ReadResponseList<
  RawShopItem & {
    [DataKeyAbbr.category]: string;
  }
>;
export type ReadResponseGeneral = ReadResponseList<
  RawShopItem & {
    [DataKeyAbbr.category]: string;
  }
>;
export type ReadResponseHoliday = ReadResponseList<
  RawShopItem & {
    [DataKeyAbbr.holiday]: string;
  }
>;
export type ReadResponseSocial = ReadResponseList<
  RawShopItem & {
    [DataKeyAbbr.society]: string;
  }
>;
