import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { useCanCreateMeetings } from '@/meetings/hooks/useCanCreateMeetings';
import { useOpenCreateMeetingModal } from '@/meetings/hooks/useOpenCreateMeetingModal';
import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useLingui } from '@lingui/react/macro';
import { type Ref, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendarEvent, IconPlus } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

type PersonMeetingsPanelProps = {
  personId: string;
  onClose: () => void;
  containerRef?: Ref<HTMLDivElement>;
};

export const PersonMeetingsPanel = ({
  personId,
  onClose,
  containerRef,
}: PersonMeetingsPanelProps) => {
  const { t } = useLingui();
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);

  const canCreateMeetings = useCanCreateMeetings();
  const { openCreateMeetingModal } = useOpenCreateMeetingModal();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const { objectMetadataItem: meetingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
    });

  const { records: meetings } = useFindManyRecords({
    objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
    filter: { personId: { eq: personId } },
    orderBy: [{ meetingDate: 'DescNullsLast' }],
    recordGqlFields: { id: true, meetingDate: true, status: true },
  });

  const statusLabelByValue = new Map(
    (
      meetingObjectMetadataItem.fields.find(({ name }) => name === 'status')
        ?.options ?? []
    ).map(({ value, label }) => [value, label]),
  );

  const getMeetingDateLabel = (meeting: ObjectRecord) =>
    isDefined(meeting.meetingDate)
      ? formatDateISOStringToDateTime({
          date: meeting.meetingDate,
          timeZone,
          dateFormat,
          timeFormat,
          localeCatalog: dateLocale.localeCatalog,
        })
      : t`No date`;

  const handleOpenMeeting = (meetingId: string) => {
    onClose();
    openRecordInSidePanel({
      recordId: meetingId,
      objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
    });
  };

  const handleAddMeeting = () => {
    onClose();
    openCreateMeetingModal(personId);
  };

  return (
    <DropdownContent
      ref={containerRef}
      widthInPixels={GenericDropdownContentWidth.ExtraLarge}
    >
      {meetings.length > 0 && (
        <DropdownMenuItemsContainer>
          {meetings.map((meeting) => (
            <MenuItem
              key={meeting.id}
              LeftIcon={IconCalendarEvent}
              text={getMeetingDateLabel(meeting)}
              contextualText={statusLabelByValue.get(meeting.status)}
              onClick={() => handleOpenMeeting(meeting.id)}
            />
          ))}
        </DropdownMenuItemsContainer>
      )}
      {canCreateMeetings && (
        <DropdownMenuItemsContainer scrollable={false}>
          <CreateNewButton
            LeftIcon={IconPlus}
            text={t`Add meeting`}
            onClick={handleAddMeeting}
          />
        </DropdownMenuItemsContainer>
      )}
    </DropdownContent>
  );
};
