import { RECORD_TABLE_HEADER_HEIGHT } from '@/object-record/record-table/constants/RecordTableHeaderHeight';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';

export const getRowSlotTop = (rowIndex: number) =>
  rowIndex * (RECORD_TABLE_ROW_HEIGHT + 1) + (RECORD_TABLE_HEADER_HEIGHT + 1);
