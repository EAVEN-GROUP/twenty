export const buildChartDimensionValueKey = (dimensionValue: unknown): string =>
  JSON.stringify(dimensionValue ?? null);
