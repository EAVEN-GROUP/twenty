import { getChartFiltersSettingsInstanceId } from '@/side-panel/pages/page-layout/utils/getChartFiltersSettingsInstanceId';

describe('getChartFiltersSettingsInstanceId', () => {
  it('keeps the historical instance id for the main filter', () => {
    expect(
      getChartFiltersSettingsInstanceId({
        widgetId: 'widget-id',
        objectMetadataItemId: 'object-id',
      }).instanceId,
    ).toBe('chart-filters-widget-widget-id-object-id');
  });

  it('gives the second series filter an instance id of its own', () => {
    const mainFilter = getChartFiltersSettingsInstanceId({
      widgetId: 'widget-id',
      objectMetadataItemId: 'object-id',
      filterConfigKey: 'filter',
    });

    const secondSeriesFilter = getChartFiltersSettingsInstanceId({
      widgetId: 'widget-id',
      objectMetadataItemId: 'object-id',
      filterConfigKey: 'secondSeriesFilter',
    });

    expect(secondSeriesFilter.instanceId).not.toBe(mainFilter.instanceId);
  });
});
