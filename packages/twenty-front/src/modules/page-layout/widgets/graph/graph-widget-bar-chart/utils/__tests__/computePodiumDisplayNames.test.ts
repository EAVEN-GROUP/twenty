import { computePodiumDisplayNames } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computePodiumDisplayNames';

describe('computePodiumDisplayNames', () => {
  it('uses the first name when it is unique', () => {
    const displayNames = computePodiumDisplayNames([
      'Omar Elnagar',
      'Nisal Fernando',
    ]);

    expect(displayNames.get('Omar Elnagar')).toBe('Omar');
    expect(displayNames.get('Nisal Fernando')).toBe('Nisal');
  });

  it('keeps the full name when two entries share a first name', () => {
    const displayNames = computePodiumDisplayNames([
      'Marco Rossi',
      'Marco Bianchi',
      'Omar Elnagar',
    ]);

    expect(displayNames.get('Marco Rossi')).toBe('Marco Rossi');
    expect(displayNames.get('Marco Bianchi')).toBe('Marco Bianchi');
    expect(displayNames.get('Omar Elnagar')).toBe('Omar');
  });

  it('leaves single-word labels untouched', () => {
    expect(computePodiumDisplayNames(['Omar']).get('Omar')).toBe('Omar');
  });

  it('returns an empty map for no labels', () => {
    expect(computePodiumDisplayNames([]).size).toBe(0);
  });
});
