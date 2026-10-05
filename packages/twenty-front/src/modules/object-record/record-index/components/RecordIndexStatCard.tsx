import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useRecordIndexStatCardCount } from '@/object-record/record-index/hooks/useRecordIndexStatCardCount';
import { computeRecordIndexStatCardPercentage } from '@/object-record/record-index/utils/computeRecordIndexStatCardPercentage';
import { type RecordIndexStatCardConfig } from '@/object-record/record-index/types/RecordIndexStatCardConfig';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const VALUE_COLOR_BY_TONE = {
  default: themeCssVariables.font.color.primary,
  blue: themeCssVariables.tag.text.blue,
  green: themeCssVariables.tag.text.green,
  purple: themeCssVariables.tag.text.purple,
};

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.lg};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 110px;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledValue = styled.div<{ tone: RecordIndexStatCardConfig['tone'] }>`
  color: ${({ tone }) => VALUE_COLOR_BY_TONE[tone]};
  font-size: ${themeCssVariables.font.size.xxl};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1;
`;

const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

type RecordIndexStatCardProps = {
  config: RecordIndexStatCardConfig;
};

export const RecordIndexStatCard = ({ config }: RecordIndexStatCardProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  const isPercentage = config.kind === 'percentage';

  const { count: numerator } = useRecordIndexStatCardCount({
    filter: isPercentage ? config.numeratorFilter : config.filter,
    objectNameSingular: config.objectNameSingular,
  });

  const { count: denominator } = useRecordIndexStatCardCount({
    filter: isPercentage ? config.denominatorFilter : {},
    objectNameSingular: config.objectNameSingular,
    skip: !isPercentage,
  });

  const displayValue = (() => {
    if (!isDefined(numerator)) {
      return '—';
    }

    if (!isPercentage) {
      return formatNumber(numerator);
    }

    if (!isDefined(denominator)) {
      return '—';
    }

    return `${computeRecordIndexStatCardPercentage({ numerator, denominator })}%`;
  })();

  return (
    <StyledCard>
      <StyledValue tone={config.tone}>{displayValue}</StyledValue>
      <StyledLabel>{t(config.label)}</StyledLabel>
    </StyledCard>
  );
};
