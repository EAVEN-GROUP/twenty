import { CreateMeetingModalDateStep } from '@/meetings/components/CreateMeetingModalDateStep';
import { CreateMeetingModalNameStep } from '@/meetings/components/CreateMeetingModalNameStep';
import { CREATE_MEETING_MODAL_ID } from '@/meetings/constants/CreateMeetingModalId';
import { PERSON_NAME_FIELD_NAME } from '@/meetings/constants/PersonNameFieldName';
import { useCanCreateMeetings } from '@/meetings/hooks/useCanCreateMeetings';
import { useCreateMeetingForPerson } from '@/meetings/hooks/useCreateMeetingForPerson';
import { useUpdatePersonName } from '@/meetings/hooks/useUpdatePersonName';
import { createMeetingModalState } from '@/meetings/states/createMeetingModalState';
import { type CreateMeetingModalStep } from '@/meetings/types/CreateMeetingModalStep';
import { normalizePersonName } from '@/meetings/utils/normalizePersonName';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { type Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';

const StyledActionSlot = styled.div`
  flex: 1;
`;

const CreateMeetingModalContent = ({ personId }: { personId: string }) => {
  const { t } = useLingui();
  const store = useStore();
  const { openDialog, closeDialog } = useDialog();
  const { enqueueToast } = useToast();
  const setCreateMeetingModal = useSetAtomState(createMeetingModalState);

  const [step, setStep] = useState<CreateMeetingModalStep>('name');
  const [personName, setPersonName] = useState<FieldFullNameValue>(() =>
    normalizePersonName(
      store.get(
        recordStoreFamilySelector.selectorFamily({
          recordId: personId,
          fieldName: PERSON_NAME_FIELD_NAME,
        }),
      ) as FieldFullNameValue | undefined,
    ),
  );
  const [isSavingPersonName, setIsSavingPersonName] = useState(false);
  const [meetingDate, setMeetingDate] = useState<Temporal.ZonedDateTime | null>(
    null,
  );

  const { updatePersonName } = useUpdatePersonName();
  const { createMeetingForPerson, loading } = useCreateMeetingForPerson();

  const { firstName, lastName } = normalizePersonName(personName);
  const personFullName = `${firstName} ${lastName}`.trim();

  useEffect(() => {
    openDialog(CREATE_MEETING_MODAL_ID);
  }, [openDialog]);

  const handleClose = () => {
    closeDialog(CREATE_MEETING_MODAL_ID);
    setCreateMeetingModal(null);
  };

  const handleNext = async () => {
    if (isSavingPersonName) {
      return;
    }

    setIsSavingPersonName(true);

    try {
      await updatePersonName({ personId, personName });
      setStep('date');
    } catch {
      enqueueToast({
        status: 'error',
        children: t`The name could not be saved.`,
      });
    } finally {
      setIsSavingPersonName(false);
    }
  };

  const handleSubmit = async () => {
    if (!isDefined(meetingDate)) {
      return;
    }

    try {
      await createMeetingForPerson({
        personId,
        meetingDate: meetingDate.toInstant().toString(),
        meetingName: personFullName,
      });
      handleClose();
    } catch {
      enqueueToast({
        status: 'error',
        children: t`The meeting could not be created.`,
      });
    }
  };

  const title =
    step === 'name'
      ? t`Who is the meeting with?`
      : personFullName.length > 0
        ? t`Book a meeting with ${personFullName}`
        : t`Book a meeting`;

  return (
    <DialogInstance
      dialogId={CREATE_MEETING_MODAL_ID}
      dismissible
      onClose={() => setCreateMeetingModal(null)}
      onEnter={step === 'name' ? handleNext : undefined}
      renderInDocumentBody
    >
      {({ onKeyDown }) => (
        <Dialog.Popup
          onKeyDown={onKeyDown}
          size="compact"
          data-globally-prevent-click-outside
        >
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {step === 'name' ? (
              <CreateMeetingModalNameStep
                personName={personName}
                onPersonNameChange={setPersonName}
              />
            ) : (
              <CreateMeetingModalDateStep
                meetingDate={meetingDate}
                onMeetingDateChange={setMeetingDate}
              />
            )}
          </Dialog.Body>
          {step === 'name' ? (
            <Dialog.Footer>
              <StyledActionSlot>
                <Button onClick={handleClose} variant="outline" fullWidth>
                  {t`Skip`}
                </Button>
              </StyledActionSlot>
              <StyledActionSlot>
                <Button
                  onClick={handleNext}
                  variant="solid"
                  color="accent"
                  disabled={isSavingPersonName}
                  fullWidth
                >
                  {t`Next`}
                </Button>
              </StyledActionSlot>
            </Dialog.Footer>
          ) : (
            <Dialog.Footer>
              <StyledActionSlot>
                <Button
                  onClick={() => setStep('name')}
                  variant="outline"
                  fullWidth
                >
                  {t`Back`}
                </Button>
              </StyledActionSlot>
              <StyledActionSlot>
                <Button
                  onClick={handleSubmit}
                  variant="solid"
                  color="accent"
                  disabled={!isDefined(meetingDate) || loading}
                  fullWidth
                >
                  {t`Book meeting`}
                </Button>
              </StyledActionSlot>
            </Dialog.Footer>
          )}
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};

export const CreateMeetingModal = () => {
  const createMeetingModal = useAtomStateValue(createMeetingModalState);
  const canCreateMeetings = useCanCreateMeetings();

  if (!isDefined(createMeetingModal) || !canCreateMeetings) {
    return null;
  }

  return <CreateMeetingModalContent personId={createMeetingModal.personId} />;
};
