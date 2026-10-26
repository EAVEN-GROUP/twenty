import { type Temporal } from 'temporal-polyfill';

const SATURDAY = 6;

export const addWorkingDays = ({
  from,
  workingDays,
  hour,
}: {
  from: Temporal.ZonedDateTime;
  workingDays: number;
  hour: number;
}) => {
  let date = from.with({
    hour,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  });
  let remainingWorkingDays = workingDays;

  while (remainingWorkingDays > 0) {
    date = date.add({ days: 1 });

    if (date.dayOfWeek < SATURDAY) {
      remainingWorkingDays--;
    }
  }

  return date;
};
