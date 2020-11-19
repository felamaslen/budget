import { Page, PageListCalcCategory } from './app';
import { RawDate, Request } from './crud';
import { ReadResponseFunds } from './funds';
import {
  ReadResponseIncome,
  ReadResponseBill,
  ReadResponseFood,
  ReadResponseGeneral,
  ReadResponseHoliday,
  ReadResponseSocial,
} from './list';
import { Category, Subcategory, Entry, CreateEntry } from './net-worth';
import { Id } from './shared';

export type RequestWithResponse<R = never> = Request & {
  res: R;
};

export type SyncResponsePostList = { id: Id; total: number; weekly?: number };
export type SyncResponsePutList = { total: number; weekly?: number };
export type SyncResponseDeleteList = SyncResponsePutList;

export type SyncResponseList = SyncResponsePostList | SyncResponsePutList | SyncResponseDeleteList;

export type SyncResponseNetWorth = Category | Subcategory | RawDate<Entry> | undefined;
export type SyncPayloadNetWorth = Category | Subcategory | RawDate<CreateEntry>;
export type SyncRequestNetWorth = RequestWithResponse<SyncResponseNetWorth>;

export type SyncResponse = {
  list: RequestWithResponse<SyncResponseList>[];
  netWorth: SyncRequestNetWorth[];
};

export type ReadResponse = {
  appConfig: {
    birthDate: string;
    pieTolerance: number;
  };
  [Page.overview]: {
    startYearMonth: [number, number];
    endYearMonth: [number, number];
    currentYear: number;
    currentMonth: number;
    futureMonths: number;
    annualisedFundReturns: number;
    homeEquityOld: number[];
    cost: {
      [Page.funds]: number[];
      [Page.income]: number[];
      [Page.bills]: number[];
      [Page.food]: number[];
      [Page.general]: number[];
      [Page.holiday]: number[];
      [Page.social]: number[];
    };
  };
  netWorth: {
    categories: {
      data: Category[];
    };
    subcategories: {
      data: Subcategory[];
    };
    entries: {
      data: {
        items: RawDate<Entry>[];
        old?: number[];
        oldOptions?: number[];
      };
    };
  };
  [Page.funds]: ReadResponseFunds;
  [Page.income]: ReadResponseIncome;
  [Page.bills]: ReadResponseBill;
  [Page.food]: ReadResponseFood;
  [Page.general]: ReadResponseGeneral;
  [Page.holiday]: ReadResponseHoliday;
  [Page.social]: ReadResponseSocial;
};

export type StocksListResponse = {
  data: {
    stocks: [string, string, number][];
    total: number;
  };
};

export type ReceiptCategory = {
  item: string;
  page: PageListCalcCategory;
  category: string;
};
