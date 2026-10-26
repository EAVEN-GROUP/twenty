import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsSalesPipelineMaxCallAttemptsInput } from '@/sales-pipeline/components/SettingsSalesPipelineMaxCallAttemptsInput';
import { SALES_PIPELINE_SETTING_OBJECT_NAME_SINGULAR } from '@/sales-pipeline/constants/SalesPipelineSettingObjectNameSingular';
import { getMaxCallAttempts } from '@/sales-pipeline/utils/getMaxCallAttempts';
import { hasSalesPipelineObjects } from '@/sales-pipeline/utils/hasSalesPipelineObjects';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';

const SettingsSalesPipelineSectionContent = () => {
  const { t } = useLingui();
  const { records, loading } = useFindManyRecords({
    objectNameSingular: SALES_PIPELINE_SETTING_OBJECT_NAME_SINGULAR,
    recordGqlFields: { id: true, maxCallAttempts: true },
    orderBy: [{ createdAt: 'AscNullsLast' }],
    limit: 1,
  });

  if (loading) {
    return null;
  }

  const salesPipelineSetting = records[0];

  return (
    <Section.Root>
      <Section.Header
        title={t`Sales pipeline`}
        description={t`Missed calls after which a lead becomes unreachable. Only one missed call per day counts.`}
      />
      <SettingsSalesPipelineMaxCallAttemptsInput
        salesPipelineSettingId={salesPipelineSetting?.id}
        initialMaxCallAttempts={getMaxCallAttempts(
          salesPipelineSetting?.maxCallAttempts,
        )}
      />
    </Section.Root>
  );
};

export const SettingsSalesPipelineSection = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  if (!hasSalesPipelineObjects(objectMetadataItems)) {
    return null;
  }

  return <SettingsSalesPipelineSectionContent />;
};
