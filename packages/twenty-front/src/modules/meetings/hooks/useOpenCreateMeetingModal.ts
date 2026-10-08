import { createMeetingModalState } from '@/meetings/states/createMeetingModalState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback } from 'react';

export const useOpenCreateMeetingModal = () => {
  const setCreateMeetingModal = useSetAtomState(createMeetingModalState);

  const openCreateMeetingModal = useCallback(
    (personId: string) => {
      setCreateMeetingModal({ personId });
    },
    [setCreateMeetingModal],
  );

  return { openCreateMeetingModal };
};
