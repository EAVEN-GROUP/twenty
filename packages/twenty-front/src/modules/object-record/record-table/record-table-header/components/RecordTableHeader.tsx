import { RECORD_TABLE_HEADER_HEIGHT } from '@/object-record/record-table/constants/RecordTableHeaderHeight';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDnd } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDnd';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderFirstCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderFirstCell';
import { useResizeTableHeader } from '@/object-record/record-table/record-table-header/hooks/useResizeTableHeader';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// The header takes the first slot of the virtualized row grid, which is offset
// by RECORD_TABLE_HEADER_HEIGHT + 1 (header plus its bottom border).
const StyledHeaderContainer = styled.div`
  background-color: ${themeCssVariables.background.tertiary};
  box-shadow: 0 -1px 0 ${themeCssVariables.background.tertiary};
  display: flex;
  flex-direction: row;
  height: ${RECORD_TABLE_HEADER_HEIGHT + 1}px;
  position: sticky;
  top: 0;
  z-index: ${TABLE_Z_INDEX.headerRow};
`;

export const RecordTableHeader = () => {
  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden =
    useIsRecordTableCheckboxColumnHidden();

  useResizeTableHeader();

  return (
    <StyledHeaderContainer>
      {!isRecordTableDragColumnHidden && <RecordTableHeaderDragDropColumn />}
      {!isRecordTableCheckboxColumnHidden && (
        <RecordTableHeaderCheckboxColumn />
      )}
      <RecordTableHeaderFirstCell />
      <RecordTableHeaderDnd />
    </StyledHeaderContainer>
  );
};
