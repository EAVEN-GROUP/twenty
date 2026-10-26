import { PersonNameFields } from '@/meetings/components/PersonNameFields';
import { PERSON_NAME_FIELD_NAME } from '@/meetings/constants/PersonNameFieldName';
import { getEditablePersonName } from '@/meetings/utils/getEditablePersonName';
import { normalizePersonName } from '@/meetings/utils/normalizePersonName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  type FieldEmailsValue,
  type FieldFullNameValue,
  type FieldPhonesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { SalesPipelineSendInfoFields } from '@/sales-pipeline/components/SalesPipelineSendInfoFields';
import { DEFAULT_MORNING_CALL_HOUR } from '@/sales-pipeline/constants/DefaultMorningCallHour';
import { INFO_CHANNEL_VALUE } from '@/sales-pipeline/constants/InfoChannelValue';
import { NO_SHOW_LOST_REASON_VALUE } from '@/sales-pipeline/constants/NoShowLostReasonValue';
import { OPPORTUNITY_STATUS_VALUE } from '@/sales-pipeline/constants/OpportunityStatusValue';
import { PERSON_STATUS_VALUE } from '@/sales-pipeline/constants/PersonStatusValue';
import { SALES_PIPELINE_OUTCOME_MODAL_ID } from '@/sales-pipeline/constants/SalesPipelineOutcomeModalId';
import { salesPipelineOutcomeModalState } from '@/sales-pipeline/states/salesPipelineOutcomeModalState';
import { type InfoChannel } from '@/sales-pipeline/types/InfoChannel';
import { type SalesPipelineOutcome } from '@/sales-pipeline/types/SalesPipelineOutcome';
import { addWorkingDays } from '@/sales-pipeline/utils/addWorkingDays';
import { getSendInfoContactUpdate } from '@/sales-pipeline/utils/getSendInfoContactUpdate';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const LOST_REASON_FIELD_NAME = 'lostReason';

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPickerContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledActionSlot = styled.div`
  flex: 1;
`;

const isLostOutcome = ({ status }: SalesPipelineOutcome) =>
  status === PERSON_STATUS_VALUE.NOT_BOOKED ||
  status === OPPORTUNITY_STATUS_VALUE.LOST;

const getNextContactFieldName = ({
  objectNameSingular,
}: SalesPipelineOutcome) =>
  objectNameSingular === 'person' ? 'nextCallAt' : 'nextContactAt';

const getDefaultNextContactAt = (
  outcome: SalesPipelineOutcome,
  timeZone: string,
) =>
  addWorkingDays({
    from: Temporal.Now.zonedDateTimeISO(timeZone),
    workingDays: outcome.status === PERSON_STATUS_VALUE.FOLLOW_UP ? 1 : 2,
    hour: DEFAULT_MORNING_CALL_HOUR,
  });

const SalesPipelineOutcomeModalContent = ({
  outcome,
}: {
  outcome: SalesPipelineOutcome;
}) => {
  const { t } = useLingui();
  const store = useStore();
  const { openDialog, closeDialog } = useDialog();
  const { enqueueToast } = useToast();
  const { userTimezone } = useUserTimezone();
  const { updateOneRecord } = useUpdateOneRecord();
  const setSalesPipelineOutcomeModal = useSetAtomState(
    salesPipelineOutcomeModalState,
  );
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: outcome.objectNameSingular,
  });

  const isLost = isLostOutcome(outcome);
  const isSendInfo = outcome.status === PERSON_STATUS_VALUE.SEND_INFO;
  const isPersonNameAsked = outcome.objectNameSingular === 'person' && !isLost;

  const getRecordFieldValue = (fieldName: string) =>
    store.get(
      recordStoreFamilySelector.selectorFamily({
        recordId: outcome.recordId,
        fieldName,
      }),
    );

  const currentEmails = getRecordFieldValue('emails') as
    | FieldEmailsValue
    | null
    | undefined;
  const currentPhones = getRecordFieldValue('phones') as
    | FieldPhonesValue
    | null
    | undefined;
  const currentPersonName = getRecordFieldValue(PERSON_NAME_FIELD_NAME) as
    | FieldFullNameValue
    | undefined;

  const [nextContactAt, setNextContactAt] = useState<Temporal.ZonedDateTime>(
    () => getDefaultNextContactAt(outcome, userTimezone),
  );
  const [personName, setPersonName] = useState<FieldFullNameValue>(() =>
    getEditablePersonName(currentPersonName),
  );
  const [infoChannel, setInfoChannel] = useState<InfoChannel>(
    INFO_CHANNEL_VALUE.WHATSAPP,
  );
  const [phoneNumber, setPhoneNumber] = useState(
    currentPhones?.primaryPhoneNumber ?? '',
  );
  const [email, setEmail] = useState(currentEmails?.primaryEmail ?? '');
  const [isSaving, setIsSaving] = useState(false);

  // NO_SHOW is set by the meeting flow, not picked by hand.
  const lostReasonOptions = (
    objectMetadataItem.fields.find(
      ({ name }) => name === LOST_REASON_FIELD_NAME,
    )?.options ?? []
  )
    .filter(({ value }) => value !== NO_SHOW_LOST_REASON_VALUE)
    .toSorted((left, right) => left.position - right.position);

  useEffect(() => {
    openDialog(SALES_PIPELINE_OUTCOME_MODAL_ID);
  }, [openDialog]);

  const save = async (updateOneRecordInput: Record<string, unknown>) => {
    setIsSaving(true);

    try {
      await updateOneRecord({
        objectNameSingular: outcome.objectNameSingular,
        idToUpdate: outcome.recordId,
        updateOneRecordInput,
      });
    } catch {
      enqueueToast({
        status: 'error',
        children: t`The details could not be saved.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const close = () => {
    closeDialog(SALES_PIPELINE_OUTCOME_MODAL_ID);
    setSalesPipelineOutcomeModal(null);
  };

  const nextContactFieldName = getNextContactFieldName(outcome);

  const handleConfirm = async () => {
    const nextPersonName = normalizePersonName(personName);
    const shouldUpdatePersonName =
      isPersonNameAsked &&
      !isDeeplyEqual(nextPersonName, normalizePersonName(currentPersonName));

    await save({
      [nextContactFieldName]: nextContactAt.toInstant().toString(),
      ...(shouldUpdatePersonName && {
        [PERSON_NAME_FIELD_NAME]: nextPersonName,
      }),
      ...(isSendInfo &&
        getSendInfoContactUpdate({
          infoChannel,
          phoneNumber,
          email,
          currentPhones,
          currentEmails,
        })),
    });
    close();
  };

  const handleLostReasonClick = async (lostReason: string) => {
    await save({
      [LOST_REASON_FIELD_NAME]: lostReason,
      [nextContactFieldName]: null,
    });
    close();
  };

  // Dismissing must not leave an open lead without a next call in the queue.
  const handleDismiss = () => {
    setSalesPipelineOutcomeModal(null);

    void save(
      isLost
        ? { [nextContactFieldName]: null }
        : {
            [nextContactFieldName]: getDefaultNextContactAt(
              outcome,
              userTimezone,
            )
              .toInstant()
              .toString(),
          },
    );
  };

  const getTitle = () => {
    switch (outcome.status) {
      case PERSON_STATUS_VALUE.FOLLOW_UP:
        return t`When should we call back?`;
      case PERSON_STATUS_VALUE.SEND_INFO:
        return t`Where do we send the info, and when do we call back?`;
      case PERSON_STATUS_VALUE.NOT_BOOKED:
        return t`Why is the lead not interested?`;
      case OPPORTUNITY_STATUS_VALUE.NEGOTIATION:
        return t`When is the next contact?`;
      case OPPORTUNITY_STATUS_VALUE.CONTRACT_SENT:
        return t`When do we follow up on the contract?`;
      case OPPORTUNITY_STATUS_VALUE.LOST:
        return t`Why was the deal lost?`;
    }
  };

  return (
    <DialogInstance
      dialogId={SALES_PIPELINE_OUTCOME_MODAL_ID}
      dismissible
      onClose={handleDismiss}
      onEnter={isLost ? undefined : handleConfirm}
      renderInDocumentBody
    >
      {({ onKeyDown }) => (
        <Dialog.Popup
          onKeyDown={onKeyDown}
          size="compact"
          data-globally-prevent-click-outside
        >
          <Dialog.Header>
            <Dialog.Title>{getTitle()}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {isLost ? (
              <StyledBody>
                {lostReasonOptions.map(({ value, label }) => (
                  <Button
                    key={value}
                    onClick={() => handleLostReasonClick(value)}
                    variant="outline"
                    disabled={isSaving}
                    fullWidth
                  >
                    {label}
                  </Button>
                ))}
              </StyledBody>
            ) : (
              <StyledBody>
                {isPersonNameAsked && (
                  <PersonNameFields
                    personName={personName}
                    onPersonNameChange={setPersonName}
                    autoFocus
                  />
                )}
                {isSendInfo && (
                  <SalesPipelineSendInfoFields
                    infoChannel={infoChannel}
                    onInfoChannelChange={setInfoChannel}
                    phoneNumber={phoneNumber}
                    onPhoneNumberChange={setPhoneNumber}
                    email={email}
                    onEmailChange={setEmail}
                  />
                )}
                <StyledPickerContainer>
                  <DateTimePicker
                    instanceId={`${SALES_PIPELINE_OUTCOME_MODAL_ID}-date-time-picker`}
                    date={nextContactAt}
                    onChange={(date) => {
                      if (isDefined(date)) {
                        setNextContactAt(date);
                      }
                    }}
                    clearable={false}
                  />
                </StyledPickerContainer>
              </StyledBody>
            )}
          </Dialog.Body>
          {!isLost && (
            <Dialog.Footer>
              <StyledActionSlot>
                <Button
                  onClick={handleConfirm}
                  variant="solid"
                  color="accent"
                  disabled={isSaving}
                  fullWidth
                >
                  {t`Save`}
                </Button>
              </StyledActionSlot>
            </Dialog.Footer>
          )}
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};

export const SalesPipelineOutcomeModal = () => {
  const salesPipelineOutcomeModal = useAtomStateValue(
    salesPipelineOutcomeModalState,
  );

  if (!isDefined(salesPipelineOutcomeModal)) {
    return null;
  }

  return (
    <SalesPipelineOutcomeModalContent
      key={`${salesPipelineOutcomeModal.recordId}-${salesPipelineOutcomeModal.status}`}
      outcome={salesPipelineOutcomeModal}
    />
  );
};
