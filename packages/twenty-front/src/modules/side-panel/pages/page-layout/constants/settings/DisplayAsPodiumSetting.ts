import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { IconListNumbers } from 'twenty-ui/icon';

export const DISPLAY_AS_PODIUM_SETTING: ChartSettingsItem = {
  isBoolean: true,
  Icon: IconListNumbers,
  label: CHART_CONFIGURATION_SETTING_LABELS.DISPLAY_AS_PODIUM,
  id: CHART_CONFIGURATION_SETTING_IDS.DISPLAY_AS_PODIUM,
};
