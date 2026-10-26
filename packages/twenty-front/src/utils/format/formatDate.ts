import { i18n } from '@lingui/core';
import { parseDate } from '~/utils/date-utils';

export const formatToHumanReadableMonth = (
  date: Date | string,
  timeZone: string,
) => {
  const parsedJSDate = parseDate(date);

  return new Intl.DateTimeFormat(i18n.locale, {
    month: 'short',
    timeZone: timeZone,
  }).format(parsedJSDate);
};

export const formatToHumanReadableDay = (
  date: Date | string,
  timeZone: string,
) => {
  const parsedJSDate = parseDate(date);

  return new Intl.DateTimeFormat(i18n.locale, {
    day: 'numeric',
    timeZone: timeZone,
  }).format(parsedJSDate);
};

export const formatToHumanReadableTime = (
  date: Date | string,
  timeZone: string,
) => {
  const parsedJSDate = parseDate(date);

  return new Intl.DateTimeFormat(i18n.locale, {
    hour: 'numeric',
    minute: 'numeric',
    timeZone: timeZone,
  }).format(parsedJSDate);
};
