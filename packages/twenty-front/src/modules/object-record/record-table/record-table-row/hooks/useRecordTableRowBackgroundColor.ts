import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { type FieldSelectMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Opportunities are tinted by their Status so the pipeline stage is readable at a glance in the table, not just in the cell chip.
const ROW_BACKGROUND_COLOR_OBJECT_NAME_SINGULAR = 'opportunity';
const ROW_BACKGROUND_COLOR_FIELD_NAME = 'status';

const EMPTY_FIELD_DEFINITION = {
  type: FieldMetadataType.TEXT,
  metadata: { fieldName: '' },
};

export const useRecordTableRowBackgroundColor = (
  recordId: string,
): string | undefined => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const colorFieldMetadataItem =
    objectMetadataItem.nameSingular ===
    ROW_BACKGROUND_COLOR_OBJECT_NAME_SINGULAR
      ? objectMetadataItem.fields.find(
          (field) => field.name === ROW_BACKGROUND_COLOR_FIELD_NAME,
        )
      : undefined;

  const fieldDefinition = isDefined(colorFieldMetadataItem)
    ? formatFieldMetadataItemAsFieldDefinition({
        field: colorFieldMetadataItem,
        objectMetadataItem,
      })
    : EMPTY_FIELD_DEFINITION;

  const fieldValue = useRecordFieldValue<string>(
    recordId,
    colorFieldMetadataItem?.name ?? '',
    fieldDefinition,
  );

  if (!isDefined(colorFieldMetadataItem)) {
    return undefined;
  }

  const selectedOption = (
    fieldDefinition as typeof fieldDefinition & {
      metadata: FieldSelectMetadata;
    }
  ).metadata.options?.find((option) => option.value === fieldValue);

  if (!isDefined(selectedOption)) {
    return undefined;
  }

  return themeCssVariables.tag.background[selectedOption.color];
};
