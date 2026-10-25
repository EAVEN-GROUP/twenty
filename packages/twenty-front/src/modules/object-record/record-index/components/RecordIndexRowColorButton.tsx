import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useResetRecordIndexSelection } from '@/object-record/record-index/hooks/useResetRecordIndexSelection';
import { useUpdateMultipleRecordsActions } from '@/object-record/record-update-multiple/hooks/useUpdateMultipleRecordsActions';
import { getRecordTableRowColorField } from '@/object-record/record-table/utils/getRecordTableRowColorField';
import { ThemeColorPickerMenu } from '@/ui/input/components/ThemeColorPickerMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconColorSwatch, IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { type ThemeColor } from 'twenty-ui/theme';

const ROW_COLOR_DROPDOWN_ID = 'record-index-row-color-dropdown';

const StyledPopupScope = styled.div`
  display: contents;
`;

type RecordIndexRowColorButtonContentProps = {
  objectNameSingular: string;
  colorFieldName: string;
};

const RecordIndexRowColorButtonContent = ({
  objectNameSingular,
  colorFieldName,
}: RecordIndexRowColorButtonContentProps) => {
  const { t } = useLingui();

  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );

  const { updateRecords, isUpdating } = useUpdateMultipleRecordsActions({
    objectNameSingular,
    contextStoreInstanceId,
  });

  const { closeDropdown } = useCloseDropdown();

  const { resetRecordIndexSelection } = useResetRecordIndexSelection(
    contextStoreInstanceId,
  );

  const applyColor = async (color: ThemeColor | null) => {
    closeDropdown(ROW_COLOR_DROPDOWN_ID);
    await updateRecords({ [colorFieldName]: color });
    resetRecordIndexSelection();
  };

  return (
    <Tooltip
      content={t`Set row color`}
      delay={TooltipDelay.longDelay}
      side="bottom"
      sideOffset={5}
    >
      <div>
        <DropdownRoot dropdownId={ROW_COLOR_DROPDOWN_ID} type="picker">
          <Dropdown.Trigger
            render={
              <IconButton
                size="sm"
                variant="outline"
                color="neutral"
                disabled={isUpdating}
                aria-label={t`Set row color`}
              >
                <IconColorSwatch />
              </IconButton>
            }
          />
          <DropdownContent side="bottom" align="end">
            <StyledPopupScope data-click-outside-id={ROW_COLOR_DROPDOWN_ID}>
              <ThemeColorPickerMenu onSelectColor={applyColor} />
              <Dropdown.Separator />
              <Dropdown.Section>
                <Dropdown.ActionItem
                  startIcon={<IconX />}
                  onClick={() => applyColor(null)}
                >
                  {t`Remove color`}
                </Dropdown.ActionItem>
              </Dropdown.Section>
            </StyledPopupScope>
          </DropdownContent>
        </DropdownRoot>
      </div>
    </Tooltip>
  );
};

export const RecordIndexRowColorButton = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const colorField = getRecordTableRowColorField(objectMetadataItem);

  const canUpdateRecords =
    objectPermissionsByObjectMetadataId[objectMetadataItem.id]
      ?.canUpdateObjectRecords !== false;

  if (
    !isDefined(colorField) ||
    contextStoreNumberOfSelectedRecords === 0 ||
    !canUpdateRecords
  ) {
    return null;
  }

  return (
    <RecordIndexRowColorButtonContent
      objectNameSingular={objectMetadataItem.nameSingular}
      colorFieldName={colorField.colorFieldMetadataItem.name}
    />
  );
};
