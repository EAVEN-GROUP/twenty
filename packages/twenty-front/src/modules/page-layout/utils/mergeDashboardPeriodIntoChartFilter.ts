import { type DashboardCustomPeriod } from '@/page-layout/types/DashboardCustomPeriod';
import { type DashboardPeriod } from '@/page-layout/types/DashboardPeriod';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import {
  type ChartFilter,
  type ChartRecordFilter,
  FirstDayOfTheWeek,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const DASHBOARD_PERIOD_RECORD_FILTER_ID =
  '4f1d8a52-7c3e-4b9a-9d2f-6a1e0c5b7d31';

export const DASHBOARD_PERIOD_END_RECORD_FILTER_ID =
  'e3a61f08-5d27-4c94-b8a2-1f7d90c64a55';

export const DASHBOARD_PERIOD_ROOT_GROUP_ID =
  'b7e92c14-3a58-4f6d-8c01-92d4e5a6f3b8';

type MergeDashboardPeriodIntoChartFilterParams = {
  chartFilter: ChartFilter | null | undefined;
  period: DashboardPeriod;
  dateField: { id: string; type: string };
  timezone: string;
  customPeriod?: DashboardCustomPeriod;
};

type PeriodRecordFilter = ChartRecordFilter & {
  id: string;
  label: string;
  displayValue: string;
};

type BuildPeriodRecordFiltersParams = Omit<
  MergeDashboardPeriodIntoChartFilterParams,
  'chartFilter'
>;

// A date field takes the plain date; a date time field needs the instant at
// which that day starts in the chart timezone.
const toBoundaryValue = ({
  plainDate,
  dateFieldType,
  timezone,
}: {
  plainDate: Temporal.PlainDate;
  dateFieldType: string;
  timezone: string;
}) =>
  dateFieldType === 'DATE_TIME'
    ? plainDate.toZonedDateTime(timezone).toInstant().toString()
    : plainDate.toString();

const buildPeriodRecordFilters = ({
  period,
  dateField,
  timezone,
  customPeriod,
}: BuildPeriodRecordFiltersParams): PeriodRecordFilter[] => {
  const baseRecordFilter = {
    id: DASHBOARD_PERIOD_RECORD_FILTER_ID,
    label: 'Period',
    displayValue: '',
    fieldMetadataId: dateField.id,
    type: dateField.type,
    recordFilterGroupId: null,
    subFieldName: null,
  };

  if (period === 'TODAY') {
    return [{ ...baseRecordFilter, operand: 'IS_TODAY', value: '' }];
  }

  if (period === 'CUSTOM') {
    const customRecordFilters: PeriodRecordFilter[] = [];

    if (isNonEmptyString(customPeriod?.from)) {
      customRecordFilters.push({
        ...baseRecordFilter,
        operand: 'IS_AFTER',
        value: toBoundaryValue({
          plainDate: Temporal.PlainDate.from(customPeriod.from),
          dateFieldType: dateField.type,
          timezone,
        }),
      });
    }

    if (isNonEmptyString(customPeriod?.to)) {
      // The end day is included, so the filter stops at the start of the next one.
      customRecordFilters.push({
        ...baseRecordFilter,
        id: DASHBOARD_PERIOD_END_RECORD_FILTER_ID,
        operand: 'IS_BEFORE',
        value: toBoundaryValue({
          plainDate: Temporal.PlainDate.from(customPeriod.to).add({ days: 1 }),
          dateFieldType: dateField.type,
          timezone,
        }),
      });
    }

    return customRecordFilters;
  }

  return [
    {
      ...baseRecordFilter,
      operand: 'IS_RELATIVE',
      value: stringifyRelativeDateFilter({
        direction: 'THIS',
        amount: 1,
        unit: period === 'WEEK' ? 'WEEK' : 'MONTH',
        timezone,
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      }),
    },
  ];
};

export const mergeDashboardPeriodIntoChartFilter = ({
  chartFilter,
  period,
  dateField,
  timezone,
  customPeriod,
}: MergeDashboardPeriodIntoChartFilterParams):
  | ChartFilter
  | null
  | undefined => {
  if (period === 'ALL') {
    return chartFilter;
  }

  const periodRecordFilters = buildPeriodRecordFilters({
    period,
    dateField,
    timezone,
    customPeriod,
  });

  if (periodRecordFilters.length === 0) {
    return chartFilter;
  }

  const recordFilters = chartFilter?.recordFilters ?? [];
  const recordFilterGroups = chartFilter?.recordFilterGroups ?? [];

  const rootGroup = recordFilterGroups.find(
    (group) => !isDefined(group.parentRecordFilterGroupId),
  );

  const buildForGroup = (recordFilterGroupId: string | null) =>
    periodRecordFilters.map((periodRecordFilter) => ({
      ...periodRecordFilter,
      recordFilterGroupId,
    }));

  if (!isDefined(rootGroup)) {
    return {
      recordFilters: [...recordFilters, ...buildForGroup(null)],
      recordFilterGroups,
    };
  }

  if (rootGroup.logicalOperator === 'AND') {
    return {
      recordFilters: [...recordFilters, ...buildForGroup(rootGroup.id)],
      recordFilterGroups,
    };
  }

  // An OR root would let the period filter be bypassed by any other branch.
  return {
    recordFilters: [
      ...recordFilters,
      ...buildForGroup(DASHBOARD_PERIOD_ROOT_GROUP_ID),
    ],
    recordFilterGroups: [
      {
        id: DASHBOARD_PERIOD_ROOT_GROUP_ID,
        logicalOperator: 'AND',
        parentRecordFilterGroupId: null,
      },
      ...recordFilterGroups.map((group) =>
        group.id === rootGroup.id
          ? {
              ...group,
              parentRecordFilterGroupId: DASHBOARD_PERIOD_ROOT_GROUP_ID,
            }
          : group,
      ),
    ],
  };
};
