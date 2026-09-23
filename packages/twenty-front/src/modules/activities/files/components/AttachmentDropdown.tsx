import { useContext } from 'react';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useLingui } from '@lingui/react/macro';
import {
  IconDotsVertical,
  IconDownload,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { Dropdown, LightIconButton } from 'twenty-ui/components';

const ATTACHMENT_MENU_WIDTH = 160;

type AttachmentDropdownProps = {
  onDownload: () => void;
  onDelete: () => void;
  onRename: () => void;
  hasDownloadPermission: boolean;
};

export const AttachmentDropdown = ({
  onDownload,
  onDelete,
  onRename,
  hasDownloadPermission,
}: AttachmentDropdownProps) => {
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);
  const { t } = useLingui();

  return (
    <Dropdown.Root kind="menu">
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <Dropdown.Content
        data-click-outside-id={parentClickOutsideId}
        align="end"
        width={ATTACHMENT_MENU_WIDTH}
      >
        <DropdownFocusEffect />
        <Dropdown.Section>
          {hasDownloadPermission && (
            <Dropdown.ActionItem
              startIcon={<IconDownload />}
              onClick={onDownload}
            >
              {t`Download`}
            </Dropdown.ActionItem>
          )}
          <Dropdown.ActionItem startIcon={<IconPencil />} onClick={onRename}>
            {t`Rename`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={onDelete}
          >
            {t`Delete`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
