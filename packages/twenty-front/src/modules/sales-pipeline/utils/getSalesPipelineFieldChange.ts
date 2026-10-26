import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { MEETING_STATUS_VALUE } from '@/sales-pipeline/constants/MeetingStatusValue';
import { OPPORTUNITY_STATUS_VALUE } from '@/sales-pipeline/constants/OpportunityStatusValue';
import { PERSON_STATUS_VALUE } from '@/sales-pipeline/constants/PersonStatusValue';
import { type SalesPipelineFieldChange } from '@/sales-pipeline/types/SalesPipelineFieldChange';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const STATUS_FIELD_NAME = 'status';

const getPersonStatusChange = (
  previousValue: unknown,
  nextValue: unknown,
): SalesPipelineFieldChange | null => {
  // Picking No answer again on a No answer lead is how a rep logs another missed call.
  if (nextValue === PERSON_STATUS_VALUE.NO_ANSWER) {
    return { type: 'missedCall', previousStatus: previousValue };
  }

  if (previousValue === nextValue) {
    return null;
  }

  switch (nextValue) {
    case PERSON_STATUS_VALUE.FOLLOW_UP:
    case PERSON_STATUS_VALUE.SEND_INFO:
    case PERSON_STATUS_VALUE.NOT_BOOKED:
      return { type: 'personOutcome', status: nextValue };
    case PERSON_STATUS_VALUE.BOOKED:
      return { type: 'booked' };
    case PERSON_STATUS_VALUE.UNREACHABLE:
      return { type: 'unreachable' };
    default:
      return null;
  }
};

const getOpportunityStatusChange = (
  previousValue: unknown,
  nextValue: unknown,
): SalesPipelineFieldChange | null => {
  if (previousValue === nextValue) {
    return null;
  }

  switch (nextValue) {
    case OPPORTUNITY_STATUS_VALUE.NEGOTIATION:
    case OPPORTUNITY_STATUS_VALUE.CONTRACT_SENT:
    case OPPORTUNITY_STATUS_VALUE.LOST:
      return { type: 'opportunityOutcome', status: nextValue };
    case OPPORTUNITY_STATUS_VALUE.WON:
      return { type: 'opportunityWon' };
    case OPPORTUNITY_STATUS_VALUE.MEETING_SCHEDULED:
      return { type: 'opportunityMeeting' };
    default:
      return null;
  }
};

const getMeetingStatusChange = (
  previousValue: unknown,
  nextValue: unknown,
): SalesPipelineFieldChange | null => {
  if (previousValue === nextValue) {
    return null;
  }

  switch (nextValue) {
    case MEETING_STATUS_VALUE.COMPLETED:
    case MEETING_STATUS_VALUE.NO_SHOW:
      return { type: 'meetingOutcome', status: nextValue };
    default:
      return null;
  }
};

export const getSalesPipelineFieldChange = ({
  objectNameSingular,
  fieldName,
  previousValue,
  nextValue,
}: {
  objectNameSingular: string;
  fieldName: string;
  previousValue: unknown;
  nextValue: unknown;
}): SalesPipelineFieldChange | null => {
  if (fieldName !== STATUS_FIELD_NAME) {
    return null;
  }

  switch (objectNameSingular) {
    case CoreObjectNameSingular.Person:
      return getPersonStatusChange(previousValue, nextValue);
    case CoreObjectNameSingular.Opportunity:
      return getOpportunityStatusChange(previousValue, nextValue);
    case MEETING_OBJECT_NAME_SINGULAR:
      return getMeetingStatusChange(previousValue, nextValue);
    default:
      return null;
  }
};
