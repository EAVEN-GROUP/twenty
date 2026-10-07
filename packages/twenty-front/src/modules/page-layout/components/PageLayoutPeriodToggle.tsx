import { DASHBOARD_PERIODS } from '@/page-layout/constants/DashboardPeriods';
import { pageLayoutPeriodComponentState } from '@/page-layout/states/pageLayoutPeriodComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]} 0;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-right: ${themeCssVariables.spacing[1]};
`;

const StyledButton = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.background.invertedPrimary
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isActive }) =>
      isActive
        ? themeCssVariables.background.invertedPrimary
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.inverted
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[1.5]} ${themeCssVariables.spacing[3]};

  &:hover {
    border-color: ${({ isActive }) =>
      isActive
        ? themeCssVariables.background.invertedPrimary
        : themeCssVariables.border.color.strong};
  }
`;

export const PageLayoutPeriodToggle = () => {
  const { t } = useLingui();

  const [pageLayoutPeriod, setPageLayoutPeriod] = useAtomComponentState(
    pageLayoutPeriodComponentState,
  );

  const labelByPeriod = {
    TODAY: t`Today`,
    WEEK: t`Week`,
    MONTH: t`Month`,
    ALL: t`All`,
  };

  return (
    <StyledRow>
      <StyledLabel>{t`Period:`}</StyledLabel>
      {DASHBOARD_PERIODS.map((dashboardPeriod) => (
        <StyledButton
          key={dashboardPeriod}
          type="button"
          isActive={dashboardPeriod === pageLayoutPeriod}
          aria-pressed={dashboardPeriod === pageLayoutPeriod}
          onClick={() => setPageLayoutPeriod(dashboardPeriod)}
        >
          {labelByPeriod[dashboardPeriod]}
        </StyledButton>
      ))}
    </StyledRow>
  );
};
