import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { MEETING_DEFAULT_NAME } from '@/meetings/constants/MeetingDefaultName';
import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { MEETING_SCHEDULED_STATUS_VALUE } from '@/meetings/constants/MeetingScheduledStatusValue';
import { PERSON_BOOKED_STATUS_VALUE } from '@/meetings/constants/PersonBookedStatusValue';
import { PERSON_STATUS_FIELD_NAME } from '@/meetings/constants/PersonStatusFieldName';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { Temporal } from 'temporal-polyfill';
import { v4 } from 'uuid';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const useCreateMeetingForPerson = () => {
  const store = useStore();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { userTimezone } = useUserTimezone();

  const { createOneRecord, loading } = useCreateOneRecord({
    objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
  });
  const { updateOneRecord } = useUpdateOneRecord();

  const createMeetingForPerson = async ({
    personId,
    meetingDate,
    meetingName,
    meetingType,
    ownerId,
  }: {
    personId: string;
    meetingDate: string;
    meetingName?: string;
    meetingType?: string;
    ownerId?: string;
  }) => {
    await createOneRecord({
      id: v4(),
      name: isNonEmptyString(meetingName) ? meetingName : MEETING_DEFAULT_NAME,
      personId,
      meetingDate,
      meetingType,
      status: MEETING_SCHEDULED_STATUS_VALUE,
      ownerId: ownerId ?? currentWorkspaceMember?.id,
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
        callAttempts: 0,
        callDate: Temporal.Now.plainDateISO(userTimezone).toString(),
        nextCallAt: null,
      },
    });
  };

  return { createMeetingForPerson, loading };
};
