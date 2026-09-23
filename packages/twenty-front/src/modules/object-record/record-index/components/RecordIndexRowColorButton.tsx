import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useResetRecordIndexSelection } from '@/object-record/record-index/hooks/useResetRecordIndexSelection';
import { useUpdateMultipleRecordsActions } from '@/object-record/record-update-multiple/hooks/useUpdateMultipleRecordsActions';
import { getRecordTableRowColorField } from '@/object-record/record-table/utils/getRecordTableRowColorField';
import { ThemeColorPickerMenu } from '@/ui/input/components/ThemeColorPickerMenu';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconColorSwatch, IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/surfaces';
import { type ThemeColor } from 'twenty-ui/theme';

const ROW_COLOR_DROPDOWN_ID = 'record-index-row-color-dropdown';
const ROW_COLOR_BUTTON_ID = 'record-index-row-color-button';

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
    <Dropdown
      dropdownId={ROW_COLOR_DROPDOWN_ID}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <div id={ROW_COLOR_BUTTON_ID}>
          <IconButton
            Icon={IconColorSwatch}
            size="small"
            variant="primary"
            accent="default"
            disabled={isUpdating}
            ariaLabel={t`Set row color`}
          />
          <AppTooltip
            anchorSelect={`#${ROW_COLOR_BUTTON_ID}`}
            content={t`Set row color`}
            delay={TooltipDelay.longDelay}
            place={TooltipPosition.Bottom}
            offset={5}
            noArrow
          />
        </div>
      }
      dropdownComponents={
        <DropdownContent>
          <ThemeColorPickerMenu onSelectColor={applyColor} />
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconX}
              text={t`Remove color`}
              onClick={() => applyColor(null)}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
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
