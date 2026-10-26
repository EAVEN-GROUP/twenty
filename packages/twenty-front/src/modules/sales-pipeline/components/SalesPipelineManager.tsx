import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SalesPipelineFieldChangeEffect } from '@/sales-pipeline/components/SalesPipelineFieldChangeEffect';
import { SalesPipelineOutcomeModal } from '@/sales-pipeline/components/SalesPipelineOutcomeModal';
import { hasSalesPipelineObjects } from '@/sales-pipeline/utils/hasSalesPipelineObjects';

export const SalesPipelineManager = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  if (!hasSalesPipelineObjects(objectMetadataItems)) {
    return null;
  }

  return (
    <>
      <SalesPipelineFieldChangeEffect />
      <SalesPipelineOutcomeModal />
    </>
  );
};
