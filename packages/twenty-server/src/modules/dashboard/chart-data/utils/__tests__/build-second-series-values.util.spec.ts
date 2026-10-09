import { buildSecondSeriesValues } from 'src/modules/dashboard/chart-data/utils/build-second-series-values.util';

const secondSeriesRawResults = [
  { groupByDimensionValues: ['2026-10-03'], aggregateValue: 1 },
  { groupByDimensionValues: ['2026-10-01'], aggregateValue: 2 },
];

describe('buildSecondSeriesValues', () => {
  it('should follow the bucket order it is given and use zero for missing buckets', () => {
    expect(
      buildSecondSeriesValues({
        orderedRawDimensionValues: ['2026-10-01', '2026-10-02', '2026-10-03'],
        secondSeriesRawResults,
        isCumulative: false,
      }),
    ).toEqual([2, 0, 1]);
  });

  it('should accumulate along the bucket order when cumulative', () => {
    expect(
      buildSecondSeriesValues({
        orderedRawDimensionValues: ['2026-10-01', '2026-10-02', '2026-10-03'],
        secondSeriesRawResults,
        isCumulative: true,
      }),
    ).toEqual([2, 2, 3]);
  });

  it('should match the null bucket', () => {
    expect(
      buildSecondSeriesValues({
        orderedRawDimensionValues: [null, 'Omar'],
        secondSeriesRawResults: [
          { groupByDimensionValues: [null], aggregateValue: 5 },
        ],
        isCumulative: false,
      }),
    ).toEqual([5, 0]);
  });
});
