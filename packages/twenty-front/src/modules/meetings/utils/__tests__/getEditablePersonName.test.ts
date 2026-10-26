import { getEditablePersonName } from '@/meetings/utils/getEditablePersonName';

describe('getEditablePersonName', () => {
  it('drops a phone number stored as the name', () => {
    expect(
      getEditablePersonName({ firstName: null, lastName: '3929624756' }),
    ).toEqual({ firstName: '', lastName: '' });
    expect(
      getEditablePersonName({ firstName: '+39 392 962 4756', lastName: '' }),
    ).toEqual({ firstName: '', lastName: '' });
  });

  it('keeps real names, including ones with digits', () => {
    expect(
      getEditablePersonName({ firstName: ' Mario ', lastName: 'Rossi' }),
    ).toEqual({ firstName: 'Mario', lastName: 'Rossi' });
    expect(
      getEditablePersonName({ firstName: 'Maria 2', lastName: "D'Àngelo" }),
    ).toEqual({ firstName: 'Maria 2', lastName: "D'Àngelo" });
  });

  it('handles a missing name', () => {
    expect(getEditablePersonName(undefined)).toEqual({
      firstName: '',
      lastName: '',
    });
  });
});
