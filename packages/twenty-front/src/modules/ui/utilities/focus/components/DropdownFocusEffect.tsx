import { useEffect, useId } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

type DropdownFocusEffectProps = {
  focusId?: string;
  enableGlobalHotkeysWithModifiers?: boolean;
};

export const DropdownFocusEffect = ({
  focusId: focusIdFromProps,
  enableGlobalHotkeysWithModifiers = false,
}: DropdownFocusEffectProps) => {
  const generatedFocusId = useId();
  const focusId = focusIdFromProps ?? generatedFocusId;
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId,
      component: { type: FocusComponentType.DROPDOWN, instanceId: focusId },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
        enableGlobalHotkeysWithModifiers,
      },
    });

    return () => removeFocusItemFromFocusStackById({ focusId });
  }, [
    enableGlobalHotkeysWithModifiers,
    focusId,
    pushFocusItemToFocusStack,
    removeFocusItemFromFocusStackById,
  ]);

  return null;
};
