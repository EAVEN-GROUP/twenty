import { type DashboardCustomPeriod } from '@/page-layout/types/DashboardCustomPeriod';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type ApplyDashboardCustomPeriodBoundaryParams = {
  customPeriod: DashboardCustomPeriod;
  boundary: keyof DashboardCustomPeriod;
  value: string;
};

// Plain dates are ISO strings, so comparing them as strings keeps their order.
export const applyDashboardCustomPeriodBoundary = ({
  customPeriod,
  boundary,
  value,
}: ApplyDashboardCustomPeriodBoundaryParams): DashboardCustomPeriod => {
  const boundaryValue = isNonEmptyString(value) ? value : null;

  if (boundary === 'from') {
    const isAfterEnd =
      isDefined(boundaryValue) &&
      isDefined(customPeriod.to) &&
      boundaryValue > customPeriod.to;

    return {
      from: boundaryValue,
      to: isAfterEnd ? boundaryValue : customPeriod.to,
    };
  }

  const isBeforeStart =
    isDefined(boundaryValue) &&
    isDefined(customPeriod.from) &&
    boundaryValue < customPeriod.from;

  return {
    from: isBeforeStart ? boundaryValue : customPeriod.from,
    to: boundaryValue,
  };
};
