import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { sanitizeChartRecordFilters } from '@/side-panel/pages/page-layout/utils/sanitizeChartRecordFilters';

type RemoveStatusFilterFromChartFilterParams = {
  chartFilter: ChartFilters;
  fieldMetadataIds: string[];
  statusFieldMetadataId: string | undefined;
};

export const removeStatusFilterFromChartFilter = ({
  chartFilter,
  fieldMetadataIds,
  statusFieldMetadataId,
}: RemoveStatusFilterFromChartFilterParams) =>
  sanitizeChartRecordFilters({
    chartFilters: chartFilter,
    fieldMetadataItems: fieldMetadataIds
      .filter((fieldMetadataId) => fieldMetadataId !== statusFieldMetadataId)
      .map((fieldMetadataId) => ({ id: fieldMetadataId, isActive: true })),
  });
