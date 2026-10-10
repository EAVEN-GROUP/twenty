import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const normalizePersonName = (
  personName:
    | Partial<Record<keyof FieldFullNameValue, string | null>>
    | null
    | undefined,
): FieldFullNameValue => ({
  firstName: personName?.firstName?.trim() ?? '',
  lastName: personName?.lastName?.trim() ?? '',
});
