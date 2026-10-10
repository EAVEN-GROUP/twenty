import { PERSON_NAME_FIELD_NAME } from '@/meetings/constants/PersonNameFieldName';
import { normalizePersonName } from '@/meetings/utils/normalizePersonName';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useStore } from 'jotai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useUpdatePersonName = () => {
  const store = useStore();
  const { updateOneRecord } = useUpdateOneRecord();

  const updatePersonName = async ({
    personId,
    personName,
  }: {
    personId: string;
    personName: FieldFullNameValue;
  }) => {
    const nextPersonName = normalizePersonName(personName);
    const currentPersonName = normalizePersonName(
      store.get(
        recordStoreFamilySelector.selectorFamily({
          recordId: personId,
          fieldName: PERSON_NAME_FIELD_NAME,
        }),
      ) as FieldFullNameValue | undefined,
    );

    if (isDeeplyEqual(currentPersonName, nextPersonName)) {
      return;
    }

    await updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Person,
      idToUpdate: personId,
      updateOneRecordInput: {
        [PERSON_NAME_FIELD_NAME]: nextPersonName,
      },
    });
  };

  return { updatePersonName };
};
