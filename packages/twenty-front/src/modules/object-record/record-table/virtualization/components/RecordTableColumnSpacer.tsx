import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { RECORD_TABLE_ROW_TINT_CSS_VARIABLE } from '@/object-record/record-table/constants/RecordTableRowTintCssVariable';

const StyledColumnSpacer = styled.div<{ hasBottomBorder: boolean }>`
  background-color: var(
    ${RECORD_TABLE_ROW_TINT_CSS_VARIABLE},
    ${themeCssVariables.background.primary}
  );
  border-bottom: ${({ hasBottomBorder }) =>
    hasBottomBorder
      ? `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  flex-shrink: 0;
`;

export const RecordTableColumnSpacer = ({
  width,
  hasBottomBorder = false,
}: {
  width: number;
  hasBottomBorder?: boolean;
}) => (
  <StyledColumnSpacer hasBottomBorder={hasBottomBorder} style={{ width }} />
);
