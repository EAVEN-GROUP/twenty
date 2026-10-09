import { hasChartSecondSeries } from '@/page-layout/widgets/graph/utils/hasChartSecondSeries';

const secondSeriesFilter = {
  recordFilters: [{ fieldMetadataId: 'status-field-id', operand: 'IS' }],
};

describe('hasChartSecondSeries', () => {
  it('is true when the second series filter has at least one rule', () => {
    expect(hasChartSecondSeries({ secondSeriesFilter })).toBe(true);
  });

  it('is false when the second series filter is missing or has no rule', () => {
    expect(hasChartSecondSeries({})).toBe(false);
    expect(hasChartSecondSeries({ secondSeriesFilter: null })).toBe(false);
    expect(
      hasChartSecondSeries({ secondSeriesFilter: { recordFilters: [] } }),
    ).toBe(false);
  });

  it('is false when the chart is grouped on its secondary axis', () => {
    expect(
      hasChartSecondSeries({
        secondSeriesFilter,
        secondaryAxisGroupByFieldMetadataId: 'owner-field-id',
      }),
    ).toBe(false);
  });
});
