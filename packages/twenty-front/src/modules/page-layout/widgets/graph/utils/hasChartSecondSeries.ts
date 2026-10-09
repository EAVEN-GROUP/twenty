import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type ChartSecondSeriesConfiguration = {
  secondSeriesFilter?: { recordFilters?: unknown[] | null } | null;
  secondaryAxisGroupByFieldMetadataId?: string | null;
};

export const hasChartSecondSeries = (
  configuration: ChartSecondSeriesConfiguration,
): boolean =>
  !isDefined(configuration.secondaryAxisGroupByFieldMetadataId) &&
  isNonEmptyArray(configuration.secondSeriesFilter?.recordFilters);
