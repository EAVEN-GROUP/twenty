import { computeRecordIndexStatCardPercentage } from '@/object-record/record-index/utils/computeRecordIndexStatCardPercentage';

describe('computeRecordIndexStatCardPercentage', () => {
  it('rounds the ratio to a whole percentage', () => {
    expect(
      computeRecordIndexStatCardPercentage({
        numerator: 158,
        denominator: 3387,
      }),
    ).toBe(5);
  });

  it('returns 0 instead of dividing by zero', () => {
    expect(
      computeRecordIndexStatCardPercentage({ numerator: 3, denominator: 0 }),
    ).toBe(0);
  });

  it('returns 100 when every record matches', () => {
    expect(
      computeRecordIndexStatCardPercentage({ numerator: 12, denominator: 12 }),
    ).toBe(100);
  });
});
