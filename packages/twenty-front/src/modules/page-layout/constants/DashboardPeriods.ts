import { type DashboardPeriod } from '@/page-layout/types/DashboardPeriod';
import { doNotTranslate } from 'twenty-shared/i18n';

export const DASHBOARD_PERIODS: DashboardPeriod[] = [
  'TODAY',
  'WEEK',
  'MONTH',
  doNotTranslate('ALL'),
  'CUSTOM',
];
