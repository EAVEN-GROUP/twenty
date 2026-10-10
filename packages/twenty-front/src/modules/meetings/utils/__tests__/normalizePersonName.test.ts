import { normalizePersonName } from '@/meetings/utils/normalizePersonName';

describe('normalizePersonName', () => {
  it('trims both parts of the name', () => {
    expect(
      normalizePersonName({ firstName: ' Mario ', lastName: 'Rossi  ' }),
    ).toEqual({ firstName: 'Mario', lastName: 'Rossi' });
  });

  it('turns missing parts into empty strings', () => {
    expect(normalizePersonName({ firstName: 'Mario', lastName: null })).toEqual(
      { firstName: 'Mario', lastName: '' },
    );
    expect(normalizePersonName(undefined)).toEqual({
      firstName: '',
      lastName: '',
    });
    expect(normalizePersonName(null)).toEqual({ firstName: '', lastName: '' });
  });
});
