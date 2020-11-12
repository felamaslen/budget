import { ListCalcCategoryExtended } from './shared';

export type SearchParams = {
  table: string;
  column: string;
  searchTerm: string;
  numResults: number;
};

export type SearchResult = {
  list: string[];
  nextCategory?: string[];
  nextField?: string;
};

export type ReceiptCategory = {
  item: string;
  page: ListCalcCategoryExtended;
  category: string;
};
