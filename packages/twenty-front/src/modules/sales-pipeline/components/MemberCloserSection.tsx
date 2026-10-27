import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { CLOSER_FIELD_NAME } from '@/sales-pipeline/constants/CloserFieldName';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconTargetArrow } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

type MemberCloserSectionProps = {
  memberId: string;
};

export const MemberCloserSection = ({ memberId }: MemberCloserSectionProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { updateOneRecord } = useUpdateOneRecord();
  const [isSaving, setIsSaving] = useState(false);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const hasCloserField = objectMetadataItem.fields.some(
    ({ name }) => name === CLOSER_FIELD_NAME,
  );

  const { record: member } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: memberId,
    recordGqlFields: { id: true, [CLOSER_FIELD_NAME]: true },
    skip: !hasCloserField,
  });

  if (!hasCloserField) {
    return null;
  }

  const handleChange = async (isCloser: boolean) => {
    setIsSaving(true);

    try {
      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
        idToUpdate: memberId,
        updateOneRecordInput: { [CLOSER_FIELD_NAME]: isCloser },
      });
    } catch {
      enqueueToast({
        status: 'error',
        children: t`The closer setting could not be saved.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Closer`}
        description={t`Closers take turns receiving the meetings booked by the setters`}
      />
      <Card.Root>
        <SettingsOptionCardContentSwitch
          Icon={IconTargetArrow}
          title={t`Receives the meetings booked by the setters`}
          checked={member?.[CLOSER_FIELD_NAME] === true}
          disabled={isSaving || member === undefined}
          onChange={handleChange}
        />
      </Card.Root>
    </Section.Root>
  );
};
