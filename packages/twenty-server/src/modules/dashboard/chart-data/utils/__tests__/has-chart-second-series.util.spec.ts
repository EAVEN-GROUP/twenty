import { hasChartSecondSeries } from 'src/modules/dashboard/chart-data/utils/has-chart-second-series.util';

const secondSeriesFilter = {
  recordFilters: [{ fieldMetadataId: 'status-field-id', operand: 'IS' }],
};

describe('hasChartSecondSeries', () => {
  it('should be true when the second series filter has at least one rule', () => {
    expect(hasChartSecondSeries({ secondSeriesFilter })).toBe(true);
  });

  it('should be false when the second series filter is missing or empty', () => {
    expect(hasChartSecondSeries({})).toBe(false);
    expect(hasChartSecondSeries({ secondSeriesFilter: null })).toBe(false);
    expect(
      hasChartSecondSeries({ secondSeriesFilter: { recordFilters: [] } }),
    ).toBe(false);
  });

  it('should be false when the chart is already grouped on its secondary axis', () => {
    expect(
      hasChartSecondSeries({
        secondSeriesFilter,
        secondaryAxisGroupByFieldMetadataId: 'owner-field-id',
      }),
    ).toBe(false);
  });
});
