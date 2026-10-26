import { getMaxCallAttempts } from '@/sales-pipeline/utils/getMaxCallAttempts';

describe('getMaxCallAttempts', () => {
  it('uses the configured value', () => {
    expect(getMaxCallAttempts(5)).toBe(5);
    expect(getMaxCallAttempts(1)).toBe(1);
  });

  it('falls back to 3 when the setting is missing or invalid', () => {
    expect(getMaxCallAttempts(undefined)).toBe(3);
    expect(getMaxCallAttempts(null)).toBe(3);
    expect(getMaxCallAttempts(0)).toBe(3);
    expect(getMaxCallAttempts('4')).toBe(3);
  });
});
