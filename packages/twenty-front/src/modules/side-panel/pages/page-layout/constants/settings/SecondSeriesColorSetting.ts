import { ChartSecondSeriesColorSelectionDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ChartSecondSeriesColorSelectionDropdownContent';
import { CHART_CONFIGURATION_SETTING_LABELS } from '@/side-panel/pages/page-layout/constants/settings/ChartConfigurationSettingLabels';
import { CHART_CONFIGURATION_SETTING_IDS } from '@/side-panel/pages/page-layout/types/ChartConfigurationSettingIds';
import { type ChartSettingsItem } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { IconColorSwatch } from 'twenty-ui/icon';

export const SECOND_SERIES_COLOR_SETTING: ChartSettingsItem = {
  isBoolean: false,
  Icon: IconColorSwatch,
  label: CHART_CONFIGURATION_SETTING_LABELS.SECOND_SERIES_COLOR,
  id: CHART_CONFIGURATION_SETTING_IDS.SECOND_SERIES_COLOR,
  DropdownContent: ChartSecondSeriesColorSelectionDropdownContent,
  dropdownWidth: GenericDropdownContentWidth.ExtraLarge,
};
