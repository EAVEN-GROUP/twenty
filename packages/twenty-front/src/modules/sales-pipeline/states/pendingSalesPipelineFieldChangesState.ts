import { type PendingSalesPipelineFieldChange } from '@/sales-pipeline/types/PendingSalesPipelineFieldChange';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const pendingSalesPipelineFieldChangesState = createAtomState<
  PendingSalesPipelineFieldChange[]
>({
  key: 'pendingSalesPipelineFieldChangesState',
  defaultValue: [],
});
