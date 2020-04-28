export const CREATE_ID: string;
export const DELETE: string;

export const PAGES: {
  [page: string]: {
    suggestions?: string[];
    cols?: string[];
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
