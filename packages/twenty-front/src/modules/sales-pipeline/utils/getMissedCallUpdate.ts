import { PERSON_STATUS_VALUE } from '@/sales-pipeline/constants/PersonStatusValue';
import { getNextCallSlot } from '@/sales-pipeline/utils/getNextCallSlot';
import { isNumber } from '@sniptt/guards';
import { type Temporal } from 'temporal-polyfill';

export type MissedCallUpdate = {
  status:
    | typeof PERSON_STATUS_VALUE.NO_ANSWER
    | typeof PERSON_STATUS_VALUE.UNREACHABLE;
  callAttempts: number;
  callDate: string;
  nextCallAt: string | null;
};

export const getMissedCallUpdate = ({
  previousStatus,
  callAttempts,
  callDate,
  now,
  maxCallAttempts,
}: {
  previousStatus: unknown;
  callAttempts: unknown;
  callDate: unknown;
  now: Temporal.ZonedDateTime;
  maxCallAttempts: number;
}): MissedCallUpdate | null => {
  const today = now.toPlainDate().toString();
  const isAlreadyMissed = previousStatus === PERSON_STATUS_VALUE.NO_ANSWER;

  // Only one attempt per day counts, so three attempts always span three days.
  if (isAlreadyMissed && callDate === today) {
    return null;
  }

  const previousAttempts =
    isAlreadyMissed && isNumber(callAttempts) ? callAttempts : 0;
  const nextAttempts = previousAttempts + 1;

  if (nextAttempts >= maxCallAttempts) {
    return {
      status: PERSON_STATUS_VALUE.UNREACHABLE,
      callAttempts: nextAttempts,
      callDate: today,
      nextCallAt: null,
    };
  }

  return {
    status: PERSON_STATUS_VALUE.NO_ANSWER,
    callAttempts: nextAttempts,
    callDate: today,
    nextCallAt: getNextCallSlot(now).toInstant().toString(),
  };
};
