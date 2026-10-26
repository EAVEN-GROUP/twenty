import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// A closerId means the closer is booking a follow-up meeting, so there is no rotation.
export const createMeetingModalState = createAtomState<{
  personId: string;
  closerId?: string;
} | null>({
  key: 'createMeetingModalState',
  defaultValue: null,
});
