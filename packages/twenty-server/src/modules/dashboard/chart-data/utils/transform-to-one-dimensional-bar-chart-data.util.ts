import { isNonEmptyString } from '@sniptt/guards';
import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  capitalize,
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  isDefined,
} from 'twenty-shared/utils';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from 'src/modules/dashboard/chart-data/constants/bar-chart-maximum-number-of-bars.constant';
import { CHART_SECOND_SERIES_DEFAULT_LABEL } from 'src/modules/dashboard/chart-data/constants/chart-second-series-default-label.constant';
import { CHART_SECOND_SERIES_KEY } from 'src/modules/dashboard/chart-data/constants/chart-second-series-key.constant';
import { BarChartDataDTO } from 'src/modules/dashboard/chart-data/dtos/bar-chart-data.dto';
import { GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { RelationLabelResolution } from 'src/modules/dashboard/chart-data/types/relation-label-resolution.type';
import { applyCumulativeToOneDimensionalBarData } from 'src/modules/dashboard/chart-data/utils/apply-cumulative-to-one-dimensional-bar-data.util';
import { applyGapFilling } from 'src/modules/dashboard/chart-data/utils/apply-gap-filling.util';
import { buildFormattedToRawLookupDto } from 'src/modules/dashboard/chart-data/utils/build-formatted-to-raw-lookup-dto.util';
import { buildSecondSeriesValues } from 'src/modules/dashboard/chart-data/utils/build-second-series-values.util';
import { getAggregateOperationLabel } from 'src/modules/dashboard/chart-data/utils/get-aggregate-operation-label.util';
import { getSelectOptions } from 'src/modules/dashboard/chart-data/utils/get-select-options.util';
import { processOneDimensionalResults } from 'src/modules/dashboard/chart-data/utils/process-one-dimensional-results.util';
import { sortChartDataIfNeeded } from 'src/modules/dashboard/chart-data/utils/sort-chart-data-if-needed.util';

export const transformToOneDimensionalBarChartData = ({
  filteredRawResults,
  primaryAxisGroupByField,
  aggregateField,
  configuration,
  userTimezone,
  firstDayOfTheWeek,
  relationLabelResolution,
  secondSeriesRawResults,
}: {
  filteredRawResults: GroupByRawResult[];
  primaryAxisGroupByField: FlatFieldMetadata;
  aggregateField: FlatFieldMetadata;
  configuration: BarChartConfigurationDTO;
  userTimezone: string;
  firstDayOfTheWeek: CalendarStartDay;
  relationLabelResolution: RelationLabelResolution | undefined;
  secondSeriesRawResults?: GroupByRawResult[];
}): BarChartDataDTO => {
  const layout = configuration.layout ?? BarChartLayout.VERTICAL;
  const isHorizontal = layout === BarChartLayout.HORIZONTAL;

  const isDescOrder =
    configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_DESC;

  const { data: gapFilledResults, wasTruncated: dateRangeWasTruncated } =
    applyGapFilling({
      data: filteredRawResults,
      primaryAxisGroupByField,
      dateGranularity: configuration.primaryAxisDateGranularity,
      omitNullValues: configuration.omitNullValues ?? false,
      isDescOrder,
      isTwoDimensional: false,
      splitMultiValueFields: configuration.splitMultiValueFields,
    });

  const selectOptions = getSelectOptions(primaryAxisGroupByField);

  const convertedFirstDayOfTheWeek =
    convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
      firstDayOfTheWeek,
      FirstDayOfTheWeek.SUNDAY,
    );

  const indexByKey = configuration.primaryAxisGroupBySubFieldName
    ? `${primaryAxisGroupByField.name}${capitalize(configuration.primaryAxisGroupBySubFieldName)}`
    : primaryAxisGroupByField.name;

  const aggregateValueKey =
    indexByKey === aggregateField.name
      ? `${aggregateField.name}-aggregate`
      : aggregateField.name;

  const { processedDataPoints, formattedToRawLookup } =
    processOneDimensionalResults({
      rawResults: gapFilledResults,
      primaryAxisGroupByField,
      dateGranularity: configuration.primaryAxisDateGranularity,
      subFieldName: configuration.primaryAxisGroupBySubFieldName,
      userTimezone,
      firstDayOfTheWeek: convertedFirstDayOfTheWeek,
      relationLabelResolution,
    });

  const sortedData = sortChartDataIfNeeded({
    data: processedDataPoints,
    orderBy: configuration.primaryAxisOrderBy,
    manualSortOrder: configuration.primaryAxisManualSortOrder,
    formattedToRawLookup,
    getFieldValue: (item) => item.formattedValue,
    getNumericValue: (item) => item.aggregateValue,
    selectFieldOptions: selectOptions,
    fieldType: primaryAxisGroupByField.type,
    subFieldName: configuration.primaryAxisGroupBySubFieldName ?? undefined,
    dateGranularity: configuration.primaryAxisDateGranularity,
  });

  const limitedSortedData = sortedData.slice(
    0,
    BAR_CHART_MAXIMUM_NUMBER_OF_BARS,
  );

  const transformedData = configuration.isCumulative
    ? applyCumulativeToOneDimensionalBarData(limitedSortedData)
    : limitedSortedData;

  const secondSeriesValues = isDefined(secondSeriesRawResults)
    ? buildSecondSeriesValues({
        orderedRawDimensionValues: transformedData.map(
          ({ rawValue }) => rawValue,
        ),
        secondSeriesRawResults,
        isCumulative: configuration.isCumulative ?? false,
      })
    : undefined;

  const data = transformedData.map((item, index) => ({
    [indexByKey]: item.formattedValue,
    [aggregateValueKey]: item.aggregateValue,
    ...(isDefined(secondSeriesValues)
      ? { [CHART_SECOND_SERIES_KEY]: secondSeriesValues[index] }
      : {}),
  }));

  const series = [
    {
      key: aggregateValueKey,
      label: isNonEmptyString(configuration.seriesLabel)
        ? configuration.seriesLabel
        : aggregateField.label,
    },
  ];

  if (isDefined(secondSeriesValues)) {
    series.push({
      key: CHART_SECOND_SERIES_KEY,
      label: isNonEmptyString(configuration.secondSeriesLabel)
        ? configuration.secondSeriesLabel
        : CHART_SECOND_SERIES_DEFAULT_LABEL,
    });
  }

  const categoryLabel = primaryAxisGroupByField.label;
  const valueLabel = `${getAggregateOperationLabel(configuration.aggregateOperation)} of ${aggregateField.label}`;

  const xAxisLabel = isHorizontal ? valueLabel : categoryLabel;
  const yAxisLabel = isHorizontal ? categoryLabel : valueLabel;

  return {
    data,
    indexBy: indexByKey,
    keys: series.map(({ key }) => key),
    series,
    xAxisLabel,
    yAxisLabel,
    showLegend: configuration.displayLegend ?? true,
    showDataLabels: configuration.displayDataLabel ?? false,
    layout,
    groupMode: configuration.groupMode ?? BarChartGroupMode.GROUPED,
    hasTooManyGroups:
      filteredRawResults.length > BAR_CHART_MAXIMUM_NUMBER_OF_BARS ||
      dateRangeWasTruncated,
    formattedToRawLookup: buildFormattedToRawLookupDto({
      axisLookups: [{ formattedToRawLookup, relationLabelResolution }],
    }),
  };
};
