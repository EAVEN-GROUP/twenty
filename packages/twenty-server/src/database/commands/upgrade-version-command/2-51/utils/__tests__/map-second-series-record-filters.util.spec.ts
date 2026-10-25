import { stripDerivedRecordFilterProperties } from 'src/database/commands/upgrade-version-command/2-49/utils/strip-derived-record-filter-properties.util';
import { mapSecondSeriesRecordFilters } from 'src/database/commands/upgrade-version-command/2-51/utils/map-second-series-record-filters.util';

const legacyRecordFilter = {
  id: 'filter-id',
  type: 'SELECT',
  label: 'Status',
  value: '["BOOKED"]',
  operand: 'IS',
  displayValue: '["BOOKED"]',
  subFieldName: null,
  fieldMetadataId: 'status-field-id',
  recordFilterGroupId: 'group-id',
};

const mapRecordFilter = (recordFilter: Record<string, unknown>) =>
  stripDerivedRecordFilterProperties({ recordFilter });

describe('mapSecondSeriesRecordFilters', () => {
  it('strips the derived properties of the second series record filters only', () => {
    const configuration = {
      configurationType: 'BAR_CHART',
      filter: { recordFilters: [legacyRecordFilter] },
      secondSeriesFilter: {
        recordFilters: [legacyRecordFilter],
        recordFilterGroups: [{ id: 'group-id', logicalOperator: 'AND' }],
      },
    };

    const { value, hasChanged } = mapSecondSeriesRecordFilters({
      configuration,
      mapRecordFilter,
    });

    expect(hasChanged).toBe(true);
    expect(value).toEqual({
      ...configuration,
      secondSeriesFilter: {
        recordFilters: [
          {
            id: 'filter-id',
            value: '["BOOKED"]',
            operand: 'IS',
            subFieldName: null,
            fieldMetadataId: 'status-field-id',
            recordFilterGroupId: 'group-id',
          },
        ],
        recordFilterGroups: [{ id: 'group-id', logicalOperator: 'AND' }],
      },
    });
  });

  it('leaves a configuration without a second series untouched', () => {
    const configuration = {
      configurationType: 'BAR_CHART',
      filter: { recordFilters: [legacyRecordFilter] },
    };

    expect(
      mapSecondSeriesRecordFilters({ configuration, mapRecordFilter }),
    ).toEqual({ value: configuration, hasChanged: false });
  });

  it('reports no change for an already migrated second series', () => {
    const configuration = {
      secondSeriesFilter: {
        recordFilters: [mapRecordFilter(legacyRecordFilter)],
      },
    };

    expect(
      mapSecondSeriesRecordFilters({ configuration, mapRecordFilter }),
    ).toEqual({ value: configuration, hasChanged: false });
  });
});
