import { type DateFormat } from '@/localization/constants/DateFormat';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { isValid, type Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const formatMeetingChipLabel = ({
  meetingDate,
  timeZone,
  dateFormat,
  timeFormat,
  localeCatalog,
  now = new Date(),
}: {
  meetingDate: string;
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  localeCatalog: Locale;
  now?: Date;
}) => {
  const parsedMeetingDate = new Date(meetingDate);

  if (!isValid(parsedMeetingDate)) {
    return '';
  }

  const isInCurrentYear =
    formatInTimeZone(parsedMeetingDate, timeZone, 'yyyy') ===
    formatInTimeZone(now, timeZone, 'yyyy');

  // The table column is narrow, so the year is only shown when it is not the current one
  const displayedDateFormat = isInCurrentYear
    ? dateFormat.replace(/,?\s*yyyy\s*/, ' ').trim()
    : dateFormat;

  return formatInTimeZone(
    parsedMeetingDate,
    timeZone,
    `${displayedDateFormat} ${timeFormat}`,
    { locale: localeCatalog },
  );
};
