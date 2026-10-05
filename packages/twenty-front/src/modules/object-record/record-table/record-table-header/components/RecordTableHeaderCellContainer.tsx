import { RECORD_TABLE_HEADER_HEIGHT } from '@/object-record/record-table/constants/RecordTableHeaderHeight';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeaderCell = styled.div<{
  zIndex?: number;
  shouldDisplayBorderBottom: boolean;
  isResizing: boolean;
  isReadOnly: boolean;
}>`
  background-color: ${themeCssVariables.background.tertiary};
  border-bottom: ${({ shouldDisplayBorderBottom }) =>
    shouldDisplayBorderBottom
      ? `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};

  color: ${themeCssVariables.font.color.tertiary};

  cursor: ${({ isResizing, isReadOnly }) =>
    isReadOnly ? 'default' : isResizing ? 'col-resize' : 'pointer'};
  height: ${RECORD_TABLE_HEADER_HEIGHT}px;

  max-height: ${RECORD_TABLE_HEADER_HEIGHT}px;
  padding: 0;

  position: relative;

  text-align: left;

  @media (hover: hover) {
    &:hover {
      background: ${({ isResizing, isReadOnly }) =>
        isReadOnly || isResizing
          ? themeCssVariables.background.tertiary
          : themeCssVariables.background.quaternary};
    }
  }

  &:active {
    background: ${({ isResizing, isReadOnly }) =>
      isReadOnly || isResizing
        ? themeCssVariables.background.tertiary
        : themeCssVariables.background.quaternary};
  }

  user-select: none;

  z-index: ${({ zIndex }) => zIndex ?? 'auto'};
`;

export const RecordTableHeaderCellContainer = StyledHeaderCell;
