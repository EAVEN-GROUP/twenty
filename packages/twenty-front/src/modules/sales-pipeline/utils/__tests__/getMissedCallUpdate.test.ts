import { getMissedCallUpdate } from '@/sales-pipeline/utils/getMissedCallUpdate';
import { Temporal } from 'temporal-polyfill';

// Tuesday morning.
const now = Temporal.ZonedDateTime.from(
  '2026-10-27T09:30:00+01:00[Europe/Rome]',
);

describe('getMissedCallUpdate', () => {
  it('starts at one attempt and schedules the next call in the afternoon', () => {
    expect(
      getMissedCallUpdate({
        previousStatus: 'TO_CALL',
        callAttempts: 0,
        callDate: null,
        now,
        maxCallAttempts: 3,
      }),
    ).toEqual({
      status: 'NO_ANSWER',
      callAttempts: 1,
      callDate: '2026-10-27',
      nextCallAt: '2026-10-28T14:00:00Z',
    });
  });

  it('restarts the count when the lead had answered before', () => {
    expect(
      getMissedCallUpdate({
        previousStatus: 'FOLLOW_UP',
        callAttempts: 2,
        callDate: '2026-10-20',
        now,
        maxCallAttempts: 3,
      })?.callAttempts,
    ).toBe(1);
  });

  it('adds an attempt on a later day', () => {
    expect(
      getMissedCallUpdate({
        previousStatus: 'NO_ANSWER',
        callAttempts: 1,
        callDate: '2026-10-26',
        now,
        maxCallAttempts: 3,
      })?.callAttempts,
    ).toBe(2);
  });

  it('ignores a second missed call on the same day', () => {
    expect(
      getMissedCallUpdate({
        previousStatus: 'NO_ANSWER',
        callAttempts: 1,
        callDate: '2026-10-27',
        now,
        maxCallAttempts: 3,
      }),
    ).toBeNull();
  });

  it('marks the lead unreachable on the third attempt', () => {
    expect(
      getMissedCallUpdate({
        previousStatus: 'NO_ANSWER',
        callAttempts: 2,
        callDate: '2026-10-26',
        now,
        maxCallAttempts: 3,
      }),
    ).toEqual({
      status: 'UNREACHABLE',
      callAttempts: 3,
      callDate: '2026-10-27',
      nextCallAt: null,
    });
  });

  it('follows the configured number of attempts', () => {
    const missedCall = {
      previousStatus: 'NO_ANSWER',
      callAttempts: 2,
      callDate: '2026-10-26',
      now,
    };

    expect(
      getMissedCallUpdate({ ...missedCall, maxCallAttempts: 5 })?.status,
    ).toBe('NO_ANSWER');
    expect(
      getMissedCallUpdate({
        ...missedCall,
        callAttempts: 4,
        maxCallAttempts: 5,
      })?.status,
    ).toBe('UNREACHABLE');
    expect(
      getMissedCallUpdate({
        ...missedCall,
        previousStatus: 'TO_CALL',
        maxCallAttempts: 1,
      })?.status,
    ).toBe('UNREACHABLE');
  });

  it('schedules a Friday afternoon miss for Monday morning', () => {
    const fridayAfternoon = Temporal.ZonedDateTime.from(
      '2026-10-30T16:00:00+01:00[Europe/Rome]',
    );

    expect(
      getMissedCallUpdate({
        previousStatus: 'TO_CALL',
        callAttempts: null,
        callDate: null,
        now: fridayAfternoon,
        maxCallAttempts: 3,
      })?.nextCallAt,
    ).toBe('2026-11-02T09:00:00Z');
  });
});
