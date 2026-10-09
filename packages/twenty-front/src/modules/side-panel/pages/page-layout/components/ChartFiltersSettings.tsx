import { ChartFiltersDeletedFieldsWarning } from '@/side-panel/pages/page-layout/components/ChartFiltersDeletedFieldsWarning';
import { ChartFiltersSettingsInitializeStateEffect } from '@/side-panel/pages/page-layout/components/ChartFiltersSettingsInitializeStateEffect';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { type ChartFilterConfigKey } from '@/side-panel/pages/page-layout/types/ChartFilterConfigKey';
import { type ChartWidget } from '@/side-panel/pages/page-layout/types/ChartWidget';
import { cloneChartFiltersWithNewIds } from '@/side-panel/pages/page-layout/utils/cloneChartFiltersWithNewIds';
import { dropChartRecordFiltersWithDeletedFields } from '@/side-panel/pages/page-layout/utils/dropChartRecordFiltersWithDeletedFields';
import { getChartFiltersSettingsInstanceId } from '@/side-panel/pages/page-layout/utils/getChartFiltersSettingsInstanceId';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { AdvancedFilterSidePanelContainer } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelContainer';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { hasChartSecondSeries } from '@/page-layout/widgets/graph/utils/hasChartSecondSeries';
import { InputLabel } from 'twenty-ui/input';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledChartFiltersPageContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${themeCssVariables.spacing[2]};

  padding: ${themeCssVariables.spacing[3]};
`;

export type ChartFiltersSettingsProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  widget: ChartWidget;
  filterConfigKey?: ChartFilterConfigKey;
};

export const ChartFiltersSettings = ({
  objectMetadataItem,
  widget,
  filterConfigKey = 'filter',
}: ChartFiltersSettingsProps) => {
  const { instanceId } = getChartFiltersSettingsInstanceId({
    widgetId: widget.id,
    objectMetadataItemId: objectMetadataItem.id,
    filterConfigKey,
  });

  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const currentRecordFilters = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
    instanceId,
  );

  const currentRecordFilterGroups = useAtomComponentStateCallbackState(
    currentRecordFilterGroupsComponentState,
    instanceId,
  );

  const store = useStore();
  const chartWidgetConfiguration = widget.configuration;

  const validFieldMetadataIds = useMemo(
    () =>
      new Set(
        objectMetadataItem.fields
          .filter((fieldMetadataItem) => fieldMetadataItem.isActive)
          .map((fieldMetadataItem) => fieldMetadataItem.id),
      ),
    [objectMetadataItem.fields],
  );

  const handleFiltersUpdate = () => {
    const existingRecordFilters = store.get(currentRecordFilters);
    const existingRecordFilterGroups = store.get(currentRecordFilterGroups);

    const {
      recordFilters: sanitizedRecordFilters,
      recordFilterGroups: sanitizedRecordFilterGroups,
    } = dropChartRecordFiltersWithDeletedFields({
      chartFilters: {
        recordFilters: existingRecordFilters,
        recordFilterGroups: existingRecordFilterGroups,
      },
      validFieldMetadataIds,
    });

    updateCurrentWidgetConfig({
      objectMetadataId: objectMetadataItem.id,
      configToUpdate: {
        [filterConfigKey]: {
          recordFilters: sanitizedRecordFilters,
          recordFilterGroups: sanitizedRecordFilterGroups,
        },
      },
    });
  };

  const isBarOrLineChart =
    isWidgetConfigurationOfType(
      chartWidgetConfiguration,
      'BarChartConfiguration',
    ) ||
    isWidgetConfigurationOfType(
      chartWidgetConfiguration,
      'LineChartConfiguration',
    );

  const savedSecondSeriesFilter =
    isBarOrLineChart && hasChartSecondSeries(chartWidgetConfiguration)
      ? chartWidgetConfiguration.secondSeriesFilter
      : undefined;

  const mainChartFilter = chartWidgetConfiguration.filter;

  // A new second series starts from a copy of the main filter, so shared rules
  // such as the owner do not have to be rebuilt by hand.
  const initialChartFilters = useMemo(() => {
    if (filterConfigKey === 'filter') {
      return mainChartFilter;
    }

    if (isDefined(savedSecondSeriesFilter)) {
      return savedSecondSeriesFilter;
    }

    return isDefined(mainChartFilter)
      ? cloneChartFiltersWithNewIds(mainChartFilter)
      : undefined;
  }, [filterConfigKey, mainChartFilter, savedSecondSeriesFilter]);

  return (
    <StyledChartFiltersPageContainer>
      <div>
        <InputLabel>{t`Conditions`}</InputLabel>
        <RecordFilterGroupsComponentInstanceContext.Provider
          value={{ instanceId }}
        >
          <RecordFiltersComponentInstanceContext.Provider
            value={{ instanceId }}
          >
            <ChartFiltersDeletedFieldsWarning
              validFieldMetadataIds={validFieldMetadataIds}
            />
            <AdvancedFilterSidePanelContainer
              onUpdate={handleFiltersUpdate}
              objectMetadataItem={objectMetadataItem}
              isWorkflowFindRecords={false}
            />
            <ChartFiltersSettingsInitializeStateEffect
              initialChartFilters={initialChartFilters}
            />
          </RecordFiltersComponentInstanceContext.Provider>
        </RecordFilterGroupsComponentInstanceContext.Provider>
      </div>
    </StyledChartFiltersPageContainer>
  );
};
