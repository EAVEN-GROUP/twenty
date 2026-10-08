import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { MEETING_DEFAULT_NAME } from '@/meetings/constants/MeetingDefaultName';
import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { MEETING_SCHEDULED_STATUS_VALUE } from '@/meetings/constants/MeetingScheduledStatusValue';
import { PERSON_BOOKED_STATUS_VALUE } from '@/meetings/constants/PersonBookedStatusValue';
import { PERSON_STATUS_FIELD_NAME } from '@/meetings/constants/PersonStatusFieldName';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { v4 } from 'uuid';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const useCreateMeetingForPerson = () => {
  const store = useStore();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { createOneRecord, loading } = useCreateOneRecord({
    objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
  });
  const { updateOneRecord } = useUpdateOneRecord();

  const createMeetingForPerson = async ({
    personId,
    meetingDate,
  }: {
    personId: string;
    meetingDate: string;
  }) => {
    await createOneRecord({
      id: v4(),
      name: MEETING_DEFAULT_NAME,
      personId,
      meetingDate,
      status: MEETING_SCHEDULED_STATUS_VALUE,
      ownerId: currentWorkspaceMember?.id,
    });

    const currentPersonStatus = store.get(
      recordStoreFamilySelector.selectorFamily({
        recordId: personId,
        fieldName: PERSON_STATUS_FIELD_NAME,
      }),
    );

    if (currentPersonStatus === PERSON_BOOKED_STATUS_VALUE) {
      return;
    }

    await updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Person,
      idToUpdate: personId,
      updateOneRecordInput: {
        [PERSON_STATUS_FIELD_NAME]: PERSON_BOOKED_STATUS_VALUE,
      },
    });
  };

  return { createMeetingForPerson, loading };
};
