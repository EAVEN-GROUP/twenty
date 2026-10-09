import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { IconFilter } from 'twenty-ui/icon';

export const SECOND_SERIES_FILTER_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconFilter,
  label: CHART_CONFIGURATION_SETTING_LABELS.SECOND_SERIES_FILTER,
  id: CHART_CONFIGURATION_SETTING_IDS.SECOND_SERIES_FILTER,
  dependsOn: [CHART_CONFIGURATION_SETTING_IDS.SOURCE],
};
