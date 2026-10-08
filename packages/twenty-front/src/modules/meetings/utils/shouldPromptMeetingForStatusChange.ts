import { PERSON_BOOKED_STATUS_VALUE } from '@/meetings/constants/PersonBookedStatusValue';
import { PERSON_STATUS_FIELD_NAME } from '@/meetings/constants/PersonStatusFieldName';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const shouldPromptMeetingForStatusChange = ({
  objectNameSingular,
  fieldName,
  previousValue,
  nextValue,
}: {
  objectNameSingular: string;
  fieldName: string;
  previousValue: unknown;
  nextValue: unknown;
}) =>
  objectNameSingular === CoreObjectNameSingular.Person &&
  fieldName === PERSON_STATUS_FIELD_NAME &&
  nextValue === PERSON_BOOKED_STATUS_VALUE &&
  previousValue !== PERSON_BOOKED_STATUS_VALUE;
