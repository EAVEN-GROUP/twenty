import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  SettingsPath,
} from 'twenty-shared/types';

import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  IconAt,
  IconCalendarEvent,
  IconDotsVertical,
  IconMail,
  IconPlayerPlay,
  IconRefresh,
  IconTrash,
} from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { Link } from 'react-router-dom';
import { getSettingsPath } from 'twenty-shared/utils';
import { DELETE_CONNECTED_ACCOUNT } from '../graphql/mutations/deleteConnectedAccount';

type SettingsAccountsRowDropdownMenuProps = {
  account: ConnectedAccount;
};

export const SettingsAccountsRowDropdownMenu = ({
  account,
}: SettingsAccountsRowDropdownMenuProps) => {
  const deleteAccountModalId = `delete-account-modal-${account.id}`;
  const accountHandle = account.handle;

  const { t } = useLingui();
  const { openDialog } = useDialog();

  const apolloClient = useApolloClient();
  const [deleteConnectedAccountMutation] = useMutation(
    DELETE_CONNECTED_ACCOUNT,
  );
  const { triggerProviderReconnect } = useTriggerProviderReconnect();

  const hasPendingConfiguration =
    account.messageChannels.some(
      (channel) =>
        channel.syncStage === MessageChannelSyncStage.PENDING_CONFIGURATION,
    ) ||
    account.calendarChannels.some(
      (channel) =>
        channel.syncStage === CalendarChannelSyncStage.PENDING_CONFIGURATION,
    );

  const deleteAccount = async () => {
    await deleteConnectedAccountMutation({
      variables: { id: account.id },
    });
    await apolloClient.refetchQueries({ include: 'active' });
  };

  return (
    <>
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
            {hasPendingConfiguration && (
              <Dropdown.ActionItem
                startIcon={<IconPlayerPlay />}
                render={
                  <Link
                    to={getSettingsPath(SettingsPath.AccountsConfiguration, {
                      connectedAccountId: account.id,
                    })}
                  />
                }
              >{t`Complete setup`}</Dropdown.ActionItem>
            )}
            {account.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
              <Dropdown.ActionItem
                startIcon={<IconAt />}
                render={
                  <Link
                    to={getSettingsPath(
                      SettingsPath.EditImapSmtpCaldavConnection,
                      {
                        connectedAccountId: account.id,
                      },
                    )}
                  />
                }
              >{t`Connection settings`}</Dropdown.ActionItem>
            )}
            <Dropdown.ActionItem
              startIcon={<IconMail />}
              render={
                <Link to={getSettingsPath(SettingsPath.AccountsEmails)} />
              }
            >{t`Emails settings`}</Dropdown.ActionItem>
            <Dropdown.ActionItem
              startIcon={<IconCalendarEvent />}
              render={
                <Link to={getSettingsPath(SettingsPath.AccountsCalendars)} />
              }
            >{t`Calendar settings`}</Dropdown.ActionItem>
            {account.authFailedAt && (
              <Dropdown.ActionItem
                startIcon={<IconRefresh />}
                onClick={() => {
                  triggerProviderReconnect(account.provider, account.id);
                }}
              >{t`Reconnect`}</Dropdown.ActionItem>
            )}
            <Dropdown.ActionItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => {
                openDialog(deleteAccountModalId);
              }}
            >{t`Remove account`}</Dropdown.ActionItem>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Root>
      <ConfirmationDialog
        dialogId={deleteAccountModalId}
        title={t`Data deletion`}
        subtitle={
          <Trans>
            All emails and events linked to this account ({accountHandle}) will
            be deleted
          </Trans>
        }
        onConfirmClick={deleteAccount}
        confirmButtonText={t`Delete account`}
      />
    </>
  );
};
