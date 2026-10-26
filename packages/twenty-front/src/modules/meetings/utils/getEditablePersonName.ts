import { normalizePersonName } from '@/meetings/utils/normalizePersonName';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';

const LETTER_PATTERN = /\p{L}/u;

// The lead importer writes the phone number into the name, which is not a name to edit.
export const getEditablePersonName = (
  personName: Parameters<typeof normalizePersonName>[0],
): FieldFullNameValue => {
  const { firstName, lastName } = normalizePersonName(personName);

  return {
    firstName: LETTER_PATTERN.test(firstName) ? firstName : '',
    lastName: LETTER_PATTERN.test(lastName) ? lastName : '',
  };
};
