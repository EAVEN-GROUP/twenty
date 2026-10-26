import { doNotTranslate } from 'twenty-shared/i18n';

export const OPPORTUNITY_STATUS_VALUE = doNotTranslate({
  MEETING_SCHEDULED: 'MEETING_SCHEDULED',
  NEGOTIATION: 'NEGOTIATION',
  CONTRACT_SENT: 'CONTRACT_SENT',
  WON: 'WON',
  LOST: 'LOST',
} as const);
