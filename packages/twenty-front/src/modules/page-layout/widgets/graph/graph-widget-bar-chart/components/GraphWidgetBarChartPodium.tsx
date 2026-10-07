// oxlint-disable twenty/no-hardcoded-colors
// White overlays sit on the fixed medal gradients, so they do not follow the theme.
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { PODIUM_NEGATIVE_CONVERSION_COLOR } from '@/page-layout/widgets/graph/graph-widget-bar-chart/constants/PodiumNegativeConversionColor';
import { PODIUM_RANK_STYLES } from '@/page-layout/widgets/graph/graph-widget-bar-chart/constants/PodiumRankStyles';
import { PODIUM_REST_CARD_BACKGROUND } from '@/page-layout/widgets/graph/graph-widget-bar-chart/constants/PodiumRestCardBackground';
import { computePodiumDisplayNames } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/computePodiumDisplayNames';
import { type PodiumEntry } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/PodiumEntry';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type PodiumRank = keyof typeof PODIUM_RANK_STYLES;

type GraphWidgetBarChartPodiumProps = {
  entries: PodiumEntry[];
};

const PODIUM_SLOTS: PodiumRank[] = [2, 1, 3];

const StyledContainer = styled.div`
  box-sizing: border-box;
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  height: 100%;
  width: 100%;
`;

const StyledPodium = styled.div`
  align-items: end;
  display: grid;
  flex: 1;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr 1.18fr 1fr;
  grid-template-rows: minmax(0, 1fr);
  margin: 0 auto;
  max-width: 640px;
  min-height: 0;
  width: 100%;
`;

const StyledPodiumCard = styled.div<{ rank: PodiumRank }>`
  align-items: center;
  background: ${({ rank }) => PODIUM_RANK_STYLES[rank].background};
  border-radius: 20px;
  box-shadow: ${({ rank }) => PODIUM_RANK_STYLES[rank].boxShadow};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.inverted};
  corner-shape: round;
  display: flex;
  flex-direction: column;
  height: ${({ rank }) => PODIUM_RANK_STYLES[rank].heightPercentage}%;
  min-height: 200px;
  overflow: hidden;
  padding-top: ${themeCssVariables.spacing[5]};
  position: relative;
  z-index: ${({ rank }) => (rank === 1 ? 0 : 1)};
`;

const StyledBadge = styled.div<{ rank: PodiumRank }>`
  align-items: center;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  corner-shape: round;
  display: flex;
  font-size: ${({ rank }) => (rank === 1 ? '28px' : '18px')};
  height: ${({ rank }) => (rank === 1 ? '52px' : '36px')};
  justify-content: center;
  line-height: 1;
  width: ${({ rank }) => (rank === 1 ? '52px' : '36px')};
`;

const StyledName = styled.div<{ rank: PodiumRank }>`
  font-size: ${({ rank }) =>
    rank === 1 ? 'clamp(18px, 4.6cqw, 28px)' : 'clamp(13px, 2.6cqw, 16px)'};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -0.2px;
  margin-top: ${themeCssVariables.spacing[2]};
  max-width: 90%;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBigNumber = styled.div<{ rank: PodiumRank }>`
  color: ${({ rank }) => PODIUM_RANK_STYLES[rank].numberColor};
  font-size: ${({ rank }) =>
    rank === 1 ? 'clamp(48px, 13cqw, 100px)' : 'clamp(36px, 8.5cqw, 68px)'};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -2px;
  line-height: 1;
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledCaption = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 1.2px;
  margin-top: ${themeCssVariables.spacing[2]};
  text-transform: uppercase;
`;

const StyledFooter = styled.div`
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0.28) 60%
  );
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: auto;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledFooterRow = styled.div`
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: space-between;
`;

const StyledFooterLabel = styled.span`
  color: rgba(255, 255, 255, 0.66);
`;

const StyledFooterValue = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledProgressTrack = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  corner-shape: round;
  height: 3px;
  margin-top: ${themeCssVariables.spacing[1]};
  overflow: hidden;
`;

const StyledProgressFill = styled.div<{
  color: string;
  widthPercentage: number;
}>`
  background: ${({ color }) => color};
  border-radius: 99px;
  corner-shape: round;
  height: 100%;
  width: ${({ widthPercentage }) => widthPercentage}%;
`;

const StyledRestGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @container (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const StyledRestCard = styled.div`
  align-items: center;
  background: ${PODIUM_REST_CARD_BACKGROUND};
  border-radius: 20px;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.inverted};
  corner-shape: round;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 64px;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[5]};
`;

const StyledRestRank = styled.div`
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.55);
  corner-shape: round;
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 26px;
  justify-content: center;
  width: 26px;
`;

const StyledRestNames = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledRestName = styled.div`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRestConversion = styled.div`
  color: rgba(255, 255, 255, 0.45);
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledRestNumber = styled.div`
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xxl};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: -1px;
  line-height: 1;
`;

export const GraphWidgetBarChartPodium = ({
  entries,
}: GraphWidgetBarChartPodiumProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  const maximumAnswered = Math.max(
    1,
    ...entries.map((entry) => entry.answered),
  );
  const restEntries = entries.slice(3);
  const displayNameByLabel = computePodiumDisplayNames(
    entries.map((entry) => entry.label),
  );

  return (
    <StyledContainer>
      <StyledPodium>
        {PODIUM_SLOTS.map((rank) => {
          const entry = entries[rank - 1];

          if (entry === undefined) {
            return <div key={rank} />;
          }

          const rankStyles = PODIUM_RANK_STYLES[rank];

          return (
            <StyledPodiumCard key={rank} rank={rank}>
              <StyledBadge rank={rank}>{rankStyles.badge}</StyledBadge>
              <StyledName rank={rank} title={entry.label}>
                {displayNameByLabel.get(entry.label)}
              </StyledName>
              <StyledBigNumber rank={rank}>
                {formatNumber(entry.meetings)}
              </StyledBigNumber>
              <StyledCaption>{t`Meetings booked`}</StyledCaption>
              <StyledFooter>
                <StyledFooterRow>
                  <StyledFooterLabel>{t`Conv.`}</StyledFooterLabel>
                  <StyledFooterValue color={PODIUM_NEGATIVE_CONVERSION_COLOR}>
                    {entry.conversionPercentage}%
                  </StyledFooterValue>
                </StyledFooterRow>
                <StyledFooterRow>
                  <StyledFooterLabel>{t`Calls`}</StyledFooterLabel>
                  <StyledFooterValue color={rankStyles.accentColor}>
                    {formatNumber(entry.answered)}
                  </StyledFooterValue>
                </StyledFooterRow>
                <StyledProgressTrack>
                  <StyledProgressFill
                    color={rankStyles.accentColor}
                    widthPercentage={Math.max(
                      2,
                      Math.round((entry.answered / maximumAnswered) * 100),
                    )}
                  />
                </StyledProgressTrack>
              </StyledFooter>
            </StyledPodiumCard>
          );
        })}
      </StyledPodium>
      {restEntries.length > 0 && (
        <StyledRestGrid>
          {restEntries.map((entry, index) => (
            <StyledRestCard key={entry.label}>
              <StyledRestRank>{index + 4}°</StyledRestRank>
              <StyledRestNames>
                <StyledRestName title={entry.label}>
                  {displayNameByLabel.get(entry.label)}
                </StyledRestName>
                <StyledRestConversion>
                  {entry.conversionPercentage}% {t`conv.`}
                </StyledRestConversion>
              </StyledRestNames>
              <StyledRestNumber>
                {formatNumber(entry.meetings)}
              </StyledRestNumber>
            </StyledRestCard>
          ))}
        </StyledRestGrid>
      )}
    </StyledContainer>
  );
};
