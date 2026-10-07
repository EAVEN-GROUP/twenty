import { type BarChartDatum } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartDatum';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';

type ComputePodiumRosterLabelsParams = {
  data: BarChartDatum[];
  indexBy: string;
  formattedToRawLookup: Map<string, RawDimensionValue>;
};

export const computePodiumRosterLabels = ({
  data,
  indexBy,
  formattedToRawLookup,
}: ComputePodiumRosterLabelsParams): string[] =>
  data
    .map((datum) => String(datum[indexBy]))
    .filter((label) => formattedToRawLookup.has(label));
