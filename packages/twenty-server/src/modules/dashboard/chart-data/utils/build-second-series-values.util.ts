import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { type RawDimensionValue } from 'src/modules/dashboard/chart-data/types/raw-dimension-value.type';
import { buildChartDimensionValueKey } from 'src/modules/dashboard/chart-data/utils/build-chart-dimension-value-key.util';

export const buildSecondSeriesValues = ({
  orderedRawDimensionValues,
  secondSeriesRawResults,
  isCumulative,
}: {
  orderedRawDimensionValues: RawDimensionValue[];
  secondSeriesRawResults: GroupByRawResult[];
  isCumulative: boolean;
}): number[] => {
  const aggregateValueByDimensionValueKey = new Map<string, number>();

  for (const rawResult of secondSeriesRawResults) {
    aggregateValueByDimensionValueKey.set(
      buildChartDimensionValueKey(rawResult.groupByDimensionValues[0]),
      rawResult.aggregateValue,
    );
  }

  let runningTotal = 0;

  return orderedRawDimensionValues.map((rawDimensionValue) => {
    const aggregateValue =
      aggregateValueByDimensionValueKey.get(
        buildChartDimensionValueKey(rawDimensionValue),
      ) ?? 0;

    if (!isCumulative) {
      return aggregateValue;
    }

    runningTotal += aggregateValue;

    return runningTotal;
  });
};
