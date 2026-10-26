import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { OPPORTUNITY_STATUS_VALUE } from '@/sales-pipeline/constants/OpportunityStatusValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { v4 } from 'uuid';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const CLOSED_OPPORTUNITY_STATUSES: unknown[] = [
  OPPORTUNITY_STATUS_VALUE.WON,
  OPPORTUNITY_STATUS_VALUE.LOST,
];

export const useMoveLeadOpportunitiesToCloser = () => {
  const apolloCoreClient = useApolloCoreClient();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { updateOneRecord } = useUpdateOneRecord();
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
  });

  const { findManyRecordsQuery: findLeadOpportunitiesQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      recordGqlFields: { id: true, status: true },
    });

  const moveLeadOpportunitiesToCloser = async ({
    personId,
    closerId,
    opportunityName,
  }: {
    personId: string;
    closerId: string | undefined;
    opportunityName: string;
  }) => {
    const { data } =
      await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
        query: findLeadOpportunitiesQuery,
        variables: { filter: { pointOfContactId: { eq: personId } } },
        fetchPolicy: 'network-only',
      });

    const openOpportunities = (data?.opportunities?.edges ?? [])
      .map(({ node }) => node)
      .filter(({ status }) => !CLOSED_OPPORTUNITY_STATUSES.includes(status));

    const closerFields = {
      status: OPPORTUNITY_STATUS_VALUE.MEETING_SCHEDULED,
      repId: closerId ?? null,
      nextContactAt: null,
    };

    if (openOpportunities.length === 0) {
      await createOneRecord({
        id: v4(),
        name: opportunityName,
        pointOfContactId: personId,
        ownerId: currentWorkspaceMember?.id,
        ...closerFields,
      });
      return;
    }

    await Promise.all(
      openOpportunities.map(({ id }) =>
        updateOneRecord({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          idToUpdate: id,
          updateOneRecordInput: closerFields,
        }),
      ),
    );
  };

  return { moveLeadOpportunitiesToCloser };
};
