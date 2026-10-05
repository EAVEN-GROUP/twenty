import { type RecordIndexStatCardConfig } from '@/object-record/record-index/types/RecordIndexStatCardConfig';
import { msg } from '@lingui/core/macro';

// Cards shown above the record table, per object. Edit this file to add or
// change cards; the values follow the filters of the current view.
// For people, "answered" leaves out NO_ANSWER on purpose: nobody picked up, so
// it must not count towards the conversion rate.
// Show-up rate counts meetings that already happened, because the Show Up
// checkbox is false by default and an upcoming meeting is not a no-show.
export const RECORD_INDEX_STAT_CARDS_BY_OBJECT_NAME_SINGULAR: Record<
  string,
  RecordIndexStatCardConfig[]
> = {
  person: [
    {
      kind: 'count',
      key: 'answered-calls',
      label: msg`Answered calls`,
      tone: 'default',
      filter: {
        status: { in: ['NOT_BOOKED', 'FOLLOW_UP', 'SEND_INFO', 'BOOKED'] },
      },
    },
    {
      kind: 'count',
      key: 'meetings-booked',
      label: msg`Meetings booked`,
      tone: 'blue',
      filter: { status: { in: ['BOOKED'] } },
    },
    {
      kind: 'percentage',
      key: 'conversion-rate',
      label: msg`Conversion rate`,
      tone: 'green',
      numeratorFilter: { status: { in: ['BOOKED'] } },
      denominatorFilter: {
        status: { in: ['NOT_BOOKED', 'FOLLOW_UP', 'SEND_INFO', 'BOOKED'] },
      },
    },
    {
      kind: 'percentage',
      key: 'show-up-rate',
      label: msg`Show-up rate`,
      tone: 'purple',
      objectNameSingular: 'meeting',
      numeratorFilter: () => ({
        showUp: { eq: true },
        meetingDate: { lt: new Date().toISOString() },
      }),
      denominatorFilter: () => ({
        meetingDate: { lt: new Date().toISOString() },
      }),
    },
  ],
};
