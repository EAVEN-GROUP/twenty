import { type ChartFilter } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const hasChartSecondSeries = ({
  secondSeriesFilter,
  secondaryAxisGroupByFieldMetadataId,
}: {
  secondSeriesFilter?: ChartFilter | null;
  secondaryAxisGroupByFieldMetadataId?: string | null;
}): boolean =>
  !isDefined(secondaryAxisGroupByFieldMetadataId) &&
  isNonEmptyArray(secondSeriesFilter?.recordFilters);
