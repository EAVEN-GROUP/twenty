import { type PERSON_STATUS_VALUE } from '@/sales-pipeline/constants/PersonStatusValue';
import { type PersonOutcomeStatus } from '@/sales-pipeline/types/SalesPipelineFieldChange';

export type LeadCallOutcome =
  | PersonOutcomeStatus
  | typeof PERSON_STATUS_VALUE.NO_ANSWER
  | typeof PERSON_STATUS_VALUE.BOOKED;
