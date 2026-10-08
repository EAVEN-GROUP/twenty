import { computeDefaultDashboardCustomPeriod } from '@/page-layout/utils/computeDefaultDashboardCustomPeriod';
import { Temporal } from 'temporal-polyfill';

describe('computeDefaultDashboardCustomPeriod', () => {
  it('covers the last 7 days, today included', () => {
    expect(
      computeDefaultDashboardCustomPeriod({
        today: Temporal.PlainDate.from('2026-10-08'),
      }),
    ).toEqual({ from: '2026-10-02', to: '2026-10-08' });
  });

  it('crosses a month boundary', () => {
    expect(
      computeDefaultDashboardCustomPeriod({
        today: Temporal.PlainDate.from('2026-11-03'),
      }),
    ).toEqual({ from: '2026-10-28', to: '2026-11-03' });
  });
});
