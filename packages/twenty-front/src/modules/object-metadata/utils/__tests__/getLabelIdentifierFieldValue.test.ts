import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const nameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
  fieldName: 'name',
});

const FULL_NAME_FIELD_METADATA_ITEM = {
  name: 'name',
  type: FieldMetadataType.FULL_NAME,
} as FieldMetadataItem;

describe('getLabelIdentifierFieldValue', () => {
  it('should return the label identifier value', () => {
    expect(
      getLabelIdentifierFieldValue(
        { __typename: 'Company', id: 'company-id', name: 'Acme' },
        nameField,
      ),
    ).toBe('Acme');
  });

  it('should say a restricted name is not shared rather than print the sentinel', () => {
    expect(
      getLabelIdentifierFieldValue(
        {
          __typename: 'Company',
          id: 'company-id',
          name: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        },
        nameField,
      ),
    ).toBe('Not shared');
  });

  it('should fall back to the record id without a label identifier field', () => {
    expect(
      getLabelIdentifierFieldValue(
        { __typename: 'Company', id: 'company-id' },
        undefined,
      ),
    ).toBe('company-id');
  });

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
