import { cx } from '@linaria/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { RECORD_TABLE_ROW_TINT_CSS_VARIABLE } from '@/object-record/record-table/constants/RecordTableRowTintCssVariable';

const StyledCell = styled.div`
  background: var(
    ${RECORD_TABLE_ROW_TINT_CSS_VARIABLE},
    ${themeCssVariables.background.primary}
  );
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.primary};
  padding: 0;
  text-align: left;

  &[data-selected] {
    background: ${themeCssVariables.accent.quaternary};
  }

  &[data-without-right-border] {
    border-right: none;
  }

  &[data-without-bottom-border] {
    border-bottom-color: transparent;
  }

  &[data-dragging] {
    background: transparent;
    border-bottom-color: transparent;
  }
`;

export const RecordTableCellStyleWrapper = ({
  children,
  isSelected,
  isDragging,
  hasRightBorder = false,
  hasBottomBorder = true,
  widthClassName,
  ...divProps
}: {
  className?: string;
  children?: ReactNode;
  isSelected?: boolean;
  isDragging?: boolean;
  hasRightBorder?: boolean;
  hasBottomBorder?: boolean;
  widthClassName: string;
} & React.ComponentProps<'div'>) => {
  return (
    <StyledCell
      data-selected={isSelected || undefined}
      data-dragging={isDragging || undefined}
      data-without-right-border={!hasRightBorder || undefined}
      data-without-bottom-border={!hasBottomBorder || undefined}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...divProps}
      className={cx('table-cell', widthClassName)}
    >
      {children}
    </StyledCell>
  );
};
