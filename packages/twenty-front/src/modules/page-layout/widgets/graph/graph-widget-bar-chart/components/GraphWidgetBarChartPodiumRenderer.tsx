import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GraphWidgetBarChartPodium } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChartPodium';
import { useGraphBarChartWidgetData } from '@/page-layout/widgets/graph/graph-widget-bar-chart/hooks/useGraphBarChartWidgetData';
import { computePodiumEntries } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computePodiumEntries';
import { computePodiumRosterLabels } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computePodiumRosterLabels';
import { removeStatusFilterFromChartFilter } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/removeStatusFilterFromChartFilter';
import { assertBarChartWidgetOrThrow } from '@/page-layout/widgets/graph/utils/assertBarChartWidget';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { BarChartGroupMode } from '~/generated-metadata/graphql';

const PODIUM_STATUS_FIELD_NAME = 'status';

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: 100%;
  justify-content: center;
  text-align: center;
`;

export const GraphWidgetBarChartPodiumRenderer = () => {
  const { t } = useLingui();
  const widget = useCurrentWidget();

  assertBarChartWidgetOrThrow(widget);

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: widget.objectMetadataId,
  });

  const statusField = objectMetadataItem.fields.find(
    (field) => field.name === PODIUM_STATUS_FIELD_NAME,
  );

  // The podium defines its own meaning of calls and meetings from the status
  // breakdown, so a status filter on the widget (for example "Booked") would
  // zero every other count.
  const statusFilterFreeConfiguration = useMemo(
    () => ({
      ...widget.configuration,
      filter: removeStatusFilterFromChartFilter({
        chartFilter: widget.configuration.filter ?? {},
        fieldMetadataIds: objectMetadataItem.fields.map((field) => field.id),
        statusFieldMetadataId: statusField?.id,
      }),
    }),
    [widget.configuration, objectMetadataItem.fields, statusField?.id],
  );

  const activityConfiguration = useMemo(
    () => ({
      ...statusFilterFreeConfiguration,
      secondaryAxisGroupByFieldMetadataId: statusField?.id,
      secondaryAxisGroupBySubFieldName: null,
      groupMode: BarChartGroupMode.STACKED,
    }),
    [statusFilterFreeConfiguration, statusField?.id],
  );

  const rosterConfiguration = useMemo(
    () => ({
      ...statusFilterFreeConfiguration,
      secondaryAxisGroupByFieldMetadataId: null,
      secondaryAxisGroupBySubFieldName: null,
    }),
    [statusFilterFreeConfiguration],
  );

  const {
    data,
    indexBy,
    keys,
    formattedToRawLookup,
    loading: isActivityLoading,
    error: activityError,
  } = useGraphBarChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: activityConfiguration,
  });

  // Every sales member is listed, so the roster ignores the period toggle:
  // anyone who owns at least one record counts, even without activity today.
  const {
    data: rosterData,
    indexBy: rosterIndexBy,
    formattedToRawLookup: rosterFormattedToRawLookup,
    loading: isRosterLoading,
    error: rosterError,
  } = useGraphBarChartWidgetData({
    objectMetadataItemId: widget.objectMetadataId,
    configuration: rosterConfiguration,
    shouldApplyDashboardPeriod: false,
  });

  if (!isDefined(statusField)) {
    return (
      <StyledEmptyState>
        {t`The podium needs an object with a Status field.`}
      </StyledEmptyState>
    );
  }

  if (isActivityLoading || isRosterLoading) {
    return <WidgetSkeletonLoader />;
  }

  const error = activityError ?? rosterError;

  if (isDefined(error)) {
    return <PageLayoutWidgetErrorDisplay widgetId={widget.id} error={error} />;
  }

  const entries = computePodiumEntries({
    data,
    indexBy,
    keys,
    formattedToRawLookup,
    rosterLabels: computePodiumRosterLabels({
      data: rosterData,
      indexBy: rosterIndexBy,
      formattedToRawLookup: rosterFormattedToRawLookup,
    }),
  });

  if (entries.length === 0) {
    return <StyledEmptyState>{t`No sales members yet`}</StyledEmptyState>;
  }

  return <GraphWidgetBarChartPodium entries={entries} />;
};
