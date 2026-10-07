import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { DASHBOARD_PERIOD_DATE_FIELD_NAME_BY_OBJECT_NAME_SINGULAR } from '@/page-layout/constants/DashboardPeriodDateFieldNameByObjectNameSingular';
import { pageLayoutPeriodComponentState } from '@/page-layout/states/pageLayoutPeriodComponentState';
import { mergeDashboardPeriodIntoChartFilter } from '@/page-layout/utils/mergeDashboardPeriodIntoChartFilter';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseDashboardPeriodScopedChartConfigurationParams<TConfiguration> = {
  objectMetadataItemId: string;
  configuration: TConfiguration;
  shouldApplyDashboardPeriod?: boolean;
};

export const useDashboardPeriodScopedChartConfiguration = <
  TConfiguration extends { filter?: unknown; timezone?: string | null },
>({
  objectMetadataItemId,
  configuration,
  shouldApplyDashboardPeriod = true,
}: UseDashboardPeriodScopedChartConfigurationParams<TConfiguration>): TConfiguration => {
  const pageLayoutPeriod = useAtomComponentStateValue(
    pageLayoutPeriodComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const { userTimezone } = useUserTimezone();

  const dateFieldName =
    DASHBOARD_PERIOD_DATE_FIELD_NAME_BY_OBJECT_NAME_SINGULAR[
      objectMetadataItem.nameSingular
    ];

  const dateField = objectMetadataItem.fields.find(
    (field) => field.name === dateFieldName,
  );

  const timezone = configuration.timezone ?? userTimezone;

  return useMemo(() => {
    if (
      !shouldApplyDashboardPeriod ||
      pageLayoutPeriod === 'ALL' ||
      !isDefined(dateField)
    ) {
      return configuration;
    }

    return {
      ...configuration,
      filter: mergeDashboardPeriodIntoChartFilter({
        chartFilter: configuration.filter as Parameters<
          typeof mergeDashboardPeriodIntoChartFilter
        >[0]['chartFilter'],
        period: pageLayoutPeriod,
        dateField: { id: dateField.id, type: dateField.type },
        timezone,
      }),
    };
  }, [
    configuration,
    dateField,
    pageLayoutPeriod,
    shouldApplyDashboardPeriod,
    timezone,
  ]);
};
