export interface SearchResult<T> {
  page: number;
  pageSize: number;
  maxPageSize: number;
  pageCount: number;
  resultCountCapped?: true;
  results: {
    key: {
      href: string;
    };
    data: T;
  }[];
}
