import { shouldPromptMeetingForStatusChange } from '@/meetings/utils/shouldPromptMeetingForStatusChange';

const baseArgs = {
  objectNameSingular: 'person',
  fieldName: 'status',
  previousValue: 'TO_CALL',
  nextValue: 'BOOKED',
};

describe('shouldPromptMeetingForStatusChange', () => {
  it('prompts when a person status changes into BOOKED', () => {
    expect(shouldPromptMeetingForStatusChange(baseArgs)).toBe(true);
  });

  it('prompts when the previous status was empty', () => {
    expect(
      shouldPromptMeetingForStatusChange({ ...baseArgs, previousValue: null }),
    ).toBe(true);
  });

  it('does not prompt when the status was already BOOKED', () => {
    expect(
      shouldPromptMeetingForStatusChange({
        ...baseArgs,
        previousValue: 'BOOKED',
      }),
    ).toBe(false);
  });

  it('does not prompt for other status values', () => {
    expect(
      shouldPromptMeetingForStatusChange({
        ...baseArgs,
        nextValue: 'FOLLOW_UP',
      }),
    ).toBe(false);
  });

  it('does not prompt for another field of a person', () => {
    expect(
      shouldPromptMeetingForStatusChange({ ...baseArgs, fieldName: 'stage' }),
    ).toBe(false);
  });

  it('does not prompt for another object', () => {
    expect(
      shouldPromptMeetingForStatusChange({
        ...baseArgs,
        objectNameSingular: 'company',
      }),
    ).toBe(false);
  });
});
