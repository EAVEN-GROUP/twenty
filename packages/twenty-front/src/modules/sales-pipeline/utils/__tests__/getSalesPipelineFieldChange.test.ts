import { getSalesPipelineFieldChange } from '@/sales-pipeline/utils/getSalesPipelineFieldChange';

const personArgs = {
  objectNameSingular: 'person',
  fieldName: 'status',
  previousValue: 'TO_CALL',
  nextValue: 'BOOKED',
};

describe('getSalesPipelineFieldChange', () => {
  it('books when a person moves into BOOKED', () => {
    expect(getSalesPipelineFieldChange(personArgs)).toEqual({
      type: 'booked',
    });
  });

  it('logs a missed call when a person moves into NO_ANSWER', () => {
    expect(
      getSalesPipelineFieldChange({ ...personArgs, nextValue: 'NO_ANSWER' }),
    ).toEqual({ type: 'missedCall', previousStatus: 'TO_CALL' });
  });

  it('logs another missed call when NO_ANSWER is picked again', () => {
    expect(
      getSalesPipelineFieldChange({
        ...personArgs,
        previousValue: 'NO_ANSWER',
        nextValue: 'NO_ANSWER',
      }),
    ).toEqual({ type: 'missedCall', previousStatus: 'NO_ANSWER' });
  });

  it.each(['FOLLOW_UP', 'SEND_INFO', 'NOT_BOOKED'])(
    'asks for the outcome details of %s',
    (status) => {
      expect(
        getSalesPipelineFieldChange({ ...personArgs, nextValue: status }),
      ).toEqual({ type: 'personOutcome', status });
    },
  );

  it('ignores a person status picked again', () => {
    expect(
      getSalesPipelineFieldChange({
        ...personArgs,
        previousValue: 'FOLLOW_UP',
        nextValue: 'FOLLOW_UP',
      }),
    ).toBeNull();
  });

  it('ignores a lead put back to TO_CALL', () => {
    expect(
      getSalesPipelineFieldChange({ ...personArgs, nextValue: 'TO_CALL' }),
    ).toBeNull();
  });

  it.each([
    ['NEGOTIATION', { type: 'opportunityOutcome', status: 'NEGOTIATION' }],
    ['CONTRACT_SENT', { type: 'opportunityOutcome', status: 'CONTRACT_SENT' }],
    ['LOST', { type: 'opportunityOutcome', status: 'LOST' }],
    ['WON', { type: 'opportunityWon' }],
    ['MEETING_SCHEDULED', { type: 'opportunityMeeting' }],
  ])('maps the opportunity status %s', (status, expected) => {
    expect(
      getSalesPipelineFieldChange({
        objectNameSingular: 'opportunity',
        fieldName: 'status',
        previousValue: null,
        nextValue: status,
      }),
    ).toEqual(expected);
  });

  it.each(['COMPLETED', 'NO_SHOW'])(
    'records the meeting outcome %s',
    (status) => {
      expect(
        getSalesPipelineFieldChange({
          objectNameSingular: 'meeting',
          fieldName: 'status',
          previousValue: 'SCHEDULED',
          nextValue: status,
        }),
      ).toEqual({ type: 'meetingOutcome', status });
    },
  );

  it('ignores other fields and objects', () => {
    expect(
      getSalesPipelineFieldChange({ ...personArgs, fieldName: 'stage' }),
    ).toBeNull();
    expect(
      getSalesPipelineFieldChange({
        ...personArgs,
        objectNameSingular: 'company',
      }),
    ).toBeNull();
  });
});
