import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { getRecordTableRowColorField } from '@/object-record/record-table/utils/getRecordTableRowColorField';
import { FieldMetadataType } from 'twenty-shared/types';
import { MAIN_COLOR_NAMES } from 'twenty-ui/theme';

const EMPTY_FIELD_DEFINITION = {
  type: FieldMetadataType.TEXT,
  metadata: { fieldName: '' },
};

export const useRecordTableRowColor = (recordId: string) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const colorField = getRecordTableRowColorField(objectMetadataItem);

  const fieldValue = useRecordFieldValue<string>(
    recordId,
    colorField?.colorFieldMetadataItem.name ?? '',
    colorField?.fieldDefinition ?? EMPTY_FIELD_DEFINITION,
  );

  const selectedColor = MAIN_COLOR_NAMES.find(
    (colorName) => colorName === fieldValue,
  );

  return { selectedColor };
};
