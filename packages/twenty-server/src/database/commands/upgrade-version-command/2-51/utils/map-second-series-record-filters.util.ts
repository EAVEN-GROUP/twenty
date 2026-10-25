import { isPlainObject } from 'twenty-shared/utils';

type StoredRecordFilter = Record<string, unknown>;

export const mapSecondSeriesRecordFilters = ({
  configuration,
  mapRecordFilter,
}: {
  configuration: unknown;
  mapRecordFilter: (recordFilter: StoredRecordFilter) => StoredRecordFilter;
}): { value: unknown; hasChanged: boolean } => {
  if (
    !isPlainObject(configuration) ||
    !isPlainObject(configuration.secondSeriesFilter) ||
    !Array.isArray(configuration.secondSeriesFilter.recordFilters)
  ) {
    return { value: configuration, hasChanged: false };
  }

  const mappedConfiguration = {
    ...configuration,
    secondSeriesFilter: {
      ...configuration.secondSeriesFilter,
      recordFilters: configuration.secondSeriesFilter.recordFilters.map(
        (recordFilter) =>
          isPlainObject(recordFilter)
            ? mapRecordFilter(recordFilter)
            : recordFilter,
      ),
    },
  };

  const hasChanged =
    JSON.stringify(configuration) !== JSON.stringify(mappedConfiguration);

  return {
    value: hasChanged ? mappedConfiguration : configuration,
    hasChanged,
  };
};
