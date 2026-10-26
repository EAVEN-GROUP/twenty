import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { createMeetingModalState } from '@/meetings/states/createMeetingModalState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { PERSON_STATUS_VALUE } from '@/sales-pipeline/constants/PersonStatusValue';
import { useLogLeadCall } from '@/sales-pipeline/hooks/useLogLeadCall';
import { useLogMissedCall } from '@/sales-pipeline/hooks/useLogMissedCall';
import { useRecordMeetingOutcome } from '@/sales-pipeline/hooks/useRecordMeetingOutcome';
import { salesPipelineOutcomeModalState } from '@/sales-pipeline/states/salesPipelineOutcomeModalState';
import { type PendingSalesPipelineFieldChange } from '@/sales-pipeline/types/PendingSalesPipelineFieldChange';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { Temporal } from 'temporal-polyfill';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components/feedback';

export const useProcessSalesPipelineFieldChange = () => {
  const { t } = useLingui();
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { userTimezone } = useUserTimezone();
  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueToast } = useToast();
  const { logMissedCall } = useLogMissedCall();
  const { logLeadCall } = useLogLeadCall();
  const { recordMeetingOutcome } = useRecordMeetingOutcome();

  const { findOneRecordQuery: findOpportunityQuery } = useFindOneRecordQuery({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
    recordGqlFields: { id: true, pointOfContactId: true, repId: true },
  });

  const updatePerson = (
    personId: string,
    updateOneRecordInput: Record<string, unknown>,
  ) =>
    updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Person,
      idToUpdate: personId,
      updateOneRecordInput,
    });

  const updateOpportunity = (
    opportunityId: string,
    updateOneRecordInput: Record<string, unknown>,
  ) =>
    updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      idToUpdate: opportunityId,
      updateOneRecordInput,
    });

  const openCloserMeetingModal = async (opportunityId: string) => {
    const { data } = await apolloCoreClient.query<
      Record<string, RecordGqlNode>
    >({
      query: findOpportunityQuery,
      variables: { objectRecordId: opportunityId },
      fetchPolicy: 'network-only',
    });

    const opportunity = data?.[CoreObjectNameSingular.Opportunity];

    if (!isNonEmptyString(opportunity?.pointOfContactId)) {
      enqueueToast({
        status: 'warning',
        children: t`This deal has no lead, so no meeting can be booked.`,
      });
      return;
    }

    store.set(createMeetingModalState.atom, {
      personId: opportunity.pointOfContactId,
      closerId: isNonEmptyString(opportunity.repId)
        ? opportunity.repId
        : currentWorkspaceMember?.id,
    });
  };

  const processChange = async ({
    recordId,
    change,
  }: PendingSalesPipelineFieldChange) => {
    const today = Temporal.Now.plainDateISO(userTimezone).toString();

    switch (change.type) {
      case 'missedCall': {
        const isMissedCallLogged = await logMissedCall({
          personId: recordId,
          previousStatus: change.previousStatus,
        });

        if (isMissedCallLogged) {
          await logLeadCall({
            personId: recordId,
            outcome: PERSON_STATUS_VALUE.NO_ANSWER,
          });
        }
        return;
      }
      case 'personOutcome':
        store.set(salesPipelineOutcomeModalState.atom, {
          objectNameSingular: CoreObjectNameSingular.Person,
          recordId,
          status: change.status,
        });
        await updatePerson(recordId, { callAttempts: 0, callDate: today });
        await logLeadCall({ personId: recordId, outcome: change.status });
        return;
      case 'booked':
        store.set(createMeetingModalState.atom, { personId: recordId });
        await updatePerson(recordId, {
          callAttempts: 0,
          callDate: today,
          nextCallAt: null,
        });
        await logLeadCall({
          personId: recordId,
          outcome: PERSON_STATUS_VALUE.BOOKED,
        });
        return;
      case 'unreachable':
        await updatePerson(recordId, { nextCallAt: null });
        return;
      case 'opportunityOutcome':
        store.set(salesPipelineOutcomeModalState.atom, {
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          recordId,
          status: change.status,
        });
        return;
      case 'opportunityWon':
        await updateOpportunity(recordId, {
          signedAt: today,
          nextContactAt: null,
        });
        return;
      case 'opportunityMeeting':
        await updateOpportunity(recordId, { nextContactAt: null });
        await openCloserMeetingModal(recordId);
        return;
      case 'meetingOutcome':
        await recordMeetingOutcome({
          meetingId: recordId,
          status: change.status,
        });
        return;
    }
  };

  const processSalesPipelineFieldChange = async (
    pendingChange: PendingSalesPipelineFieldChange,
  ) => {
    try {
      await processChange(pendingChange);
    } catch {
      enqueueToast({
        status: 'error',
        children: t`The sales pipeline could not be updated for this change.`,
      });
    }
  };

  return { processSalesPipelineFieldChange };
};
