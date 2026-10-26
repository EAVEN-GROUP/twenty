import { DEFAULT_MAX_CALL_ATTEMPTS } from '@/sales-pipeline/constants/DefaultMaxCallAttempts';
import { isNumber } from '@sniptt/guards';

export const getMaxCallAttempts = (maxCallAttempts: unknown) =>
  isNumber(maxCallAttempts) && maxCallAttempts >= 1
    ? Math.floor(maxCallAttempts)
    : DEFAULT_MAX_CALL_ATTEMPTS;
