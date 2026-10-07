import { computePodiumEntries } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computePodiumEntries';

const formattedToRawLookup = new Map<string, string>([
  ['Omar', 'member-omar'],
  ['Filippo', 'member-filippo'],
  ['Thomas', 'member-thomas'],
  ['Booked', 'BOOKED'],
  ['Not booked', 'NOT_BOOKED'],
  ['Follow-up', 'FOLLOW_UP'],
  ['To call', 'TO_CALL'],
  ['No answer', 'NO_ANSWER'],
]);

const keys = ['Booked', 'Not booked', 'Follow-up', 'To call', 'No answer'];

describe('computePodiumEntries', () => {
  it('counts booked meetings and answered calls per group', () => {
    const entries = computePodiumEntries({
      data: [
        {
          owner: 'Filippo',
          Booked: 41,
          'Not booked': 500,
          'Follow-up': 66,
          'To call': 900,
          'No answer': 30,
        },
      ],
      indexBy: 'owner',
      keys,
      formattedToRawLookup,
    });

    expect(entries).toEqual([
      {
        label: 'Filippo',
        meetings: 41,
        answered: 607,
        conversionPercentage: 7,
      },
    ]);
  });

  it('sorts by meetings, then answered calls, then label', () => {
    const entries = computePodiumEntries({
      data: [
        { owner: 'Thomas', Booked: 0, 'Not booked': 12 },
        { owner: 'Omar', Booked: 39, 'Not booked': 628 },
        { owner: 'Filippo', Booked: 39, 'Not booked': 568 },
      ],
      indexBy: 'owner',
      keys,
      formattedToRawLookup,
    });

    expect(entries.map((entry) => entry.label)).toEqual([
      'Omar',
      'Filippo',
      'Thomas',
    ]);
  });

  it('ignores the group without an owner and groups with no activity', () => {
    const entries = computePodiumEntries({
      data: [
        { owner: 'No value', Booked: 5, 'Not booked': 20 },
        { owner: 'Thomas', Booked: 0, 'To call': 300, 'No answer': 4 },
        { owner: 'Omar', Booked: 1, 'Not booked': 9 },
      ],
      indexBy: 'owner',
      keys,
      formattedToRawLookup,
    });

    expect(entries.map((entry) => entry.label)).toEqual(['Omar']);
  });

  it('drops groups where nothing was answered or booked', () => {
    const entries = computePodiumEntries({
      data: [{ owner: 'Omar', Booked: 0, 'Not booked': 0, 'No answer': 12 }],
      indexBy: 'owner',
      keys,
      formattedToRawLookup,
    });

    expect(entries).toEqual([]);
  });

  describe('with a sales roster', () => {
    it('adds roster members without data as zero entries, sorted last', () => {
      const entries = computePodiumEntries({
        data: [{ owner: 'Omar', Booked: 3, 'Not booked': 27 }],
        indexBy: 'owner',
        keys,
        formattedToRawLookup,
        rosterLabels: ['Omar', 'Filippo', 'Thomas'],
      });

      expect(entries).toEqual([
        { label: 'Omar', meetings: 3, answered: 30, conversionPercentage: 10 },
        { label: 'Filippo', meetings: 0, answered: 0, conversionPercentage: 0 },
        { label: 'Thomas', meetings: 0, answered: 0, conversionPercentage: 0 },
      ]);
    });

    it('keeps a roster member who only has records that were not answered', () => {
      const entries = computePodiumEntries({
        data: [{ owner: 'Thomas', Booked: 0, 'To call': 300 }],
        indexBy: 'owner',
        keys,
        formattedToRawLookup,
        rosterLabels: ['Thomas'],
      });

      expect(entries.map((entry) => entry.label)).toEqual(['Thomas']);
    });

    it('lists the whole roster when the period has no data', () => {
      const entries = computePodiumEntries({
        data: [],
        indexBy: 'owner',
        keys,
        formattedToRawLookup,
        rosterLabels: ['Omar', 'Filippo'],
      });

      expect(entries.map((entry) => entry.label)).toEqual(['Filippo', 'Omar']);
    });
  });
});
