import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { msg } from '@lingui/core/macro';
import { IconTag } from 'twenty-ui/icon';

export const SERIES_LABEL_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconTag,
  label: CHART_CONFIGURATION_SETTING_LABELS.SERIES_LABEL,
  id: CHART_CONFIGURATION_SETTING_IDS.SERIES_LABEL,
  isTextInput: true,
  inputPlaceholder: msg`name`,
};
