import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';

import { useToast } from 'twenty-ui/primitives/feedback';
import { IconDotsVertical, IconLogout } from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import {
  CurrentUserSessionsDocument,
  RevokeUserSessionDocument,
} from '~/generated-metadata/graphql';

type SettingsDeviceSessionRowDropdownMenuProps = {
  userSessionId: string;
};

export const SettingsDeviceSessionRowDropdownMenu = ({
  userSessionId,
}: SettingsDeviceSessionRowDropdownMenuProps) => {
  const { enqueueToast } = useToast();

  const [revokeUserSession] = useMutation(RevokeUserSessionDocument, {
    refetchQueries: [CurrentUserSessionsDocument],
  });

  const handleRevokeSession = async () => {
    try {
      await revokeUserSession({ variables: { userSessionId } });
      enqueueToast({ variant: 'success', children: t`Device logged out` });
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to log out this device`,
      });
    }
  };

  return (
    <Dropdown.Root kind="menu">
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <Dropdown.Content side="bottom" align="end">
        <DropdownFocusEffect />
        <Dropdown.Section>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconLogout />}
            onClick={handleRevokeSession}
          >{t`Log out`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
