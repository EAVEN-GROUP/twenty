import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const cloneChartFiltersWithNewIds = (
  chartFilters: ChartFilters,
): ChartFilters => {
  const newRecordFilterGroupIdByOldId = new Map(
    (chartFilters.recordFilterGroups ?? []).map((recordFilterGroup) => [
      recordFilterGroup.id,
      v4(),
    ]),
  );

  return {
    recordFilters: chartFilters.recordFilters?.map((recordFilter) => ({
      ...recordFilter,
      id: v4(),
      recordFilterGroupId: isDefined(recordFilter.recordFilterGroupId)
        ? newRecordFilterGroupIdByOldId.get(recordFilter.recordFilterGroupId)
        : recordFilter.recordFilterGroupId,
    })),
    recordFilterGroups: chartFilters.recordFilterGroups?.map(
      (recordFilterGroup) => ({
        ...recordFilterGroup,
        id:
          newRecordFilterGroupIdByOldId.get(recordFilterGroup.id) ??
          recordFilterGroup.id,
        parentRecordFilterGroupId: isDefined(
          recordFilterGroup.parentRecordFilterGroupId,
        )
          ? newRecordFilterGroupIdByOldId.get(
              recordFilterGroup.parentRecordFilterGroupId,
            )
          : recordFilterGroup.parentRecordFilterGroupId,
      }),
    ),
  };
};
