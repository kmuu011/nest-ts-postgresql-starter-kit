export type AnyObject = Record<string, any>;

export interface PaginatedServiceData<T> {
  itemList: T[];
  page: number;
  count: number;
  totalCount: number;
  last: number,
}