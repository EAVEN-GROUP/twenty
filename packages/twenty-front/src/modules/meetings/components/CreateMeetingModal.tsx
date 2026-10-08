import { CREATE_MEETING_MODAL_ID } from '@/meetings/constants/CreateMeetingModalId';
import { useCanCreateMeetings } from '@/meetings/hooks/useCanCreateMeetings';
import { useCreateMeetingForPerson } from '@/meetings/hooks/useCreateMeetingForPerson';
import { createMeetingModalState } from '@/meetings/states/createMeetingModalState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { type KeyboardEvent, useEffect, useState } from 'react';
import { type Temporal } from 'temporal-polyfill';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledPickerContainer = styled.div`
  display: flex;
  justify-content: center;
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
  const [meetingDate, setMeetingDate] = useState<Temporal.ZonedDateTime | null>(
    null,
  );

  const { createMeetingForPerson, loading } = useCreateMeetingForPerson();

  const { objectMetadataItem: personObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Person,
    });
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, personId);

  const personName = isDefined(recordStore)
    ? getObjectRecordIdentifier({
        objectMetadataItem: personObjectMetadataItem,
        record: recordStore,
        allowRequestsToTwentyIcons: false,
      }).name
    : '';

  useEffect(() => {
    openModal(CREATE_MEETING_MODAL_ID);
  }, [openModal]);

  const handleClose = () => {
    closeModal(CREATE_MEETING_MODAL_ID);
    setCreateMeetingModal(null);
  };

  // The calendar keeps keyboard focus on a day cell and swallows Escape before
  // the modal hotkey sees it. Only act while the modal is the focused layer so
  // an open month/year dropdown still closes first.
  const handlePickerKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== 'Escape' ||
      store.get(currentFocusIdSelector.atom) !== scopedModalInstanceId
    ) {
      return;
    }

    event.stopPropagation();
    handleClose();
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

  return (
    <ModalStatefulWrapper
      modalInstanceId={CREATE_MEETING_MODAL_ID}
      onClose={handleClose}
      isClosable
      size="small"
      padding="large"
      overlay="dark"
      dataGloballyPreventClickOutside
      renderInDocumentBody
      smallBorderRadius
      autoHeight
    >
      <StyledCenteredTitle>
        <H1Title
          title={
            personName.length > 0
              ? t`Book a meeting with ${personName}`
              : t`Book a meeting`
          }
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledCenteredTitle>
      <StyledPickerContainer onKeyDownCapture={handlePickerKeyDownCapture}>
        <DateTimePicker
          instanceId={`${CREATE_MEETING_MODAL_ID}-date-time-picker`}
          date={meetingDate}
          onChange={setMeetingDate}
          clearable={false}
        />
      </StyledPickerContainer>
      <StyledModalActions>
        <Button
          onClick={handleClose}
          variant="secondary"
          title={t`Skip`}
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
