import { useMeetingDatesFromCache } from '@/meetings/hooks/useMeetingDatesFromCache';
import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { formatMeetingChipLabel } from '@/meetings/utils/formatMeetingChipLabel';
import { sortMeetingsByDateDescending } from '@/meetings/utils/sortMeetingsByDateDescending';
import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { MAX_RELATION_CHIPS_DISPLAYED_INLINE } from '@/object-record/record-field/ui/meta-types/display/constants/MaxRelationChipsDisplayedInline';
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRelationFromManyFieldDisplay';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { isArray } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const PersonMeetingsFieldDisplay = () => {
  const { fieldValue } = useRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();
  const { disableChipClick, triggerEvent } = useContext(FieldContext);
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);

  const linkedMeetings = isArray(fieldValue)
    ? fieldValue.filter(isDefined)
    : [];

  const { meetingDateById } = useMeetingDatesFromCache(
    linkedMeetings.map(({ id }) => id),
  );

  if (!isArray(fieldValue)) {
    return null;
  }

  const meetings = sortMeetingsByDateDescending(
    linkedMeetings.map((meeting) => ({
      ...meeting,
      meetingDate: meetingDateById.get(meeting.id) ?? meeting.meetingDate,
    })),
  );

  return (
    <ExpandableList
      isChipCountDisplayed={isFocused}
      maxInlineCount={MAX_RELATION_CHIPS_DISPLAYED_INLINE}
    >
      {meetings.map((meeting) => (
        <RecordChip
          key={meeting.id}
          objectNameSingular={MEETING_OBJECT_NAME_SINGULAR}
          record={{
            ...meeting,
            name: isDefined(meeting.meetingDate)
              ? formatMeetingChipLabel({
                  meetingDate: meeting.meetingDate,
                  timeZone,
                  dateFormat,
                  timeFormat,
                  localeCatalog: dateLocale.localeCatalog,
                })
              : meeting.name,
          }}
          isIconHidden
          forceDisableClick={disableChipClick}
          triggerEvent={triggerEvent}
        />
      ))}
    </ExpandableList>
  );
};
