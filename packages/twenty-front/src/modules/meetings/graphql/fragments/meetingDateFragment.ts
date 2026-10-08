import { gql } from '@apollo/client';

export const MEETING_DATE_FRAGMENT = gql`
  fragment MeetingDateFragment on Meeting {
    meetingDate
  }
`;
