import { applyDashboardCustomPeriodBoundary } from '@/page-layout/utils/applyDashboardCustomPeriodBoundary';

describe('applyDashboardCustomPeriodBoundary', () => {
  it('sets the start date', () => {
    expect(
      applyDashboardCustomPeriodBoundary({
        customPeriod: { from: '2026-10-01', to: '2026-10-07' },
        boundary: 'from',
        value: '2026-10-03',
      }),
    ).toEqual({ from: '2026-10-03', to: '2026-10-07' });
  });

  it('moves the end date when the start passes it', () => {
    expect(
      applyDashboardCustomPeriodBoundary({
        customPeriod: { from: '2026-10-01', to: '2026-10-07' },
        boundary: 'from',
        value: '2026-10-20',
      }),
    ).toEqual({ from: '2026-10-20', to: '2026-10-20' });
  });

  it('moves the start date when the end falls before it', () => {
    expect(
      applyDashboardCustomPeriodBoundary({
        customPeriod: { from: '2026-10-05', to: '2026-10-07' },
        boundary: 'to',
        value: '2026-10-02',
      }),
    ).toEqual({ from: '2026-10-02', to: '2026-10-02' });
  });

  it('clears a date when the field is emptied', () => {
    expect(
      applyDashboardCustomPeriodBoundary({
        customPeriod: { from: '2026-10-05', to: '2026-10-07' },
        boundary: 'to',
        value: '',
      }),
    ).toEqual({ from: '2026-10-05', to: null });
  });

  it('keeps an open end when only the start is set', () => {
    expect(
      applyDashboardCustomPeriodBoundary({
        customPeriod: { from: null, to: null },
        boundary: 'from',
        value: '2026-10-05',
      }),
    ).toEqual({ from: '2026-10-05', to: null });
  });
});
