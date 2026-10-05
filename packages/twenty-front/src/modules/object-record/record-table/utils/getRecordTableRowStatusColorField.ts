import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { RECORD_TABLE_ROW_STATUS_COLOR_FIELD_NAME } from '@/object-record/record-table/constants/RecordTableRowStatusColorFieldName';
import { RECORD_TABLE_ROW_STATUS_COLOR_OBJECT_NAMES_SINGULAR } from '@/object-record/record-table/constants/RecordTableRowStatusColorObjectNamesSingular';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRecordTableRowStatusColorField = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  if (
    !RECORD_TABLE_ROW_STATUS_COLOR_OBJECT_NAMES_SINGULAR.includes(
      objectMetadataItem.nameSingular,
    )
  ) {
    return undefined;
  }

  const statusFieldMetadataItem = objectMetadataItem.fields.find(
    (field) =>
      field.name === RECORD_TABLE_ROW_STATUS_COLOR_FIELD_NAME &&
      field.type === FieldMetadataType.SELECT,
  );

  if (!isDefined(statusFieldMetadataItem)) {
    return undefined;
  }

  const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: statusFieldMetadataItem,
    objectMetadataItem,
  });

  return { statusFieldMetadataItem, fieldDefinition };
};
