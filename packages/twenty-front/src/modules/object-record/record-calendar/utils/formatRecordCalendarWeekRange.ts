import { format, type Locale } from 'date-fns';
import { type Temporal } from 'temporal-polyfill';
import { turnPlainDateToShiftedDateInSystemTimeZone } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

type FormatRecordCalendarWeekRangeArgs = {
  firstDayOfWeek: Temporal.PlainDate;
  lastDayOfWeek: Temporal.PlainDate;
  locale: Locale;
};

const isDayFirstLocale = (locale: Locale) => {
  const partTypes = new Intl.DateTimeFormat(locale.code)
    .formatToParts(new Date(2000, 0, 31))
    .map(({ type }) => type);

  return partTypes.indexOf('day') < partTypes.indexOf('month');
};

export const formatRecordCalendarWeekRange = ({
  firstDayOfWeek,
  lastDayOfWeek,
  locale,
}: FormatRecordCalendarWeekRangeArgs) => {
  const firstDay = turnPlainDateToShiftedDateInSystemTimeZone(firstDayOfWeek);
  const lastDay = turnPlainDateToShiftedDateInSystemTimeZone(lastDayOfWeek);
  const formatOptions = { locale };
  const isDayFirst = isDayFirstLocale(locale);

  const fullDatePattern = doNotTranslate(
    isDayFirst ? 'd MMM yyyy' : 'MMM d, yyyy',
  );
  const shortDatePattern = doNotTranslate(isDayFirst ? 'd MMM' : 'MMM d');

  if (firstDayOfWeek.year !== lastDayOfWeek.year) {
    return `${format(firstDay, fullDatePattern, formatOptions)} – ${format(
      lastDay,
      fullDatePattern,
      formatOptions,
    )}`;
  }

  if (firstDayOfWeek.month !== lastDayOfWeek.month) {
    return `${format(firstDay, shortDatePattern, formatOptions)} – ${format(
      lastDay,
      fullDatePattern,
      formatOptions,
    )}`;
  }

  return `${format(firstDay, doNotTranslate(isDayFirst ? 'd' : 'MMM d'), formatOptions)} – ${format(
    lastDay,
    doNotTranslate(isDayFirst ? 'd MMM yyyy' : 'd, yyyy'),
    formatOptions,
  )}`;
};
