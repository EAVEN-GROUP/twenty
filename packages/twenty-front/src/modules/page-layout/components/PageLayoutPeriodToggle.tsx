import { PageLayoutPeriodDatePicker } from '@/page-layout/components/PageLayoutPeriodDatePicker';
import { DASHBOARD_PERIODS } from '@/page-layout/constants/DashboardPeriods';
import { pageLayoutCustomPeriodComponentState } from '@/page-layout/states/pageLayoutCustomPeriodComponentState';
import { pageLayoutPeriodComponentState } from '@/page-layout/states/pageLayoutPeriodComponentState';
import { type DashboardPeriod } from '@/page-layout/types/DashboardPeriod';
import { applyDashboardCustomPeriodBoundary } from '@/page-layout/utils/applyDashboardCustomPeriodBoundary';
import { computeDefaultDashboardCustomPeriod } from '@/page-layout/utils/computeDefaultDashboardCustomPeriod';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRow = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
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

const StyledRangeSeparator = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: ${themeCssVariables.spacing[2]};
`;

export const PageLayoutPeriodToggle = () => {
  const { t } = useLingui();
  const { userTimezone } = useUserTimezone();

  const [pageLayoutPeriod, setPageLayoutPeriod] = useAtomComponentState(
    pageLayoutPeriodComponentState,
  );

  const [pageLayoutCustomPeriod, setPageLayoutCustomPeriod] =
    useAtomComponentState(pageLayoutCustomPeriodComponentState);

  const labelByPeriod = {
    TODAY: t`Today`,
    WEEK: t`Week`,
    MONTH: t`Month`,
    ALL: t`All`,
    CUSTOM: t`Custom`,
  };

  const handleSelectPeriod = (dashboardPeriod: DashboardPeriod) => {
    const hasNoCustomPeriod =
      !isDefined(pageLayoutCustomPeriod.from) &&
      !isDefined(pageLayoutCustomPeriod.to);

    if (dashboardPeriod === 'CUSTOM' && hasNoCustomPeriod) {
      setPageLayoutCustomPeriod(
        computeDefaultDashboardCustomPeriod({
          today: Temporal.Now.plainDateISO(userTimezone),
        }),
      );
    }

    setPageLayoutPeriod(dashboardPeriod);
  };

  const handleBoundaryChange =
    (boundary: 'from' | 'to') => (value: string | null) => {
      setPageLayoutCustomPeriod(
        applyDashboardCustomPeriodBoundary({
          customPeriod: pageLayoutCustomPeriod,
          boundary,
          value: value ?? '',
        }),
      );
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
          onClick={() => handleSelectPeriod(dashboardPeriod)}
        >
          {labelByPeriod[dashboardPeriod]}
        </StyledButton>
      ))}
      {pageLayoutPeriod === 'CUSTOM' && (
        <StyledRangeSeparator>
          <StyledLabel>{t`From`}</StyledLabel>
          <PageLayoutPeriodDatePicker
            dropdownId="page-layout-period-from-date-dropdown"
            ariaLabel={t`Start date`}
            value={pageLayoutCustomPeriod.from}
            onChange={handleBoundaryChange('from')}
          />
          <StyledLabel>{t`To`}</StyledLabel>
          <PageLayoutPeriodDatePicker
            dropdownId="page-layout-period-to-date-dropdown"
            ariaLabel={t`End date`}
            value={pageLayoutCustomPeriod.to}
            onChange={handleBoundaryChange('to')}
          />
        </StyledRangeSeparator>
      )}
    </StyledRow>
  );
};
