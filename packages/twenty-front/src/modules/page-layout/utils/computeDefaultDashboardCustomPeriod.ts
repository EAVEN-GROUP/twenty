import { type DashboardCustomPeriod } from '@/page-layout/types/DashboardCustomPeriod';
import { type Temporal } from 'temporal-polyfill';

const DEFAULT_CUSTOM_PERIOD_LENGTH_IN_DAYS = 7;

export const computeDefaultDashboardCustomPeriod = ({
  today,
}: {
  today: Temporal.PlainDate;
}): DashboardCustomPeriod => ({
  from: today
    .subtract({ days: DEFAULT_CUSTOM_PERIOD_LENGTH_IN_DAYS - 1 })
    .toString(),
  to: today.toString(),
});
