import { mergeDashboardPeriodIntoChartConfiguration } from '@/page-layout/utils/mergeDashboardPeriodIntoChartConfiguration';
import { DASHBOARD_PERIOD_RECORD_FILTER_ID } from '@/page-layout/utils/mergeDashboardPeriodIntoChartFilter';

const dateField = { id: 'call-date-field-id', type: 'DATE' };

const buildChartFilter = (statusValue: string) => ({
  recordFilters: [
    {
      id: `status-${statusValue}`,
      fieldMetadataId: 'status-field-id',
      operand: 'IS',
      value: `["${statusValue}"]`,
      type: 'SELECT',
      recordFilterGroupId: 'root-group-id',
    },
  ],
  recordFilterGroups: [{ id: 'root-group-id', logicalOperator: 'AND' }],
});

const getRecordFilterIds = (chartFilter: unknown) =>
  (chartFilter as { recordFilters: { id: string }[] }).recordFilters.map(
    ({ id }) => id,
  );

const mergeToday = <TConfiguration extends object>(
  configuration: TConfiguration,
) =>
  mergeDashboardPeriodIntoChartConfiguration({
    configuration,
    period: 'TODAY',
    dateField,
    timezone: 'Europe/Rome',
  });

describe('mergeDashboardPeriodIntoChartConfiguration', () => {
  it('scopes both the main and the second series filter to the period', () => {
    const result = mergeToday({
      filter: buildChartFilter('FOLLOW_UP'),
      secondSeriesFilter: buildChartFilter('BOOKED'),
    });

    expect(getRecordFilterIds(result.filter)).toEqual([
      'status-FOLLOW_UP',
      DASHBOARD_PERIOD_RECORD_FILTER_ID,
    ]);
    expect(getRecordFilterIds(result.secondSeriesFilter)).toEqual([
      'status-BOOKED',
      DASHBOARD_PERIOD_RECORD_FILTER_ID,
    ]);
  });

  it('leaves an empty second series filter empty so the series stays off', () => {
    const secondSeriesFilter = { recordFilters: [], recordFilterGroups: [] };

    const result = mergeToday({
      filter: buildChartFilter('FOLLOW_UP'),
      secondSeriesFilter,
    });

    expect(result.secondSeriesFilter).toBe(secondSeriesFilter);
  });

  it('does not add a second series filter to a chart that has none', () => {
    const result = mergeToday({ filter: buildChartFilter('FOLLOW_UP') });

    expect(result).not.toHaveProperty('secondSeriesFilter');
  });

  it('ignores the second series filter of a chart grouped on its secondary axis', () => {
    const secondSeriesFilter = buildChartFilter('BOOKED');

    const result = mergeToday({
      filter: buildChartFilter('FOLLOW_UP'),
      secondSeriesFilter,
      secondaryAxisGroupByFieldMetadataId: 'owner-field-id',
    });

    expect(result.secondSeriesFilter).toBe(secondSeriesFilter);
  });
});
