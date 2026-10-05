import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { getRecordTableRowStatusColorField } from '@/object-record/record-table/utils/getRecordTableRowStatusColorField';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const EMPTY_FIELD_DEFINITION = {
  type: FieldMetadataType.TEXT,
  metadata: { fieldName: '' },
};

export const useRecordTableRowStatusColor = (recordId: string) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const statusColorField =
    getRecordTableRowStatusColorField(objectMetadataItem);

  const fieldValue = useRecordFieldValue<string>(
    recordId,
    statusColorField?.statusFieldMetadataItem.name ?? '',
    statusColorField?.fieldDefinition ?? EMPTY_FIELD_DEFINITION,
  );

  if (!isDefined(statusColorField)) {
    return { statusColor: undefined };
  }

  const selectedOption = statusColorField.statusFieldMetadataItem.options?.find(
    (option) => option.value === fieldValue,
  );

  // Gray marks a neutral status (like "To call"), so those rows stay white.
  return {
    statusColor:
      selectedOption?.color === 'gray' ? undefined : selectedOption?.color,
  };
};
