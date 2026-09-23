import { t } from '@lingui/core/macro';
import {
  IconArchiveOff,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';

import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';

const INACTIVE_OBJECT_MENU_WIDTH = 160;

type SettingsObjectInactiveMenuDropDownProps = {
  isCustomObject: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isReadOnly?: boolean;
};

export const SettingsObjectInactiveMenuDropDown = ({
  onActivate,
  onDelete,
  onEdit,
  isCustomObject,
  isReadOnly = false,
}: SettingsObjectInactiveMenuDropDownProps) => {
  const isEditable = isCustomObject && !isReadOnly;

  return (
    <Dropdown.Root kind="menu">
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={t`Inactive Object Options`}
            emphasis="subtle"
          >
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <Dropdown.Content align="end" width={INACTIVE_OBJECT_MENU_WIDTH}>
        <DropdownFocusEffect />
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={isEditable ? <IconPencil /> : <IconEye />}
            onClick={onEdit}
          >
            {isEditable ? t`Edit` : t`View`}
          </Dropdown.ActionItem>
          {!isReadOnly && (
            <Dropdown.ActionItem
              startIcon={<IconArchiveOff />}
              onClick={onActivate}
            >{t`Activate`}</Dropdown.ActionItem>
          )}
          {isCustomObject && !isReadOnly && (
            <Dropdown.ActionItem
              startIcon={<IconTrash />}
              color="danger"
              onClick={onDelete}
            >{t`Delete`}</Dropdown.ActionItem>
          )}
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
