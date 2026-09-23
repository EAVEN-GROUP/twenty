import { useRecordTableRowColor } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowColor';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const useRecordTableRowBackgroundColor = (
  recordId: string,
): string | undefined => {
  const { selectedColor } = useRecordTableRowColor(recordId);

  if (!isDefined(selectedColor)) {
    return undefined;
  }

  return themeCssVariables.tag.background[selectedColor];
};
