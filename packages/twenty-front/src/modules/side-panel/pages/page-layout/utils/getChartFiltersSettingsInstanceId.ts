import { type ChartFilterConfigKey } from '@/side-panel/pages/page-layout/types/ChartFilterConfigKey';

export const getChartFiltersSettingsInstanceId = ({
  widgetId,
  objectMetadataItemId,
  filterConfigKey = 'filter',
}: {
  widgetId: string;
  objectMetadataItemId: string;
  filterConfigKey?: ChartFilterConfigKey;
}) => {
  const widgetInstanceId = `chart-filters-widget-${widgetId}-${objectMetadataItemId}`;

  const instanceId =
    filterConfigKey === 'filter'
      ? widgetInstanceId
      : `${widgetInstanceId}-second-series`;

  return {
    instanceId,
  };
};
