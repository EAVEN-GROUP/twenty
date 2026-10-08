import { getMeetingDateGqlFields } from '@/meetings/utils/getMeetingDateGqlFields';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

const buildObjectMetadata = (
  nameSingular: string,
  fieldNames: string[],
): Pick<EnrichedObjectMetadataItem, 'nameSingular' | 'fields'> => ({
  nameSingular,
  fields: fieldNames.map((name) => ({
    name,
  })) as EnrichedObjectMetadataItem['fields'],
});

describe('getMeetingDateGqlFields', () => {
  it('requests the meeting date for the meeting object', () => {
    expect(
      getMeetingDateGqlFields(buildObjectMetadata('meeting', ['meetingDate'])),
    ).toEqual({ meetingDate: true });
  });

  it('requests nothing when the meeting object has no date field', () => {
    expect(
      getMeetingDateGqlFields(buildObjectMetadata('meeting', ['name'])),
    ).toEqual({});
  });

  it('requests nothing for another object', () => {
    expect(
      getMeetingDateGqlFields(buildObjectMetadata('company', ['meetingDate'])),
    ).toEqual({});
  });
});
