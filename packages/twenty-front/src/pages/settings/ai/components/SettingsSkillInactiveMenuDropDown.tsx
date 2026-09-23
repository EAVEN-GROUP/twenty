import { t } from '@lingui/core/macro';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconArchiveOff, IconDotsVertical, IconTrash } from 'twenty-ui/icon';

import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';

const INACTIVE_SKILL_MENU_WIDTH = 160;

type SettingsSkillInactiveMenuDropDownProps = {
  isCustomSkill: boolean;
  onActivate: () => void;
  onDelete: () => void;
};

export const SettingsSkillInactiveMenuDropDown = ({
  onActivate,
  onDelete,
  isCustomSkill,
}: SettingsSkillInactiveMenuDropDownProps) => (
  <Dropdown.Root kind="menu">
    <Dropdown.Trigger
      render={
        <LightIconButton
          aria-label={t`Inactive Skill Options`}
          emphasis="subtle"
        >
          <IconDotsVertical />
        </LightIconButton>
      }
    />
    <Dropdown.Content align="end" width={INACTIVE_SKILL_MENU_WIDTH}>
      <DropdownFocusEffect />
      <Dropdown.Section>
        <Dropdown.ActionItem
          startIcon={<IconArchiveOff />}
          onClick={onActivate}
        >{t`Activate`}</Dropdown.ActionItem>
        {isCustomSkill && (
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
