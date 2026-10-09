import { CHART_SETTINGS_HEADINGS } from '@/side-panel/pages/page-layout/constants/ChartSettingsHeadings';
import { SECOND_SERIES_COLOR_SETTING } from '@/side-panel/pages/page-layout/constants/settings/SecondSeriesColorSetting';
import { SECOND_SERIES_FILTER_SETTING } from '@/side-panel/pages/page-layout/constants/settings/SecondSeriesFilterSetting';
import { SECOND_SERIES_LABEL_SETTING } from '@/side-panel/pages/page-layout/constants/settings/SecondSeriesLabelSetting';
import { SERIES_LABEL_SETTING } from '@/side-panel/pages/page-layout/constants/settings/SeriesLabelSetting';
import { type ChartSettingsGroup } from '@/side-panel/pages/page-layout/types/ChartSettingsGroup';

export const SERIES_CHART_SETTINGS: ChartSettingsGroup = {
  heading: CHART_SETTINGS_HEADINGS.SERIES,
  items: [
    SERIES_LABEL_SETTING,
    SECOND_SERIES_FILTER_SETTING,
    SECOND_SERIES_LABEL_SETTING,
    SECOND_SERIES_COLOR_SETTING,
  ],
};
