import { ANSWERED_CALL_STATUSES } from '@/object-record/record-index/constants/AnsweredCallStatuses';
import { MEETING_BOOKED_STATUS } from '@/object-record/record-index/constants/MeetingBookedStatus';
import { computeRecordIndexStatCardPercentage } from '@/object-record/record-index/utils/computeRecordIndexStatCardPercentage';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartDatum';
import { type PodiumEntry } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/PodiumEntry';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { isDefined } from 'twenty-shared/utils';

type ComputePodiumEntriesParams = {
  data: BarChartDatum[];
  indexBy: string;
  keys: string[];
  formattedToRawLookup: Map<string, RawDimensionValue>;
  rosterLabels?: string[];
};

export const computePodiumEntries = ({
  data,
  indexBy,
  keys,
  formattedToRawLookup,
  rosterLabels,
}: ComputePodiumEntriesParams): PodiumEntry[] => {
  const entriesFromData = data
    // The server leaves the group without a value (an unassigned owner) out of
    // the lookup, so only labels that resolve to a real value are members.
    .filter((datum) => formattedToRawLookup.has(String(datum[indexBy])))
    .map((datum) => {
      let meetings = 0;
      let answered = 0;

      for (const key of keys) {
        const rawStatus = formattedToRawLookup.get(key);
        const count = Number(datum[key] ?? 0);

        if (!isDefined(rawStatus) || Number.isNaN(count)) {
          continue;
        }

        if (rawStatus === MEETING_BOOKED_STATUS) {
          meetings += count;
        }

        if (ANSWERED_CALL_STATUSES.includes(String(rawStatus))) {
          answered += count;
        }
      }

      return {
        label: String(datum[indexBy]),
        meetings,
        answered,
        conversionPercentage: computeRecordIndexStatCardPercentage({
          numerator: meetings,
          denominator: answered,
        }),
      };
    });

  const entries = isDefined(rosterLabels)
    ? [
        ...entriesFromData,
        ...rosterLabels
          .filter(
            (rosterLabel) =>
              !entriesFromData.some((entry) => entry.label === rosterLabel),
          )
          .map((label) => ({
            label,
            meetings: 0,
            answered: 0,
            conversionPercentage: 0,
          })),
      ]
    : entriesFromData.filter(
        (entry) => entry.meetings > 0 || entry.answered > 0,
      );

  return entries.sort(
    (first, second) =>
      second.meetings - first.meetings ||
      second.answered - first.answered ||
      first.label.localeCompare(second.label),
  );
};
