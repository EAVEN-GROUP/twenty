import { type Temporal } from 'temporal-polyfill';
import {
  type FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { getNextPeriodStart, getPeriodStart } from 'twenty-shared/utils';

const isDayFirstLocale = (locale: string) => {
  const partTypes = new Intl.DateTimeFormat(locale)
    .formatToParts(new Date(2000, 0, 31))
    .map(({ type }) => type);

  return partTypes.indexOf('day') < partTypes.indexOf('month');
};

export const formatDateByGranularity = (
  plainDate: Temporal.PlainDate,
  granularity:
    | ObjectRecordGroupByDateGranularity.DAY
    | ObjectRecordGroupByDateGranularity.MONTH
    | ObjectRecordGroupByDateGranularity.QUARTER
    | ObjectRecordGroupByDateGranularity.YEAR
    | ObjectRecordGroupByDateGranularity.WEEK
    | ObjectRecordGroupByDateGranularity.NONE,
  userTimezone: string,
  firstDayOfTheWeek: FirstDayOfTheWeek,
  locale: string,
): string => {
  switch (granularity) {
    case ObjectRecordGroupByDateGranularity.DAY:
      return plainDate.toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    case ObjectRecordGroupByDateGranularity.WEEK: {
      const startOfWeek = getPeriodStart(
        plainDate.toZonedDateTime(userTimezone),
        'WEEK',
        firstDayOfTheWeek,
      );

      const endOfWeek = getNextPeriodStart(
        plainDate.toZonedDateTime(userTimezone),
        'WEEK',
        firstDayOfTheWeek,
      ).subtract({ days: 1 });

      const startMonth = startOfWeek.toLocaleString(locale, {
        month: 'short',
      });
      const endMonth = endOfWeek.toLocaleString(locale, {
        month: 'short',
      });
      const startDay = startOfWeek.day;
      const endDay = endOfWeek.day;
      const startYear = startOfWeek.year;
      const endYear = endOfWeek.year;

      const isDayFirst = isDayFirstLocale(locale);

      if (startYear !== endYear) {
        return isDayFirst
          ? `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`
          : `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
      }

      if (startMonth !== endMonth) {
        return isDayFirst
          ? `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`
          : `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
      }

      return isDayFirst
        ? `${startDay} - ${endDay} ${endMonth} ${endYear}`
        : `${startMonth} ${startDay} - ${endDay}, ${endYear}`;
    }
    case ObjectRecordGroupByDateGranularity.MONTH:
      return plainDate.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
      });
    case ObjectRecordGroupByDateGranularity.QUARTER: {
      return `Q${Math.ceil(plainDate.month / 3)} ${plainDate.year}`;
    }
    case ObjectRecordGroupByDateGranularity.YEAR:
      return plainDate.year.toString();
    case ObjectRecordGroupByDateGranularity.NONE:
    default:
      return plainDate.toLocaleString(locale);
  }
};
