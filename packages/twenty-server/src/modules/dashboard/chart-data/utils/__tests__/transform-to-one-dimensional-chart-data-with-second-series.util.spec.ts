import { CalendarStartDay } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { type LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { CHART_SECOND_SERIES_KEY } from 'src/modules/dashboard/chart-data/constants/chart-second-series-key.constant';
import { type GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { addMissingChartBuckets } from 'src/modules/dashboard/chart-data/utils/add-missing-chart-buckets.util';
import { transformToOneDimensionalBarChartData } from 'src/modules/dashboard/chart-data/utils/transform-to-one-dimensional-bar-chart-data.util';
import { transformToOneDimensionalLineChartData } from 'src/modules/dashboard/chart-data/utils/transform-to-one-dimensional-line-chart-data.util';

const callDateField = {
  type: FieldMetadataType.TEXT,
  name: 'callDay',
  label: 'Call day',
} as FlatFieldMetadata;

const aggregateField = {
  type: FieldMetadataType.FULL_NAME,
  name: 'name',
  label: 'Name',
} as FlatFieldMetadata;

const answeredCallsRawResults: GroupByRawResult[] = [
  { groupByDimensionValues: ['2026-10-03'], aggregateValue: 7 },
  { groupByDimensionValues: ['2026-10-01'], aggregateValue: 12 },
];

const meetingsRawResults: GroupByRawResult[] = [
  { groupByDimensionValues: ['2026-10-02'], aggregateValue: 2 },
  { groupByDimensionValues: ['2026-10-03'], aggregateValue: 1 },
];

const filteredRawResults = addMissingChartBuckets({
  rawResults: answeredCallsRawResults,
  rawResultsWithExtraBuckets: meetingsRawResults,
});

const baseConfiguration = {
  primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
  omitNullValues: true,
  seriesLabel: 'Answered calls',
  secondSeriesLabel: 'Meetings',
};

const transformLine = (
  configuration: Partial<LineChartConfigurationDTO> = {},
  { hasSecondSeries = true }: { hasSecondSeries?: boolean } = {},
) =>
  transformToOneDimensionalLineChartData({
    filteredRawResults,
    primaryAxisGroupByField: callDateField,
    aggregateField,
    configuration: {
      ...baseConfiguration,
      ...configuration,
    } as LineChartConfigurationDTO,
    userTimezone: 'UTC',
    firstDayOfTheWeek: CalendarStartDay.MONDAY,
    seriesIdPrefix: 'lc_test:',
    relationLabelResolution: undefined,
    secondSeriesRawResults: hasSecondSeries ? meetingsRawResults : undefined,
  });

const transformBar = (
  configuration: Partial<BarChartConfigurationDTO> = {},
  { hasSecondSeries = true }: { hasSecondSeries?: boolean } = {},
) =>
  transformToOneDimensionalBarChartData({
    filteredRawResults,
    primaryAxisGroupByField: callDateField,
    aggregateField,
    configuration: {
      ...baseConfiguration,
      ...configuration,
    } as BarChartConfigurationDTO,
    userTimezone: 'UTC',
    firstDayOfTheWeek: CalendarStartDay.MONDAY,
    relationLabelResolution: undefined,
    secondSeriesRawResults: hasSecondSeries ? meetingsRawResults : undefined,
  });

describe('transformToOneDimensionalLineChartData with a second series', () => {
  it('should return both series on the same sorted buckets', () => {
    const result = transformLine();

    expect(result.series).toEqual([
      {
        key: 'lc_test:name',
        label: 'Answered calls',
        data: [
          { x: '2026-10-01', y: 12 },
          { x: '2026-10-02', y: 0 },
          { x: '2026-10-03', y: 7 },
        ],
      },
      {
        key: `lc_test:${CHART_SECOND_SERIES_KEY}`,
        label: 'Meetings',
        data: [
          { x: '2026-10-01', y: 0 },
          { x: '2026-10-02', y: 2 },
          { x: '2026-10-03', y: 1 },
        ],
      },
    ]);
  });

  it('should accumulate each series on its own', () => {
    const result = transformLine({ isCumulative: true });

    expect(result.series.map(({ data }) => data.map(({ y }) => y))).toEqual([
      [12, 12, 19],
      [0, 2, 3],
    ]);
  });

  it('should order the second series like the first when sorting by value', () => {
    const result = transformLine({
      primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
    });

    expect(result.series.map(({ data }) => data.map(({ x }) => x))).toEqual([
      ['2026-10-01', '2026-10-03', '2026-10-02'],
      ['2026-10-01', '2026-10-03', '2026-10-02'],
    ]);
    expect(result.series[1].data.map(({ y }) => y)).toEqual([0, 1, 2]);
  });

  it('should keep a single series, named after the field, without a second series', () => {
    const result = transformLine(
      { seriesLabel: undefined },
      { hasSecondSeries: false },
    );

    expect(result.series).toHaveLength(1);
    expect(result.series[0].label).toBe('Name');
  });

  it('should fall back to a default name for an unnamed second series', () => {
    const result = transformLine({ secondSeriesLabel: '' });

    expect(result.series[1].label).toBe('Series 2');
  });
});

describe('transformToOneDimensionalBarChartData with a second series', () => {
  it('should return one bar per series for every bucket', () => {
    const result = transformBar();

    expect(result.keys).toEqual(['name', CHART_SECOND_SERIES_KEY]);
    expect(result.series).toEqual([
      { key: 'name', label: 'Answered calls' },
      { key: CHART_SECOND_SERIES_KEY, label: 'Meetings' },
    ]);
    expect(result.data).toEqual([
      { callDay: '2026-10-01', name: 12, [CHART_SECOND_SERIES_KEY]: 0 },
      { callDay: '2026-10-02', name: 0, [CHART_SECOND_SERIES_KEY]: 2 },
      { callDay: '2026-10-03', name: 7, [CHART_SECOND_SERIES_KEY]: 1 },
    ]);
  });

  it('should accumulate each series on its own', () => {
    const result = transformBar({ isCumulative: true });

    expect(result.data).toEqual([
      { callDay: '2026-10-01', name: 12, [CHART_SECOND_SERIES_KEY]: 0 },
      { callDay: '2026-10-02', name: 12, [CHART_SECOND_SERIES_KEY]: 2 },
      { callDay: '2026-10-03', name: 19, [CHART_SECOND_SERIES_KEY]: 3 },
    ]);
  });

  it('should keep a single key without a second series', () => {
    const result = transformBar({}, { hasSecondSeries: false });

    expect(result.keys).toEqual(['name']);
    expect(result.data[0]).toEqual({ callDay: '2026-10-01', name: 12 });
  });
});
