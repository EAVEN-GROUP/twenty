import { pickNextCloserId } from '@/sales-pipeline/utils/pickNextCloserId';

describe('pickNextCloserId', () => {
  it('returns undefined without closers', () => {
    expect(
      pickNextCloserId({ closerIds: [], lastAssignedAtByCloserId: new Map() }),
    ).toBeUndefined();
  });

  it('picks a closer who never had a meeting first', () => {
    expect(
      pickNextCloserId({
        closerIds: ['anna', 'marco'],
        lastAssignedAtByCloserId: new Map([['anna', '2026-10-20T10:00:00Z']]),
      }),
    ).toBe('marco');
  });

  it('picks the closer whose last meeting is the oldest', () => {
    expect(
      pickNextCloserId({
        closerIds: ['anna', 'marco', 'sara'],
        lastAssignedAtByCloserId: new Map([
          ['anna', '2026-10-22T10:00:00Z'],
          ['marco', '2026-10-20T10:00:00Z'],
          ['sara', '2026-10-21T10:00:00Z'],
        ]),
      }),
    ).toBe('marco');
  });

  it('always picks the only closer', () => {
    expect(
      pickNextCloserId({
        closerIds: ['nicolo'],
        lastAssignedAtByCloserId: new Map([['nicolo', '2026-10-22T10:00:00Z']]),
      }),
    ).toBe('nicolo');
  });
});
