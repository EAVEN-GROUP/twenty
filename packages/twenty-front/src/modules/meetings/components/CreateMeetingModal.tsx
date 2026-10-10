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
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { type KeyboardEvent, useEffect, useState } from 'react';
import { type Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledModalActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};

  > div {
    flex: 1;
  }
`;

const CreateMeetingModalContent = ({ personId }: { personId: string }) => {
  const { t } = useLingui();
  const store = useStore();
  const { openModal, closeModal } = useModal();
  const scopedModalInstanceId = useWorkspaceSurfaceScopedComponentInstanceId(
    CREATE_MEETING_MODAL_ID,
  );
  const { enqueueErrorSnackBar } = useSnackBar();
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
    openModal(CREATE_MEETING_MODAL_ID);
  }, [openModal]);

  const handleClose = () => {
    closeModal(CREATE_MEETING_MODAL_ID);
    setCreateMeetingModal(null);
  };

  // The modal popup stops Escape from reaching the modal hotkey whenever focus
  // is inside it (name inputs, buttons, calendar days). Only act while the
  // modal is the focused layer so an open month/year dropdown still closes
  // first.
  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== 'Escape' ||
      store.get(currentFocusIdSelector.atom) !== scopedModalInstanceId
    ) {
      return;
    }

    event.stopPropagation();
    handleClose();
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
      enqueueErrorSnackBar({
        message: t`The name could not be saved.`,
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
      });
      handleClose();
    } catch {
      enqueueErrorSnackBar({
        message: t`The meeting could not be created.`,
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
    <ModalStatefulWrapper
      modalInstanceId={CREATE_MEETING_MODAL_ID}
      onClose={handleClose}
      onEnter={step === 'name' ? handleNext : undefined}
      isClosable
      size="small"
      padding="large"
      overlay="dark"
      dataGloballyPreventClickOutside
      renderInDocumentBody
      smallBorderRadius
      autoHeight
    >
      <div onKeyDownCapture={handleKeyDownCapture}>
        <StyledCenteredTitle>
          <H1Title title={title} fontColor={H1TitleFontColor.Primary} />
        </StyledCenteredTitle>
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
        {step === 'name' ? (
          <StyledModalActions>
            <Button
              onClick={handleClose}
              variant="secondary"
              title={t`Skip`}
              fullWidth
              justify="center"
            />
            <Button
              onClick={handleNext}
              variant="primary"
              accent="blue"
              title={t`Next`}
              disabled={isSavingPersonName}
              fullWidth
              justify="center"
            />
          </StyledModalActions>
        ) : (
          <StyledModalActions>
            <Button
              onClick={() => setStep('name')}
              variant="secondary"
              title={t`Back`}
              fullWidth
              justify="center"
            />
            <Button
              onClick={handleSubmit}
              variant="primary"
              accent="blue"
              title={t`Book meeting`}
              disabled={!isDefined(meetingDate) || loading}
              fullWidth
              justify="center"
            />
          </StyledModalActions>
        )}
      </div>
    </ModalStatefulWrapper>
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
