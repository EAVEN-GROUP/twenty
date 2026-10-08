import {
  DASHBOARD_PERIOD_END_RECORD_FILTER_ID,
  DASHBOARD_PERIOD_RECORD_FILTER_ID,
  DASHBOARD_PERIOD_ROOT_GROUP_ID,
  mergeDashboardPeriodIntoChartFilter,
} from '@/page-layout/utils/mergeDashboardPeriodIntoChartFilter';

const dateField = { id: 'call-date-field-id', type: 'DATE' };

const statusFilter = {
  fieldMetadataId: 'status-field-id',
  operand: 'IS',
  value: '["BOOKED"]',
  type: 'SELECT',
  recordFilterGroupId: 'root-group-id',
};

describe('mergeDashboardPeriodIntoChartFilter', () => {
  it('returns the filter untouched for the ALL period', () => {
    const chartFilter = {
      recordFilters: [statusFilter],
      recordFilterGroups: [{ id: 'root-group-id', logicalOperator: 'AND' }],
    };

    expect(
      mergeDashboardPeriodIntoChartFilter({
        chartFilter,
        period: 'ALL',
        dateField,
        timezone: 'Europe/Rome',
      }),
    ).toBe(chartFilter);
  });

  it('adds an ungrouped IS_TODAY filter when the chart has no filter', () => {
    const result = mergeDashboardPeriodIntoChartFilter({
      chartFilter: undefined,
      period: 'TODAY',
      dateField,
      timezone: 'Europe/Rome',
    });

    expect(result?.recordFilters).toEqual([
      {
        id: DASHBOARD_PERIOD_RECORD_FILTER_ID,
        label: 'Period',
        displayValue: '',
        fieldMetadataId: 'call-date-field-id',
        type: 'DATE',
        operand: 'IS_TODAY',
        value: '',
        recordFilterGroupId: null,
        subFieldName: null,
      },
    ]);
    expect(result?.recordFilterGroups).toEqual([]);
  });

  it('adds a relative week filter starting on Monday inside an AND root group', () => {
    const result = mergeDashboardPeriodIntoChartFilter({
      chartFilter: {
        recordFilters: [statusFilter],
        recordFilterGroups: [{ id: 'root-group-id', logicalOperator: 'AND' }],
      },
      period: 'WEEK',
      dateField,
      timezone: 'Europe/Rome',
    });

    expect(result?.recordFilters).toHaveLength(2);
    expect(result?.recordFilters?.[1]).toMatchObject({
      operand: 'IS_RELATIVE',
      value: 'THIS_1_WEEK;;Europe/Rome;;MONDAY;;',
      recordFilterGroupId: 'root-group-id',
    });
    expect(result?.recordFilterGroups).toHaveLength(1);
  });

  it('adds a relative month filter', () => {
    const result = mergeDashboardPeriodIntoChartFilter({
      chartFilter: undefined,
      period: 'MONTH',
      dateField,
      timezone: 'Europe/Rome',
    });

    expect(result?.recordFilters?.[0]).toMatchObject({
      operand: 'IS_RELATIVE',
      value: 'THIS_1_MONTH;;Europe/Rome;;MONDAY;;',
    });
  });

  it('wraps an OR root group so the period cannot be bypassed', () => {
    const result = mergeDashboardPeriodIntoChartFilter({
      chartFilter: {
        recordFilters: [statusFilter],
        recordFilterGroups: [{ id: 'root-group-id', logicalOperator: 'OR' }],
      },
      period: 'MONTH',
      dateField,
      timezone: 'Europe/Rome',
    });

    expect(result?.recordFilterGroups).toEqual([
      {
        id: DASHBOARD_PERIOD_ROOT_GROUP_ID,
        logicalOperator: 'AND',
        parentRecordFilterGroupId: null,
      },
      {
        id: 'root-group-id',
        logicalOperator: 'OR',
        parentRecordFilterGroupId: DASHBOARD_PERIOD_ROOT_GROUP_ID,
      },
    ]);
    expect(result?.recordFilters?.[1]).toMatchObject({
      recordFilterGroupId: DASHBOARD_PERIOD_ROOT_GROUP_ID,
    });
  });
});

describe('mergeDashboardPeriodIntoChartFilter with a custom period', () => {
  it('keeps both days of a date field range, the end day included', () => {
    const result = mergeDashboardPeriodIntoChartFilter({
      chartFilter: undefined,
      period: 'CUSTOM',
      dateField,
      timezone: 'Europe/Rome',
      customPeriod: { from: '2026-10-01', to: '2026-10-07' },
    });

    expect(result?.recordFilters).toHaveLength(2);
    expect(result?.recordFilters?.[0]).toMatchObject({
      id: DASHBOARD_PERIOD_RECORD_FILTER_ID,
      operand: 'IS_AFTER',
      value: '2026-10-01',
      recordFilterGroupId: null,
    });
    expect(result?.recordFilters?.[1]).toMatchObject({
      id: DASHBOARD_PERIOD_END_RECORD_FILTER_ID,
      operand: 'IS_BEFORE',
      value: '2026-10-08',
      recordFilterGroupId: null,
    });
  });

  it('rolls the exclusive end over a month boundary', () => {
    const result = mergeDashboardPeriodIntoChartFilter({
      chartFilter: undefined,
      period: 'CUSTOM',
      dateField,
      timezone: 'Europe/Rome',
      customPeriod: { from: null, to: '2026-10-31' },
    });

    expect(result?.recordFilters).toHaveLength(1);
    expect(result?.recordFilters?.[0]).toMatchObject({
      operand: 'IS_BEFORE',
      value: '2026-11-01',
    });
  });

  it('filters only the start when there is no end date', () => {
    const result = mergeDashboardPeriodIntoChartFilter({
      chartFilter: undefined,
      period: 'CUSTOM',
      dateField,
      timezone: 'Europe/Rome',
      customPeriod: { from: '2026-10-01', to: null },
    });

    expect(result?.recordFilters).toHaveLength(1);
    expect(result?.recordFilters?.[0]).toMatchObject({
      operand: 'IS_AFTER',
      value: '2026-10-01',
    });
  });

  it('converts the days to instants in the chart timezone for a date time field', () => {
    const result = mergeDashboardPeriodIntoChartFilter({
      chartFilter: undefined,
      period: 'CUSTOM',
      dateField: { id: 'meeting-date-field-id', type: 'DATE_TIME' },
      timezone: 'Europe/Rome',
      customPeriod: { from: '2026-10-01', to: '2026-10-07' },
    });

    expect(result?.recordFilters?.[0]).toMatchObject({
      type: 'DATE_TIME',
      operand: 'IS_AFTER',
      value: '2026-09-30T22:00:00Z',
    });
    expect(result?.recordFilters?.[1]).toMatchObject({
      operand: 'IS_BEFORE',
      value: '2026-10-07T22:00:00Z',
    });
  });

  it('leaves the filter untouched when no date is set', () => {
    const chartFilter = {
      recordFilters: [statusFilter],
      recordFilterGroups: [{ id: 'root-group-id', logicalOperator: 'AND' }],
    };

    expect(
      mergeDashboardPeriodIntoChartFilter({
        chartFilter,
        period: 'CUSTOM',
        dateField,
        timezone: 'Europe/Rome',
        customPeriod: { from: null, to: null },
      }),
    ).toBe(chartFilter);
  });

  it('puts both bounds in the AND root group next to the existing filters', () => {
    const result = mergeDashboardPeriodIntoChartFilter({
      chartFilter: {
        recordFilters: [statusFilter],
        recordFilterGroups: [{ id: 'root-group-id', logicalOperator: 'AND' }],
      },
      period: 'CUSTOM',
      dateField,
      timezone: 'Europe/Rome',
      customPeriod: { from: '2026-10-01', to: '2026-10-07' },
    });

    expect(result?.recordFilters).toHaveLength(3);
    expect(result?.recordFilters?.[1]).toMatchObject({
      recordFilterGroupId: 'root-group-id',
    });
    expect(result?.recordFilters?.[2]).toMatchObject({
      recordFilterGroupId: 'root-group-id',
    });
  });
});
