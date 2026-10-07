import { computePodiumRosterLabels } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computePodiumRosterLabels';

describe('computePodiumRosterLabels', () => {
  it('lists every group label except the group without an owner', () => {
    const labels = computePodiumRosterLabels({
      data: [
        { owner: 'Omar', count: 10 },
        { owner: 'No value', count: 477 },
        { owner: 'Filippo', count: 4 },
      ],
      indexBy: 'owner',
      formattedToRawLookup: new Map([
        ['Omar', 'member-omar'],
        ['Filippo', 'member-filippo'],
      ]),
    });

    expect(labels).toEqual(['Omar', 'Filippo']);
  });
});
