import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useDashboardPeriodScopedChartConfiguration } from '@/page-layout/hooks/useDashboardPeriodScopedChartConfiguration';
import { dropChartRecordFiltersWithDeletedFields } from '@/side-panel/pages/page-layout/utils/dropChartRecordFiltersWithDeletedFields';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  computeRecordGqlOperationFilter,
  isDefined,
} from 'twenty-shared/utils';
import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';

export const useGraphWidgetQueryCommon = ({
  objectMetadataItemId,
  configuration,
}: {
  objectMetadataItemId: string;
  configuration:
    | BarChartConfiguration
    | AggregateChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const periodScopedConfiguration = useDashboardPeriodScopedChartConfiguration({
    objectMetadataItemId,
    configuration,
  });

  const aggregateFieldId = configuration.aggregateFieldMetadataId;

  const aggregateField = objectMetadataItem.readableFields.find(
    (field: { id: string }) => field.id === aggregateFieldId,
  );

  if (!isDefined(aggregateField)) {
    throw new Error('Aggregate field not found');
  }

  const { filterValueDependencies } = useFilterValueDependencies();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const objectFieldMetadataIds = new Set(
    objectMetadataItem.fields
      .filter((field) => field.isActive)
      .map((field) => field.id),
  );

  const { recordFilters: sanitizedRecordFilters } =
    dropChartRecordFiltersWithDeletedFields({
      chartFilters: periodScopedConfiguration.filter ?? {},
      validFieldMetadataIds: objectFieldMetadataIds,
    });

  const gqlOperationFilter = computeRecordGqlOperationFilter({
    fieldMetadataItems: flattenedFieldMetadataItems,
    filterValueDependencies,
    recordFilters: sanitizedRecordFilters ?? [],
    recordFilterGroups:
      periodScopedConfiguration.filter?.recordFilterGroups ?? [],
  });

  return {
    objectMetadataItem,
    gqlOperationFilter,
    aggregateField,
  };
};
