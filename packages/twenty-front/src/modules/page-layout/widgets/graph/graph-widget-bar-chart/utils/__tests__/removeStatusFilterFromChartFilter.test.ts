import { removeStatusFilterFromChartFilter } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/removeStatusFilterFromChartFilter';

const fieldMetadataIds = ['status-field-id', 'owner-field-id', 'call-date-id'];

const buildRecordFilter = (fieldMetadataId: string, groupId: string) =>
  ({
    id: `filter-${fieldMetadataId}`,
    fieldMetadataId,
    value: '["BOOKED"]',
    displayValue: '',
    type: 'SELECT',
    operand: 'IS',
    label: 'Status',
    recordFilterGroupId: groupId,
  }) as never;

describe('removeStatusFilterFromChartFilter', () => {
  it('drops the status filter and the group it leaves empty', () => {
    const result = removeStatusFilterFromChartFilter({
      chartFilter: {
        recordFilters: [buildRecordFilter('status-field-id', 'group-1')],
        recordFilterGroups: [
          { id: 'group-1', logicalOperator: 'AND' },
        ] as never,
      },
      fieldMetadataIds,
      statusFieldMetadataId: 'status-field-id',
    });

    expect(result.recordFilters).toEqual([]);
    expect(result.recordFilterGroups).toEqual([]);
  });

  it('keeps filters on other fields', () => {
    const result = removeStatusFilterFromChartFilter({
      chartFilter: {
        recordFilters: [
          buildRecordFilter('status-field-id', 'group-1'),
          buildRecordFilter('owner-field-id', 'group-1'),
        ],
        recordFilterGroups: [
          { id: 'group-1', logicalOperator: 'AND' },
        ] as never,
      },
      fieldMetadataIds,
      statusFieldMetadataId: 'status-field-id',
    });

    expect(result.recordFilters).toHaveLength(1);
    expect(result.recordFilters?.[0].fieldMetadataId).toBe('owner-field-id');
    expect(result.recordFilterGroups).toHaveLength(1);
  });

  it('handles a chart without a filter', () => {
    const result = removeStatusFilterFromChartFilter({
      chartFilter: {},
      fieldMetadataIds,
      statusFieldMetadataId: 'status-field-id',
    });

    expect(result.recordFilters).toEqual([]);
  });
});
