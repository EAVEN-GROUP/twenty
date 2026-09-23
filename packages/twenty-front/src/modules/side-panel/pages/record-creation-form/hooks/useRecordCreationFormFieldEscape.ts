import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useHandleSidePanelEscape } from '@/side-panel/hooks/useHandleSidePanelEscape';
import { currentFocusedItemSelector } from '@/ui/utilities/focus/states/currentFocusedItemSelector';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type RefObject } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';

export const useRecordCreationFormFieldEscape = ({
  formFieldsRef,
}: {
  formFieldsRef: RefObject<HTMLDivElement | null>;
}) => {
  const currentFocusedItem = useAtomStateValue(currentFocusedItemSelector);
  const handleSidePanelEscape = useHandleSidePanelEscape();

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    focusId: currentFocusedItem?.focusId ?? SIDE_PANEL_FOCUS_ID,
    callback: (keyboardEvent) => {
      const { target } = keyboardEvent;

      if (
        currentFocusedItem?.componentInstance.componentType !==
          FocusComponentType.FORM_FIELD_INPUT ||
        !(target instanceof HTMLElement) ||
        !formFieldsRef.current?.contains(target)
      ) {
        return;
      }

      setTimeout(() => {
        if (
          keyboardEvent.defaultPrevented ||
          !isDefined(formFieldsRef.current)
        ) {
          return;
        }

        target.blur();
        handleSidePanelEscape();
      });
    },
    dependencies: [currentFocusedItem, formFieldsRef, handleSidePanelEscape],
    options: { preventDefault: false },
  });
};
