import { isNonEmptyArray } from 'twenty-shared/utils';

import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { buildChartDimensionValueKey } from 'src/modules/dashboard/chart-data/utils/build-chart-dimension-value-key.util';

export const addMissingChartBuckets = ({
  rawResults,
  rawResultsWithExtraBuckets,
}: {
  rawResults: GroupByRawResult[];
  rawResultsWithExtraBuckets: GroupByRawResult[];
}): GroupByRawResult[] => {
  const knownDimensionValueKeys = new Set(
    rawResults.map((rawResult) =>
      buildChartDimensionValueKey(rawResult.groupByDimensionValues[0]),
    ),
  );

  const missingBuckets: GroupByRawResult[] = [];

  for (const rawResult of rawResultsWithExtraBuckets) {
    if (!isNonEmptyArray(rawResult.groupByDimensionValues)) {
      continue;
    }

    const dimensionValue = rawResult.groupByDimensionValues[0];
    const dimensionValueKey = buildChartDimensionValueKey(dimensionValue);

    if (knownDimensionValueKeys.has(dimensionValueKey)) {
      continue;
    }

    knownDimensionValueKeys.add(dimensionValueKey);
    missingBuckets.push({
      groupByDimensionValues: [dimensionValue],
      aggregateValue: 0,
    });
  }

  return [...rawResults, ...missingBuckets];
};
