import { isDefined } from 'twenty-shared/utils';

export const pickNextCloserId = ({
  closerIds,
  lastAssignedAtByCloserId,
}: {
  closerIds: string[];
  lastAssignedAtByCloserId: Map<string, string>;
}): string | undefined => {
  const neverAssignedCloserId = closerIds.find(
    (closerId) => !lastAssignedAtByCloserId.has(closerId),
  );

  if (isDefined(neverAssignedCloserId)) {
    return neverAssignedCloserId;
  }

  return closerIds.reduce<string | undefined>((pickedCloserId, closerId) => {
    if (!isDefined(pickedCloserId)) {
      return closerId;
    }

    const pickedLastAssignedAt =
      lastAssignedAtByCloserId.get(pickedCloserId) ?? '';
    const lastAssignedAt = lastAssignedAtByCloserId.get(closerId) ?? '';

    return lastAssignedAt < pickedLastAssignedAt ? closerId : pickedCloserId;
  }, undefined);
};
