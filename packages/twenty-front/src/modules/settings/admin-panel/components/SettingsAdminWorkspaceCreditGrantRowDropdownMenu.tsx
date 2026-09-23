import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';

type SettingsAdminWorkspaceCreditGrantRowDropdownMenuProps = {
  onRevoke: () => void;
};

export const SettingsAdminWorkspaceCreditGrantRowDropdownMenu = ({
  onRevoke,
}: SettingsAdminWorkspaceCreditGrantRowDropdownMenuProps) => {
  return (
    <Dropdown.Root kind="menu">
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <Dropdown.Content side="right" align="start">
        <DropdownFocusEffect />
        <Dropdown.Section>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={onRevoke}
          >{t`Revoke`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
