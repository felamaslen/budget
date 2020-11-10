import { Page } from './app';
import { Fund } from './funds';
import { ListItem, RawListItem } from './shared';
import { DataKeyAbbr } from '~client/constants/api';

export interface ListCalcItem extends ListItem {
  date: Date;
  cost: number;
}

export interface ExtendedCalcItem extends ListCalcItem {
  category: string;
  shop: string;
}

export type Income = ListCalcItem;
export type Bill = ListCalcItem;

export type Food = ExtendedCalcItem;
export type General = ExtendedCalcItem;
export type Holiday = ExtendedCalcItem;
export type Social = ExtendedCalcItem;

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

interface RawExtendedItem extends RawListCalcItem {
  [DataKeyAbbr.category]: string;
  [DataKeyAbbr.shop]: string;
}

type ReadResponseList<I extends RawListItem> = {
  data: I[];
  total?: number;
  weekly?: number;
  olderExists?: boolean | null;
};

export type ReadResponseIncome = ReadResponseList<RawListCalcItem>;
export type ReadResponseBill = ReadResponseList<RawListCalcItem>;
export type ReadResponseFood = ReadResponseList<RawExtendedItem>;
export type ReadResponseGeneral = ReadResponseList<RawExtendedItem>;
export type ReadResponseHoliday = ReadResponseList<RawExtendedItem>;
export type ReadResponseSocial = ReadResponseList<RawExtendedItem>;
