import { type LineChartConfiguration } from '~/generated-metadata/graphql';

type LineChartStyleFields =
  | 'displayDataLabel'
  | 'displayLegend'
  | 'axisNameDisplay'
  | 'description'
  | 'color'
  | 'secondSeriesColor';

export type LineChartDataConfiguration = Omit<
  LineChartConfiguration,
  LineChartStyleFields
>;

export const extractLineChartDataConfiguration = (
  configuration: LineChartConfiguration,
): LineChartDataConfiguration => {
  const {
    displayDataLabel: _displayDataLabel,
    displayLegend: _displayLegend,
    axisNameDisplay: _axisNameDisplay,
    description: _description,
    color: _color,
    secondSeriesColor: _secondSeriesColor,
    ...dataConfiguration
  } = configuration;

  return dataConfiguration;
};
