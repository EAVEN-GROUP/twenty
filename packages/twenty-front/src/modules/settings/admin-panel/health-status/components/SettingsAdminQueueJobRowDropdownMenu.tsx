import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconRefresh, IconTrash } from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { isDefined } from 'twenty-shared/utils';
import { JobState } from '~/generated-admin/graphql';

type SettingsAdminQueueJobRowDropdownMenuProps = {
  jobState: JobState;
  onRetry?: () => void;
  onDelete: () => void;
};

export const SettingsAdminQueueJobRowDropdownMenu = ({
  jobState,
  onRetry,
  onDelete,
}: SettingsAdminQueueJobRowDropdownMenuProps) => {
  return (
    <Dropdown.Root kind="menu">
      <Dropdown.Trigger
        render={
          <LightIconButton aria-label={t`Job Actions`} emphasis="subtle">
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <Dropdown.Content side="right" align="start">
        <DropdownFocusEffect />
        <Dropdown.Section>
          {jobState === JobState.FAILED && isDefined(onRetry) && (
            <Dropdown.ActionItem
              startIcon={<IconRefresh />}
              onClick={onRetry}
            >{t`Retry`}</Dropdown.ActionItem>
          )}
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={onDelete}
          >{t`Delete`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
