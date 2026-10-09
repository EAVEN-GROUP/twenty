import { addMissingChartBuckets } from 'src/modules/dashboard/chart-data/utils/add-missing-chart-buckets.util';

describe('addMissingChartBuckets', () => {
  it('should append, at zero, the buckets that only the other results have', () => {
    const result = addMissingChartBuckets({
      rawResults: [
        { groupByDimensionValues: ['2026-10-01'], aggregateValue: 12 },
        { groupByDimensionValues: ['2026-10-03'], aggregateValue: 7 },
      ],
      rawResultsWithExtraBuckets: [
        { groupByDimensionValues: ['2026-10-02'], aggregateValue: 2 },
        { groupByDimensionValues: ['2026-10-03'], aggregateValue: 1 },
      ],
    });

    expect(result).toEqual([
      { groupByDimensionValues: ['2026-10-01'], aggregateValue: 12 },
      { groupByDimensionValues: ['2026-10-03'], aggregateValue: 7 },
      { groupByDimensionValues: ['2026-10-02'], aggregateValue: 0 },
    ]);
  });

  it('should treat a null bucket as a bucket of its own', () => {
    const result = addMissingChartBuckets({
      rawResults: [{ groupByDimensionValues: ['Omar'], aggregateValue: 4 }],
      rawResultsWithExtraBuckets: [
        { groupByDimensionValues: [null], aggregateValue: 3 },
        { groupByDimensionValues: [null], aggregateValue: 1 },
      ],
    });

    expect(result).toEqual([
      { groupByDimensionValues: ['Omar'], aggregateValue: 4 },
      { groupByDimensionValues: [null], aggregateValue: 0 },
    ]);
  });

  it('should return the results unchanged when nothing is missing', () => {
    const rawResults = [
      { groupByDimensionValues: ['Omar'], aggregateValue: 4 },
    ];

    expect(
      addMissingChartBuckets({ rawResults, rawResultsWithExtraBuckets: [] }),
    ).toEqual(rawResults);
  });
});
