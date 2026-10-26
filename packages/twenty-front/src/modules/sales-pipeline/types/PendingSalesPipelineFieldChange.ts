import { type SalesPipelineFieldChange } from '@/sales-pipeline/types/SalesPipelineFieldChange';

export type PendingSalesPipelineFieldChange = {
  recordId: string;
  change: SalesPipelineFieldChange;
};
