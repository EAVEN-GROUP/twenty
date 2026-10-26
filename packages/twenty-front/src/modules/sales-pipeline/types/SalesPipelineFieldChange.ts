import { type MEETING_STATUS_VALUE } from '@/sales-pipeline/constants/MeetingStatusValue';
import { type OPPORTUNITY_STATUS_VALUE } from '@/sales-pipeline/constants/OpportunityStatusValue';
import { type PERSON_STATUS_VALUE } from '@/sales-pipeline/constants/PersonStatusValue';

export type PersonOutcomeStatus =
  | typeof PERSON_STATUS_VALUE.FOLLOW_UP
  | typeof PERSON_STATUS_VALUE.SEND_INFO
  | typeof PERSON_STATUS_VALUE.NOT_BOOKED;

export type OpportunityOutcomeStatus =
  | typeof OPPORTUNITY_STATUS_VALUE.NEGOTIATION
  | typeof OPPORTUNITY_STATUS_VALUE.CONTRACT_SENT
  | typeof OPPORTUNITY_STATUS_VALUE.LOST;

export type MeetingOutcomeStatus =
  | typeof MEETING_STATUS_VALUE.COMPLETED
  | typeof MEETING_STATUS_VALUE.NO_SHOW;

export type SalesPipelineFieldChange =
  | { type: 'missedCall'; previousStatus: unknown }
  | { type: 'personOutcome'; status: PersonOutcomeStatus }
  | { type: 'booked' }
  | { type: 'unreachable' }
  | { type: 'opportunityOutcome'; status: OpportunityOutcomeStatus }
  | { type: 'opportunityWon' }
  | { type: 'opportunityMeeting' }
  | { type: 'meetingOutcome'; status: MeetingOutcomeStatus };
