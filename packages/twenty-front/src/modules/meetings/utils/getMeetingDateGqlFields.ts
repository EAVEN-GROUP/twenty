import { MEETING_DATE_FIELD_NAME } from '@/meetings/constants/MeetingDateFieldName';
import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlFields } from 'twenty-shared/types';

export const getMeetingDateGqlFields = ({
  nameSingular,
  fields,
}: Pick<
  EnrichedObjectMetadataItem,
  'nameSingular' | 'fields'
>): RecordGqlFields =>
  nameSingular === MEETING_OBJECT_NAME_SINGULAR &&
  fields.some(({ name }) => name === MEETING_DATE_FIELD_NAME)
    ? { [MEETING_DATE_FIELD_NAME]: true }
    : {};
