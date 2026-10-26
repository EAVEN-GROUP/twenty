import { type SalesPipelineOutcome } from '@/sales-pipeline/types/SalesPipelineOutcome';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const salesPipelineOutcomeModalState =
  createAtomState<SalesPipelineOutcome | null>({
    key: 'salesPipelineOutcomeModalState',
    defaultValue: null,
  });
