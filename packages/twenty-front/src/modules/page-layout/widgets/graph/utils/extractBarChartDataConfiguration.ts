import { type BarChartConfiguration } from '~/generated-metadata/graphql';

type BarChartStyleFields =
  | 'displayDataLabel'
  | 'displayLegend'
  | 'axisNameDisplay'
  | 'description'
  | 'color'
  | 'secondSeriesColor'
  | 'displayAsPodium';

export type BarChartDataConfiguration = Omit<
  BarChartConfiguration,
  BarChartStyleFields
>;

export const extractBarChartDataConfiguration = (
  configuration: BarChartConfiguration,
): BarChartDataConfiguration => {
  const {
    displayDataLabel: _displayDataLabel,
    displayLegend: _displayLegend,
    axisNameDisplay: _axisNameDisplay,
    description: _description,
    color: _color,
    secondSeriesColor: _secondSeriesColor,
    displayAsPodium: _displayAsPodium,
    ...dataConfiguration
  } = configuration;

  return dataConfiguration;
};
