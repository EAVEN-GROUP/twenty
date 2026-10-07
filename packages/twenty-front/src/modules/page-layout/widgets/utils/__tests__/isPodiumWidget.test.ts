import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isPodiumWidget } from '@/page-layout/widgets/utils/isPodiumWidget';

const buildWidget = (configuration: Record<string, unknown>) =>
  ({ configuration }) as unknown as PageLayoutWidget;

describe('isPodiumWidget', () => {
  it('is true for a bar chart displayed as a podium', () => {
    expect(
      isPodiumWidget(
        buildWidget({
          __typename: 'BarChartConfiguration',
          displayAsPodium: true,
        }),
      ),
    ).toBe(true);
  });

  it('is false for a regular bar chart', () => {
    expect(
      isPodiumWidget(
        buildWidget({
          __typename: 'BarChartConfiguration',
          displayAsPodium: false,
        }),
      ),
    ).toBe(false);
    expect(
      isPodiumWidget(buildWidget({ __typename: 'BarChartConfiguration' })),
    ).toBe(false);
  });

  it('is false for other widget configurations', () => {
    expect(
      isPodiumWidget(
        buildWidget({
          __typename: 'LineChartConfiguration',
          displayAsPodium: true,
        }),
      ),
    ).toBe(false);
  });
});
