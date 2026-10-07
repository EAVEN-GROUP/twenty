import { formatNumberChartTrend } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/utils/formatNumberChartTrend';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconTrendingDown, IconTrendingUp } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type GraphWidgetAggregateChartProps = {
  value: string | number;
  trendPercentage?: number;
  prefix?: string;
  suffix?: string;
  color?: GraphColor;
};

const StyledTrendPercentageValue = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
  margin-right: ${themeCssVariables.spacing[2]};
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: space-between;
  width: 100%;
`;

const StyledTrendIconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledValue = styled.div<{ valueColor: string }>`
  color: ${({ valueColor }) => valueColor};
  font-size: ${themeCssVariables.font.size.xxl};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1;
`;

export const GraphWidgetAggregateChart = ({
  value,
  trendPercentage,
  prefix,
  suffix,
  color,
}: GraphWidgetAggregateChartProps) => {
  const { theme } = useContext(ThemeContext);

  const formattedPercentage = isDefined(trendPercentage)
    ? formatNumberChartTrend(trendPercentage)
    : undefined;

  const displayValue = `${prefix ?? ''}${value}${suffix ?? ''}`;

  const valueColor =
    isDefined(color) && color !== 'auto'
      ? themeCssVariables.tag.text[color]
      : themeCssVariables.font.color.primary;

  return (
    <StyledContainer>
      <StyledValue valueColor={valueColor}>{displayValue}</StyledValue>
      {isDefined(trendPercentage) && (
        <StyledTrendIconContainer>
          <StyledTrendPercentageValue>
            {formattedPercentage}%
          </StyledTrendPercentageValue>
          {trendPercentage >= 0 ? (
            <IconTrendingUp
              color={theme.color.turquoise9}
              size={theme.icon.size.md}
            />
          ) : (
            <IconTrendingDown
              color={theme.color.red9}
              size={theme.icon.size.md}
            />
          )}
        </StyledTrendIconContainer>
      )}
    </StyledContainer>
  );
};
