import {
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
