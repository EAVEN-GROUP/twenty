import { useProcessSalesPipelineFieldChange } from '@/sales-pipeline/hooks/useProcessSalesPipelineFieldChange';
import { pendingSalesPipelineFieldChangesState } from '@/sales-pipeline/states/pendingSalesPipelineFieldChangesState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useEffect } from 'react';

export const SalesPipelineFieldChangeEffect = () => {
  const [
    pendingSalesPipelineFieldChanges,
    setPendingSalesPipelineFieldChanges,
  ] = useAtomState(pendingSalesPipelineFieldChangesState);
  const { processSalesPipelineFieldChange } =
    useProcessSalesPipelineFieldChange();

  useEffect(() => {
    if (pendingSalesPipelineFieldChanges.length === 0) {
      return;
    }

    setPendingSalesPipelineFieldChanges([]);

    for (const pendingChange of pendingSalesPipelineFieldChanges) {
      void processSalesPipelineFieldChange(pendingChange);
    }
  }, [
    pendingSalesPipelineFieldChanges,
    setPendingSalesPipelineFieldChanges,
    processSalesPipelineFieldChange,
  ]);

  return null;
};
