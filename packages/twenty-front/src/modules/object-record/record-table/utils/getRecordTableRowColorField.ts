import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { RECORD_TABLE_ROW_COLOR_FIELD_NAME } from '@/object-record/record-table/constants/RecordTableRowColorFieldName';
import { RECORD_TABLE_ROW_COLOR_OBJECT_NAME_SINGULAR } from '@/object-record/record-table/constants/RecordTableRowColorObjectNameSingular';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRecordTableRowColorField = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  if (
    objectMetadataItem.nameSingular !==
    RECORD_TABLE_ROW_COLOR_OBJECT_NAME_SINGULAR
  ) {
    return undefined;
  }

  const colorFieldMetadataItem = objectMetadataItem.fields.find(
    (field) =>
      field.name === RECORD_TABLE_ROW_COLOR_FIELD_NAME &&
      field.type === FieldMetadataType.TEXT,
  );

  if (!isDefined(colorFieldMetadataItem)) {
    return undefined;
  }

  const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: colorFieldMetadataItem,
    objectMetadataItem,
  });

  return { colorFieldMetadataItem, fieldDefinition };
};
