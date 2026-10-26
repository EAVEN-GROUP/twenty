import { pendingSalesPipelineFieldChangesState } from '@/sales-pipeline/states/pendingSalesPipelineFieldChangesState';
import { getSalesPipelineFieldChange } from '@/sales-pipeline/utils/getSalesPipelineFieldChange';
import type { Store } from 'jotai/vanilla/store';
import { isDefined } from 'twenty-shared/utils';

// Field inputs and board drops only enqueue: the follow-up queries need the meeting
// object, which these generic hooks cannot assume exists.
export const enqueueSalesPipelineFieldChange = ({
  store,
  objectNameSingular,
  recordId,
  fieldName,
  previousValue,
  nextValue,
}: {
  store: Store;
  objectNameSingular: string;
  recordId: string;
  fieldName: string;
  previousValue: unknown;
  nextValue: unknown;
}) => {
  const change = getSalesPipelineFieldChange({
    objectNameSingular,
    fieldName,
    previousValue,
    nextValue,
  });

  if (!isDefined(change)) {
    return;
  }

  store.set(pendingSalesPipelineFieldChangesState.atom, (pendingChanges) => [
    ...pendingChanges,
    { recordId, change },
  ]);
};
