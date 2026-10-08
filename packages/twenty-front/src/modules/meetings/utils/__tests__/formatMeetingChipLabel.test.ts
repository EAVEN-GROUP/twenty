import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { formatMeetingChipLabel } from '@/meetings/utils/formatMeetingChipLabel';
import { enUS } from 'date-fns/locale';

const NOW = new Date('2026-10-08T10:00:00Z');

const baseArgs = {
  meetingDate: '2026-10-15T13:30:00Z',
  timeZone: 'Europe/Rome',
  dateFormat: DateFormat.DAY_FIRST,
  timeFormat: TimeFormat.HOUR_24,
  localeCatalog: enUS,
  now: NOW,
};

describe('formatMeetingChipLabel', () => {
  it('omits the year for a meeting in the current year', () => {
    expect(formatMeetingChipLabel(baseArgs)).toBe('15 Oct 15:30');
  });

  it('keeps the year for a meeting in another year', () => {
    expect(
      formatMeetingChipLabel({
        ...baseArgs,
        meetingDate: '2027-01-12T09:00:00Z',
      }),
    ).toBe('12 Jan, 2027 10:00');
  });

  it('follows the month-first date format', () => {
    expect(
      formatMeetingChipLabel({
        ...baseArgs,
        dateFormat: DateFormat.MONTH_FIRST,
      }),
    ).toBe('Oct 15 15:30');
  });

  it('follows the year-first date format', () => {
    expect(
      formatMeetingChipLabel({
        ...baseArgs,
        dateFormat: DateFormat.YEAR_FIRST,
      }),
    ).toBe('Oct 15 15:30');
  });

  it('follows the 12 hour time format', () => {
    expect(
      formatMeetingChipLabel({ ...baseArgs, timeFormat: TimeFormat.HOUR_12 }),
    ).toBe('15 Oct 3:30 PM');
  });

  it('computes the current year in the user time zone', () => {
    expect(
      formatMeetingChipLabel({
        ...baseArgs,
        meetingDate: '2026-12-31T23:30:00Z',
        now: new Date('2026-06-01T00:00:00Z'),
        timeZone: 'Pacific/Auckland',
      }),
    ).toBe('1 Jan, 2027 12:30');
  });

  it('returns an empty label for an invalid date', () => {
    expect(formatMeetingChipLabel({ ...baseArgs, meetingDate: 'nope' })).toBe(
      '',
    );
  });
});
