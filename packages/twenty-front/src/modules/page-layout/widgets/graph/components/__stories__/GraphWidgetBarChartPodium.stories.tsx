import { type Meta, type StoryObj } from '@storybook/react-vite';

import { GraphWidgetBarChartPodium } from '@/page-layout/widgets/graph/graph-widget-bar-chart/components/GraphWidgetBarChartPodium';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof GraphWidgetBarChartPodium> = {
  title: 'Modules/PageLayout/Widgets/GraphWidgetBarChartPodium',
  component: GraphWidgetBarChartPodium,
  decorators: [
    (Story) => (
      <div style={{ height: 620, width: 1100 }}>
        <Story />
      </div>
    ),
    ComponentDecorator,
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof GraphWidgetBarChartPodium>;

export const Default: Story = {
  args: {
    entries: [
      {
        label: 'Filippo',
        meetings: 41,
        answered: 607,
        conversionPercentage: 7,
      },
      { label: 'Omar', meetings: 39, answered: 667, conversionPercentage: 6 },
      { label: 'Matteo', meetings: 26, answered: 629, conversionPercentage: 4 },
      { label: 'Alfio', meetings: 25, answered: 640, conversionPercentage: 4 },
      { label: 'Adrian', meetings: 17, answered: 372, conversionPercentage: 5 },
      { label: 'Alex', meetings: 10, answered: 441, conversionPercentage: 2 },
      { label: 'Thomas', meetings: 0, answered: 12, conversionPercentage: 0 },
      { label: 'Fabrizio', meetings: 0, answered: 6, conversionPercentage: 0 },
      { label: 'Facundo', meetings: 0, answered: 3, conversionPercentage: 0 },
    ],
  },
};

export const OnlyTwoReps: Story = {
  args: {
    entries: [
      {
        label: 'Filippo',
        meetings: 41,
        answered: 607,
        conversionPercentage: 7,
      },
      { label: 'Omar', meetings: 39, answered: 667, conversionPercentage: 6 },
    ],
  },
};

export const FullNames: Story = {
  args: {
    entries: [
      {
        label: 'Nisal Fernando',
        meetings: 25,
        answered: 443,
        conversionPercentage: 6,
      },
      {
        label: 'Davide Tadini',
        meetings: 13,
        answered: 280,
        conversionPercentage: 5,
      },
      {
        label: 'Jacopo La Rocca',
        meetings: 2,
        answered: 25,
        conversionPercentage: 8,
      },
      {
        label: 'Omar Elnagar',
        meetings: 1,
        answered: 19,
        conversionPercentage: 5,
      },
      {
        label: 'Adrian Belotti',
        meetings: 1,
        answered: 10,
        conversionPercentage: 10,
      },
    ],
  },
};

export const SharedFirstName: Story = {
  args: {
    entries: [
      {
        label: 'Marco Rossi',
        meetings: 9,
        answered: 90,
        conversionPercentage: 10,
      },
      {
        label: 'Marco Bianchi',
        meetings: 7,
        answered: 70,
        conversionPercentage: 10,
      },
      {
        label: 'Omar Elnagar',
        meetings: 4,
        answered: 80,
        conversionPercentage: 5,
      },
    ],
  },
};

export const NoActivity: Story = {
  args: {
    entries: [
      {
        label: 'Nisal Fernando',
        meetings: 0,
        answered: 0,
        conversionPercentage: 0,
      },
      {
        label: 'Davide Tadini',
        meetings: 0,
        answered: 0,
        conversionPercentage: 0,
      },
      {
        label: 'Jacopo La Rocca',
        meetings: 0,
        answered: 0,
        conversionPercentage: 0,
      },
      {
        label: 'Omar Elnagar',
        meetings: 0,
        answered: 0,
        conversionPercentage: 0,
      },
    ],
  },
};
