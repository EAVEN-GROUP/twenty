import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { useCanCreateMeetings } from '@/meetings/hooks/useCanCreateMeetings';
import { useOpenCreateMeetingModal } from '@/meetings/hooks/useOpenCreateMeetingModal';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useLingui } from '@lingui/react/macro';
import { type Ref, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendarEvent, IconPlus } from 'twenty-ui/icon';
import { ListItemButton } from 'twenty-ui/components/navigation';

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
    <LegacyDropdownContent
      ref={containerRef}
      widthInPixels={GenericDropdownContentWidth.ExtraLarge}
    >
      {meetings.length > 0 && (
        <DropdownMenuItemsContainer>
          {meetings.map((meeting) => (
            <ListItemButton
              key={meeting.id}
              startIcon={<IconCalendarEvent />}
              description={statusLabelByValue.get(meeting.status)}
              descriptionPlacement="inline"
              onClick={() => handleOpenMeeting(meeting.id)}
            >
              {getMeetingDateLabel(meeting)}
            </ListItemButton>
          ))}
        </DropdownMenuItemsContainer>
      )}
      {canCreateMeetings && (
        <DropdownMenuItemsContainer scrollable={false}>
          <ListItemButton startIcon={<IconPlus />} onClick={handleAddMeeting}>
            {t`Add meeting`}
          </ListItemButton>
        </DropdownMenuItemsContainer>
      )}
    </LegacyDropdownContent>
  );
};
