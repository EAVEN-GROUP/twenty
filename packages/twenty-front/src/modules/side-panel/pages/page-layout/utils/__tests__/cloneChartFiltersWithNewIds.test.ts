import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { cloneChartFiltersWithNewIds } from '@/side-panel/pages/page-layout/utils/cloneChartFiltersWithNewIds';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

const recordFilterGroups: RecordFilterGroup[] = [
  { id: 'root-group', logicalOperator: RecordFilterGroupLogicalOperator.AND },
  {
    id: 'child-group',
    parentRecordFilterGroupId: 'root-group',
    logicalOperator: RecordFilterGroupLogicalOperator.OR,
  },
];

const recordFilters = [
  { id: 'status-filter', recordFilterGroupId: 'root-group', value: 'BOOKED' },
  { id: 'owner-filter', recordFilterGroupId: 'child-group', value: 'omar' },
] as RecordFilter[];

describe('cloneChartFiltersWithNewIds', () => {
  it('gives every filter and group a new id', () => {
    const clone = cloneChartFiltersWithNewIds({
      recordFilters,
      recordFilterGroups,
    });

    const originalIds = [...recordFilters, ...recordFilterGroups].map(
      ({ id }) => id,
    );
    const cloneIds = [
      ...(clone.recordFilters ?? []),
      ...(clone.recordFilterGroups ?? []),
    ].map(({ id }) => id);

    expect(cloneIds).toHaveLength(4);
    expect(new Set(cloneIds).size).toBe(4);
    expect(cloneIds.some((id) => originalIds.includes(id))).toBe(false);
  });

  it('keeps filters and groups attached to the same parents', () => {
    const clone = cloneChartFiltersWithNewIds({
      recordFilters,
      recordFilterGroups,
    });

    const [rootGroup, childGroup] = clone.recordFilterGroups ?? [];
    const [statusFilter, ownerFilter] = clone.recordFilters ?? [];

    expect(childGroup.parentRecordFilterGroupId).toBe(rootGroup.id);
    expect(statusFilter.recordFilterGroupId).toBe(rootGroup.id);
    expect(ownerFilter.recordFilterGroupId).toBe(childGroup.id);
    expect(statusFilter.value).toBe('BOOKED');
  });

  it('leaves the original filters untouched', () => {
    cloneChartFiltersWithNewIds({ recordFilters, recordFilterGroups });

    expect(recordFilters[0].id).toBe('status-filter');
    expect(recordFilterGroups[1].parentRecordFilterGroupId).toBe('root-group');
  });
});
