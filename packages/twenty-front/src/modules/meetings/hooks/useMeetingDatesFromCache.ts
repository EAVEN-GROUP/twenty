import { MEETING_DATE_FRAGMENT } from '@/meetings/graphql/fragments/meetingDateFragment';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFragment } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

type MeetingDateFragmentData = { meetingDate?: string | null };

// The record store copy of a person's meetings is replaced by real-time update
// events that only carry id and name, so the date is read from the Apollo cache,
// which keeps the full meeting entities up to date.
export const useMeetingDatesFromCache = (meetingIds: string[]) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data } = useFragment<MeetingDateFragmentData>({
    client: apolloCoreClient,
    fragment: MEETING_DATE_FRAGMENT,
    from: meetingIds.map((meetingId) => ({
      __typename: 'Meeting',
      id: meetingId,
    })),
  });

  const meetingDateById = new Map<string, string>();

  meetingIds.forEach((meetingId, index) => {
    const meetingDate = data?.[index]?.meetingDate;

    if (isDefined(meetingDate)) {
      meetingDateById.set(meetingId, meetingDate);
    }
  });

  return { meetingDateById };
};
