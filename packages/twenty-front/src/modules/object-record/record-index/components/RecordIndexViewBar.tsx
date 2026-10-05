import { RecordIndexStatCards } from '@/object-record/record-index/components/RecordIndexStatCards';
import { ObjectOptionsDropdown } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdown';
import { RecordIndexViewBarEffect } from '@/object-record/record-index/components/RecordIndexViewBarEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useHasCurrentViewNonReadableFields } from '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewType } from '@/views/types/ViewType';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledViewBarSurface = styled.div`
  background: ${themeCssVariables.grayScale.gray3};
  box-sizing: border-box;
  padding: 0 ${themeCssVariables.spacing[5]};
`;

// The doubled class name wins over the default margin, border and padding of
// TopBar, so the toolbar lines up with the stat cards and the table card.
const StyledViewBar = styled(ViewBar)`
  && {
    border-bottom: none;
    margin-left: 0;
  }

  && > div:first-child {
    padding-right: 0;
  }
`;

export const RecordIndexViewBar = () => {
  const recordIndexViewType = useAtomComponentStateValue(
    recordIndexViewTypeState,
  );

  const { objectNamePlural, recordIndexId, objectMetadataItem } =
    useRecordIndexContextOrThrow();

  const { hasCurrentViewNonReadableFields } =
    useHasCurrentViewNonReadableFields(objectMetadataItem);

  return (
    <SpreadsheetImportProvider>
      <StyledViewBarSurface>
        <RecordIndexStatCards />
        <StyledViewBar
          isReadOnly={hasCurrentViewNonReadableFields}
          viewBarId={recordIndexId}
          optionsDropdownButton={
            <ObjectOptionsDropdown
              recordIndexId={recordIndexId}
              objectMetadataItem={objectMetadataItem}
              viewType={recordIndexViewType ?? ViewType.TABLE}
            />
          }
        />
      </StyledViewBarSurface>
      <RecordIndexViewBarEffect
        objectNamePlural={objectNamePlural}
        viewBarId={recordIndexId}
      />
    </SpreadsheetImportProvider>
  );
};
