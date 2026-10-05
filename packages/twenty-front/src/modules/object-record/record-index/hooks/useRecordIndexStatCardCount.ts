import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexViewGqlFilter } from '@/object-record/record-index/hooks/useRecordIndexViewGqlFilter';
import { type RecordIndexStatCardFilter } from '@/object-record/record-index/types/RecordIndexStatCardFilter';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useMemo } from 'react';

export const useRecordIndexStatCardCount = ({
  filter,
  objectNameSingular,
  skip = false,
}: {
  filter: RecordIndexStatCardFilter;
  objectNameSingular?: string;
  skip?: boolean;
}) => {
  const { objectNameSingular: pageObjectNameSingular } =
    useRecordIndexContextOrThrow();

  const viewFilter = useRecordIndexViewGqlFilter();

  // Resolved once per mount so a time-based filter keeps the same query
  // variables between renders instead of refetching on every render.
  const resolvedFilter = useMemo(
    () => (typeof filter === 'function' ? filter() : filter),
    [filter],
  );

  const targetObjectNameSingular = objectNameSingular ?? pageObjectNameSingular;

  const { data, loading } = useAggregateRecords<{ id: { COUNT: number } }>({
    objectNameSingular: targetObjectNameSingular,
    filter:
      targetObjectNameSingular === pageObjectNameSingular
        ? { and: [viewFilter, resolvedFilter] }
        : resolvedFilter,
    recordGqlFieldsAggregate: { id: [AggregateOperations.COUNT] },
    skip,
  });

  return { count: data?.id?.COUNT, loading };
};
