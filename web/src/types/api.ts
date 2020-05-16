import { DataKeyAbbr } from '~client/constants/api';
import { PageList, Page } from './app';
import { RawDate, Request } from './crud';
import { Category, Subcategory, Entry } from './net-worth';

export type RequestWithResponse<R = never> = Request & {
  res: R;
};

export type SyncResponsePostList = { id: string; total: number };
export type SyncResponsePutList = { total: number };
export type SyncResponseDeleteList = SyncResponsePutList;

export type SyncResponseList = SyncResponsePostList | SyncResponsePutList | SyncResponseDeleteList;

export type SyncResponseNetWorth = Category | Subcategory | RawDate<Entry> | undefined;

export type SyncResponse = Partial<{
  list: RequestWithResponse<SyncResponseList>[];
  netWorth: RequestWithResponse<SyncResponseNetWorth>[];
}>;

export type ReadResponse = Partial<
  {
    [page in PageList]: {
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key in DataKeyAbbr]?: any;
      }[];
      total?: number;
      olderExists?: boolean | null;
    };
  } & {
    [Page.overview]: {
      startYearMonth: [number, number];
      endYearMonth: [number, number];
      currentYear: number;
      currentMonth: number;
      futureMonths: number;
      cost: {
        [Page.funds]: number[];
        fundChanges: number[];
        [Page.income]: number[];
        [Page.bills]: number[];
        [Page.food]: number[];
        [Page.general]: number[];
        [Page.holiday]: number[];
        [Page.social]: number[];
        balance: number[];
        old: number[];
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
  }
>;
