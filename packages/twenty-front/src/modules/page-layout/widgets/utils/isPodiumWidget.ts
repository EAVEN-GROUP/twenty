import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';

export const isPodiumWidget = (widget: PageLayoutWidget): boolean =>
  isWidgetConfigurationOfType(widget.configuration, 'BarChartConfiguration') &&
  widget.configuration.displayAsPodium === true;
