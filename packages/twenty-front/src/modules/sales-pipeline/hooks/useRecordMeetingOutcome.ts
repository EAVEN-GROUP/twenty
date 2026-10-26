import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { MAX_MEETING_NO_SHOWS } from '@/sales-pipeline/constants/MaxMeetingNoShows';
import { MEETING_STATUS_VALUE } from '@/sales-pipeline/constants/MeetingStatusValue';
import { NO_SHOW_LOST_REASON_VALUE } from '@/sales-pipeline/constants/NoShowLostReasonValue';
import { OPPORTUNITY_STATUS_VALUE } from '@/sales-pipeline/constants/OpportunityStatusValue';
import { type MeetingOutcomeStatus } from '@/sales-pipeline/types/SalesPipelineFieldChange';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components/feedback';

export const useRecordMeetingOutcome = () => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();
  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueToast } = useToast();

  const { findOneRecordQuery: findMeetingQuery } = useFindOneRecordQuery({
    objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
    recordGqlFields: { id: true, personId: true },
  });

  const { findManyRecordsQuery: findNoShowMeetingsQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
      recordGqlFields: { id: true },
    });

  const { findManyRecordsQuery: findScheduledOpportunitiesQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      recordGqlFields: { id: true },
    });

  const loseScheduledOpportunitiesOfPerson = async (personId: string) => {
    const { data } =
      await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
        query: findScheduledOpportunitiesQuery,
        variables: {
          filter: {
            pointOfContactId: { eq: personId },
            status: { eq: OPPORTUNITY_STATUS_VALUE.MEETING_SCHEDULED },
          },
        },
        fetchPolicy: 'network-only',
      });

    await Promise.all(
      (data?.opportunities?.edges ?? []).map(({ node: { id } }) =>
        updateOneRecord({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          idToUpdate: id,
          updateOneRecordInput: {
            status: OPPORTUNITY_STATUS_VALUE.LOST,
            lostReason: NO_SHOW_LOST_REASON_VALUE,
            nextContactAt: null,
          },
        }),
      ),
    );
  };

  const recordMeetingOutcome = async ({
    meetingId,
    status,
  }: {
    meetingId: string;
    status: MeetingOutcomeStatus;
  }) => {
    const isNoShow = status === MEETING_STATUS_VALUE.NO_SHOW;

    await updateOneRecord({
      objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
      idToUpdate: meetingId,
      updateOneRecordInput: { showUp: !isNoShow },
    });

    if (!isNoShow) {
      return;
    }

    const { data: meetingData } = await apolloCoreClient.query<
      Record<string, RecordGqlNode>
    >({
      query: findMeetingQuery,
      variables: { objectRecordId: meetingId },
      fetchPolicy: 'network-only',
    });

    const personId = meetingData?.[MEETING_OBJECT_NAME_SINGULAR]?.personId;

    if (!isNonEmptyString(personId)) {
      return;
    }

    const { data: noShowsData } =
      await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
        query: findNoShowMeetingsQuery,
        variables: {
          filter: {
            personId: { eq: personId },
            status: { eq: MEETING_STATUS_VALUE.NO_SHOW },
          },
        },
        fetchPolicy: 'network-only',
      });

    if ((noShowsData?.meetings?.totalCount ?? 0) < MAX_MEETING_NO_SHOWS) {
      enqueueToast({
        status: 'info',
        children: t`No-show recorded. Book a new meeting with the lead.`,
      });
      return;
    }

    await loseScheduledOpportunitiesOfPerson(personId);

    enqueueToast({
      status: 'warning',
      children: t`Second no-show: the lead's deals are marked as lost.`,
    });
  };

  return { recordMeetingOutcome };
};
