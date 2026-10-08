import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const useCanCreateMeetings = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const meetingObjectMetadataItem = objectMetadataItems.find(
    ({ nameSingular }) => nameSingular === MEETING_OBJECT_NAME_SINGULAR,
  );

  const meetingObjectPermissions = useObjectPermissionsForObject(
    meetingObjectMetadataItem?.id ?? '',
  );

  if (!isDefined(meetingObjectMetadataItem)) {
    return false;
  }

  return canCreateRecordsForObjectMetadataItem({
    objectPermissions: meetingObjectPermissions,
    objectMetadataItem: meetingObjectMetadataItem,
  });
};
