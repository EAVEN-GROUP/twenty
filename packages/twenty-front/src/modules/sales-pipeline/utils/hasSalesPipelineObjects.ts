import { MEETING_OBJECT_NAME_SINGULAR } from '@/meetings/constants/MeetingObjectNameSingular';
import { LEAD_CALL_OBJECT_NAME_SINGULAR } from '@/sales-pipeline/constants/LeadCallObjectNameSingular';
import { SALES_PIPELINE_SETTING_OBJECT_NAME_SINGULAR } from '@/sales-pipeline/constants/SalesPipelineSettingObjectNameSingular';

const SALES_PIPELINE_OBJECT_NAMES_SINGULAR = [
  MEETING_OBJECT_NAME_SINGULAR,
  LEAD_CALL_OBJECT_NAME_SINGULAR,
  SALES_PIPELINE_SETTING_OBJECT_NAME_SINGULAR,
];

export const hasSalesPipelineObjects = (
  objectMetadataItems: { nameSingular: string }[],
) =>
  SALES_PIPELINE_OBJECT_NAMES_SINGULAR.every((objectNameSingular) =>
    objectMetadataItems.some(
      ({ nameSingular }) => nameSingular === objectNameSingular,
    ),
  );
