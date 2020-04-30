export const CREATE_ID: string;

export const CREATE: string;
export const UPDATE: string;
export const DELETE: string;

export const PAGES: {
  [page: string]: {
    suggestions?: string[];
    cols?: string[];
    path?: string;
  };
};

export const PAGES_SUGGESTIONS: string[];

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
