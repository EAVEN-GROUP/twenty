import { RECORD_INDEX_STAT_CARDS_BY_OBJECT_NAME_SINGULAR } from '@/object-record/record-index/constants/RecordIndexStatCardsByObjectNameSingular';
import { RecordIndexStatCard } from '@/object-record/record-index/components/RecordIndexStatCard';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRow = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[4]} 0 ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const RecordIndexStatCards = () => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const statCardConfigs =
    RECORD_INDEX_STAT_CARDS_BY_OBJECT_NAME_SINGULAR[objectNameSingular];

  if (!isDefined(statCardConfigs)) {
    return null;
  }

  return (
    <StyledRow>
      {statCardConfigs.map((statCardConfig) => (
        <RecordIndexStatCard key={statCardConfig.key} config={statCardConfig} />
      ))}
    </StyledRow>
  );
};
