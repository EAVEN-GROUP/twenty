import { sortMeetingsByDateDescending } from '@/meetings/utils/sortMeetingsByDateDescending';

const buildMeeting = (id: string, meetingDate?: string | null) => ({
  id,
  __typename: 'Meeting',
  meetingDate,
});

describe('sortMeetingsByDateDescending', () => {
  it('puts the most recent meeting first and undated meetings last', () => {
    const meetings = [
      buildMeeting('undated', null),
      buildMeeting('older', '2026-10-01T09:00:00Z'),
      buildMeeting('newer', '2026-10-20T09:00:00Z'),
      buildMeeting('missing'),
    ];

    expect(sortMeetingsByDateDescending(meetings).map(({ id }) => id)).toEqual([
      'newer',
      'older',
      'undated',
      'missing',
    ]);
  });

  it('does not mutate the input', () => {
    const meetings = [
      buildMeeting('older', '2026-10-01T09:00:00Z'),
      buildMeeting('newer', '2026-10-20T09:00:00Z'),
    ];

    sortMeetingsByDateDescending(meetings);

    expect(meetings.map(({ id }) => id)).toEqual(['older', 'newer']);
  });
});
