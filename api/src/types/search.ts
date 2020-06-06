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
