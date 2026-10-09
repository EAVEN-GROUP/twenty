import { type DashboardPeriodScopableChartConfiguration } from '@/page-layout/types/DashboardPeriodScopableChartConfiguration';
import { mergeDashboardPeriodIntoChartFilter } from '@/page-layout/utils/mergeDashboardPeriodIntoChartFilter';
import { hasChartSecondSeries } from '@/page-layout/widgets/graph/utils/hasChartSecondSeries';

type MergeDashboardPeriodIntoChartFilterParams = Parameters<
  typeof mergeDashboardPeriodIntoChartFilter
>[0];

type MergeDashboardPeriodIntoChartConfigurationParams<TConfiguration> = Omit<
  MergeDashboardPeriodIntoChartFilterParams,
  'chartFilter'
> & {
  configuration: TConfiguration;
};

export const mergeDashboardPeriodIntoChartConfiguration = <
  TConfiguration extends DashboardPeriodScopableChartConfiguration,
>({
  configuration,
  ...periodParams
}: MergeDashboardPeriodIntoChartConfigurationParams<TConfiguration>): TConfiguration => {
  const mergePeriodIntoChartFilter = (chartFilter: unknown) =>
    mergeDashboardPeriodIntoChartFilter({
      ...periodParams,
      chartFilter:
        chartFilter as MergeDashboardPeriodIntoChartFilterParams['chartFilter'],
    });

  // An empty second series filter must stay empty: adding the period rule to
  // it would switch the second series on.
  return {
    ...configuration,
    filter: mergePeriodIntoChartFilter(configuration.filter),
    ...(hasChartSecondSeries(configuration)
      ? {
          secondSeriesFilter: mergePeriodIntoChartFilter(
            configuration.secondSeriesFilter,
          ),
        }
      : {}),
  };
};
