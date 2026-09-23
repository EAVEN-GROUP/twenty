import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { useDeleteSsoIdentityProvider } from '@/settings/security/hooks/useDeleteSsoIdentityProvider';
import { useUpdateSsoIdentityProvider } from '@/settings/security/hooks/useUpdateSsoIdentityProvider';
import { type SsoIdentityProvider } from '@/settings/security/types/SsoIdentityProvider';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';
import { IconArchive, IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { SsoIdentityProviderStatus } from '~/generated-metadata/graphql';

type SettingsSecuritySsoRowDropdownMenuProps = {
  ssoIdp: Omit<SsoIdentityProvider, '__typename'>;
};

export const SettingsSecuritySsoRowDropdownMenu = ({
  ssoIdp,
}: SettingsSecuritySsoRowDropdownMenuProps) => {
  const { enqueueToast } = useToast();

  const { deleteSsoIdentityProvider } = useDeleteSsoIdentityProvider();
  const { updateSsoIdentityProvider } = useUpdateSsoIdentityProvider();

  const { t } = useLingui();

  const handleDeleteSsoIdentityProvider = async (
    identityProviderId: string,
  ) => {
    const result = await deleteSsoIdentityProvider({
      identityProviderId,
    });
    if (isDefined(result.error)) {
      enqueueToast({
        variant: 'error',
        children: t`Error deleting SSO Identity Provider`,
        duration: 2000,
      });
    }
  };

  const toggleSsoIdentityProviderStatus = async (
    identityProviderId: string,
  ) => {
    const result = await updateSsoIdentityProvider({
      id: identityProviderId,
      status:
        ssoIdp.status === 'Active'
          ? SsoIdentityProviderStatus.Inactive
          : SsoIdentityProviderStatus.Active,
    });
    if (isDefined(result.error)) {
      enqueueToast({
        variant: 'error',
        children: t`Error editing SSO Identity Provider`,
        duration: 2000,
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
      <Dropdown.Content side="right" align="start">
        <DropdownFocusEffect />
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconArchive />}
            onClick={() => {
              toggleSsoIdentityProviderStatus(ssoIdp.id);
            }}
          >
            {ssoIdp.status === 'Active' ? t`Deactivate` : t`Activate`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            color="danger"
            startIcon={<IconTrash />}
            onClick={() => {
              handleDeleteSsoIdentityProvider(ssoIdp.id);
            }}
          >{t`Delete`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
