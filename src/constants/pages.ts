export interface Page {
  path?: string;
  list?: boolean;
  cols?: string[];
  daily?: boolean;
  suggestions?: string[];
}

interface Pages {
  [page: string]: Page;
}

const pages: Pages = {
  overview: {
    path: '/',
  },
  analysis: {},
  funds: {
    list: true,
    cols: ['item', 'transactions'],
  },
  income: {
    list: true,
    cols: ['date', 'item', 'cost'],
  },
  bills: {
    list: true,
    cols: ['date', 'item', 'cost'],
    suggestions: ['item'],
  },
  food: {
    list: true,
    cols: ['date', 'item', 'category', 'cost', 'shop'],
    daily: true,
    suggestions: ['item', 'category', 'shop'],
  },
  general: {
    list: true,
    cols: ['date', 'item', 'category', 'cost', 'shop'],
    daily: true,
    suggestions: ['item', 'category', 'shop'],
  },
  holiday: {
    list: true,
    cols: ['date', 'item', 'holiday', 'cost', 'shop'],
    daily: true,
    suggestions: ['item', 'holiday', 'shop'],
  },
  social: {
    list: true,
    cols: ['date', 'item', 'society', 'cost', 'shop'],
    daily: true,
    suggestions: ['item', 'society', 'shop'],
  },
};

export default pages;
