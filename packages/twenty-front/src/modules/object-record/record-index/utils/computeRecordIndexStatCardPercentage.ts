export const computeRecordIndexStatCardPercentage = ({
  numerator,
  denominator,
}: {
  numerator: number;
  denominator: number;
}) => (denominator === 0 ? 0 : Math.round((numerator / denominator) * 100));
