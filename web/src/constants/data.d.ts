import { Page, PageListCalc } from '~client/types/app';
import { RequestType } from '~client/types/crud';
import { CostProcessed as OverviewTable } from '~client/types/overview';

export const CREATE_ID: string;

export const CREATE: RequestType.create;
export const UPDATE: RequestType.update;
export const DELETE: RequestType.delete;

export const PAGES: {
  [page in Page]: {
    suggestions?: string[];
    cols?: string[];
    path?: string;
    daily?: boolean;
  };
};

export const PAGES_LIST: PageListCalc[];
export const PAGES_SUGGESTIONS: PageListCalc[];

export enum DATA_KEY_ABBR {
  id = 'I',
  date = 'd',
  item = 'i',
  cost = 'c',
  shop = 's',
  category = 'k',
  holiday = 'h',
  society = 'y',
  transactions = 'tr',
}

// TODO: use a Dictionary for this
export const OVERVIEW_COLUMNS: [
  'month' | keyof OverviewTable,
  string,
  { to: string; replace?: boolean } | undefined,
][];
