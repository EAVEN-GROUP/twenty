import { dropChartRecordFiltersWithDeletedFields } from '@/side-panel/pages/page-layout/utils/dropChartRecordFiltersWithDeletedFields';

type RemoveStatusFilterFromChartFilterParams = {
  chartFilter: Parameters<
    typeof dropChartRecordFiltersWithDeletedFields
  >[0]['chartFilters'];
  fieldMetadataIds: string[];
  statusFieldMetadataId: string | undefined;
};

export const removeStatusFilterFromChartFilter = ({
  chartFilter,
  fieldMetadataIds,
  statusFieldMetadataId,
}: RemoveStatusFilterFromChartFilterParams) =>
  dropChartRecordFiltersWithDeletedFields({
    chartFilters: chartFilter,
    validFieldMetadataIds: new Set(
      fieldMetadataIds.filter((id) => id !== statusFieldMetadataId),
    ),
  });
