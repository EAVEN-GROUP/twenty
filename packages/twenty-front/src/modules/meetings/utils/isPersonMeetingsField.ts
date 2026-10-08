import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldRelationOneToMany';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const isPersonMeetingsField = (
  fieldDefinition: Pick<FieldDefinition<FieldMetadata>, 'type' | 'metadata'>,
) =>
  isFieldRelationOneToMany(fieldDefinition) &&
  fieldDefinition.metadata.objectMetadataNameSingular ===
    CoreObjectNameSingular.Person &&
  fieldDefinition.metadata.relationObjectMetadataNameSingular ===
    MEETING_OBJECT_NAME_SINGULAR;
