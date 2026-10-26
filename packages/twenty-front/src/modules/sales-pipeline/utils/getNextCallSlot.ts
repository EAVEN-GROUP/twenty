import { DEFAULT_AFTERNOON_CALL_HOUR } from '@/sales-pipeline/constants/DefaultAfternoonCallHour';
import { DEFAULT_MORNING_CALL_HOUR } from '@/sales-pipeline/constants/DefaultMorningCallHour';
import { addWorkingDays } from '@/sales-pipeline/utils/addWorkingDays';
import { type Temporal } from 'temporal-polyfill';

const NOON_HOUR = 13;

// Retries alternate morning and afternoon so a lead busy at one time of day still gets reached.
export const getNextCallSlot = (now: Temporal.ZonedDateTime) =>
  addWorkingDays({
    from: now,
    workingDays: 1,
    hour:
      now.hour < NOON_HOUR
        ? DEFAULT_AFTERNOON_CALL_HOUR
        : DEFAULT_MORNING_CALL_HOUR,
  });
