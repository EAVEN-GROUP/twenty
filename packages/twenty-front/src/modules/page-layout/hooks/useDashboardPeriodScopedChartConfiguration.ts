import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { DASHBOARD_PERIOD_DATE_FIELD_NAME_BY_OBJECT_NAME_SINGULAR } from '@/page-layout/constants/DashboardPeriodDateFieldNameByObjectNameSingular';
import { pageLayoutCustomPeriodComponentState } from '@/page-layout/states/pageLayoutCustomPeriodComponentState';
import { pageLayoutPeriodComponentState } from '@/page-layout/states/pageLayoutPeriodComponentState';
import { type DashboardPeriodScopableChartConfiguration } from '@/page-layout/types/DashboardPeriodScopableChartConfiguration';
import { mergeDashboardPeriodIntoChartConfiguration } from '@/page-layout/utils/mergeDashboardPeriodIntoChartConfiguration';
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
  TConfiguration extends DashboardPeriodScopableChartConfiguration,
>({
  objectMetadataItemId,
  configuration,
  shouldApplyDashboardPeriod = true,
}: UseDashboardPeriodScopedChartConfigurationParams<TConfiguration>): TConfiguration => {
  const pageLayoutPeriod = useAtomComponentStateValue(
    pageLayoutPeriodComponentState,
  );

  const pageLayoutCustomPeriod = useAtomComponentStateValue(
    pageLayoutCustomPeriodComponentState,
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

    return mergeDashboardPeriodIntoChartConfiguration({
      configuration,
      period: pageLayoutPeriod,
      dateField: { id: dateField.id, type: dateField.type },
      timezone,
      customPeriod: pageLayoutCustomPeriod,
    });
  }, [
    configuration,
    dateField,
    pageLayoutCustomPeriod,
    pageLayoutPeriod,
    shouldApplyDashboardPeriod,
    timezone,
  ]);
};
