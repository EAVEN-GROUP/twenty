import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// A function lets a card build a filter that depends on the time of the query,
// for example "meetings that already happened".
export type RecordIndexStatCardFilter =
  | RecordGqlOperationFilter
  | (() => RecordGqlOperationFilter);
