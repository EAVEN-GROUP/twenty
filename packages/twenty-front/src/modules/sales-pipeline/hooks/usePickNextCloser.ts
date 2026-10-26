import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { pickNextCloserId } from '@/sales-pipeline/utils/pickNextCloserId';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const RECENT_MEETINGS_LIMIT = 200;

type Closer = {
  id: string;
  name: string;
};

export const usePickNextCloser = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { findManyRecordsQuery: findClosersQuery } = useFindManyRecordsQuery({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    recordGqlFields: { id: true, name: true },
  });

  const { findManyRecordsQuery: findRecentMeetingsQuery } =
    useFindManyRecordsQuery({
      objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
      recordGqlFields: { id: true, ownerId: true, createdAt: true },
    });

  // Round robin: the closer whose latest meeting is the oldest gets the next one.
  const pickNextCloser = async (): Promise<Closer | undefined> => {
    const { data: closersData } =
      await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
        query: findClosersQuery,
        variables: {
          filter: { isCloser: { eq: true } },
          orderBy: [{ createdAt: 'AscNullsLast' }],
        },
        fetchPolicy: 'network-only',
      });

    const closers = (closersData?.workspaceMembers?.edges ?? []).map(
      ({ node }) => node,
    );

    if (closers.length === 0) {
      return undefined;
    }

    const closerIds = closers.map(({ id }) => id);

    const { data: meetingsData } =
      await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
        query: findRecentMeetingsQuery,
        variables: {
          filter: { ownerId: { in: closerIds } },
          orderBy: [{ createdAt: 'DescNullsLast' }],
          limit: RECENT_MEETINGS_LIMIT,
        },
        fetchPolicy: 'network-only',
      });

    const lastAssignedAtByCloserId = new Map<string, string>();

    for (const meeting of (meetingsData?.meetings?.edges ?? []).map(
      ({ node }) => node,
    )) {
      if (
        isNonEmptyString(meeting.ownerId) &&
        !lastAssignedAtByCloserId.has(meeting.ownerId)
      ) {
        lastAssignedAtByCloserId.set(meeting.ownerId, meeting.createdAt);
      }
    }

    const closerId = pickNextCloserId({ closerIds, lastAssignedAtByCloserId });
    const closer = closers.find(({ id }) => id === closerId);

    if (!isDefined(closer)) {
      return undefined;
    }

    const closerName = closer.name as FieldFullNameValue | undefined;

    return {
      id: closer.id,
      name: `${closerName?.firstName ?? ''} ${closerName?.lastName ?? ''}`.trim(),
    };
  };

  return { pickNextCloser };
};
