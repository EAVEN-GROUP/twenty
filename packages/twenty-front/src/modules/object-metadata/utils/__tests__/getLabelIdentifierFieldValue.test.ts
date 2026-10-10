import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const FULL_NAME_FIELD_METADATA_ITEM = {
  name: 'name',
  type: FieldMetadataType.FULL_NAME,
} as FieldMetadataItem;

describe('getLabelIdentifierFieldValue', () => {
  it('joins first and last name', () => {
    expect(
      getLabelIdentifierFieldValue(
        {
          id: 'person-id',
          __typename: 'Person',
          name: { firstName: 'Mario', lastName: 'Rossi' },
        },
        FULL_NAME_FIELD_METADATA_ITEM,
      ),
    ).toBe('Mario Rossi');
  });

  it('returns an empty string for an empty full name', () => {
    expect(
      getLabelIdentifierFieldValue(
        {
          id: 'person-id',
          __typename: 'Person',
          name: { firstName: null, lastName: null },
        },
        FULL_NAME_FIELD_METADATA_ITEM,
      ),
    ).toBe('');
  });

  it('does not pad a full name that only has one part', () => {
    expect(
      getLabelIdentifierFieldValue(
        {
          id: 'person-id',
          __typename: 'Person',
          name: { firstName: 'Mario', lastName: '' },
        },
        FULL_NAME_FIELD_METADATA_ITEM,
      ),
    ).toBe('Mario');
  });
});
