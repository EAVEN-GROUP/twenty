import { useRecordTableRowColor } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowColor';
import { useRecordTableRowStatusColor } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowStatusColor';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const useRecordTableRowBackgroundColor = (
  recordId: string,
): string | undefined => {
  const { selectedColor } = useRecordTableRowColor(recordId);
  const { statusColor } = useRecordTableRowStatusColor(recordId);

  const rowColor = selectedColor ?? statusColor;

  if (!isDefined(rowColor)) {
    return undefined;
  }

  // The full tag tint is too loud across a whole row, so blend it with white.
  return `color-mix(in srgb, ${themeCssVariables.tag.background[rowColor]} 45%, ${themeCssVariables.background.primary})`;
};
