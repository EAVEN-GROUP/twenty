import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const createMeetingModalState = createAtomState<{
  personId: string;
} | null>({
  key: 'createMeetingModalState',
  defaultValue: null,
});
