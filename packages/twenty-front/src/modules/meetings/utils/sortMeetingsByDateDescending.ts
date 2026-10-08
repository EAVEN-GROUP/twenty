import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const sortMeetingsByDateDescending = (meetings: ObjectRecord[]) =>
  [...meetings].sort((firstMeeting, secondMeeting) => {
    if (!isDefined(firstMeeting.meetingDate)) {
      return isDefined(secondMeeting.meetingDate) ? 1 : 0;
    }

    if (!isDefined(secondMeeting.meetingDate)) {
      return -1;
    }

    return (
      Date.parse(secondMeeting.meetingDate) -
      Date.parse(firstMeeting.meetingDate)
    );
  });
