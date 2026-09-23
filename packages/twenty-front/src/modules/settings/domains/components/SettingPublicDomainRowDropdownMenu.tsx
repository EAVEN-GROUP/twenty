import { useState } from 'react';
import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useMutation, useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/primitives/feedback';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import {
  type PublicDomain,
  DeletePublicDomainDocument,
  FindManyPublicDomainsDocument,
} from '~/generated-metadata/graphql';

export const SettingPublicDomainRowDropdownMenu = ({
  publicDomain,
}: {
  publicDomain: PublicDomain;
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useLingui();

  const { enqueueToast } = useToast();

  const { refetch: refetchPublicDomains } = useQuery(
    FindManyPublicDomainsDocument,
  );

  const [deletePublicDomain] = useMutation(DeletePublicDomainDocument);

  const handleDeletePublicDomain = async () => {
    await deletePublicDomain({
      variables: {
        domain: publicDomain.domain,
      },
      onCompleted: () =>
        enqueueToast({
          variant: 'success',
          children: t`Custom domain successfully deleted`,
        }),
      onError: (error) => enqueueToast(getToastOptionsFromError({ error })),
    });
  };

  return (
    <Dropdown.Root kind="menu" open={open} onOpenChange={setOpen}>
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
            closeOnClick={false}
            color="danger"
            startIcon={<IconTrash />}
            onClick={async () => {
              await handleDeletePublicDomain();
              setOpen(false);
              await refetchPublicDomains();
            }}
          >{t`Delete`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
