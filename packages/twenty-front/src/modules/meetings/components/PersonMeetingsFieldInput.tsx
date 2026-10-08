import { PERSON_MEETINGS_CLICK_OUTSIDE_LISTENER_ID } from '@/meetings/constants/PersonMeetingsClickOutsideListenerId';
import { PersonMeetingsPanel } from '@/meetings/components/PersonMeetingsPanel';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext, useRef } from 'react';
import { Key } from 'ts-key-enum';

export const PersonMeetingsFieldInput = () => {
  const { recordId } = useContext(FieldContext);
  const { onSubmit } = useContext(FieldInputEventContext);
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    onSubmit?.({ skipPersist: true });
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleClose,
    focusId: instanceId,
    dependencies: [onSubmit],
  });

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      handleClose();
    },
    listenerId: PERSON_MEETINGS_CLICK_OUTSIDE_LISTENER_ID,
  });

  return (
    <PersonMeetingsPanel
      personId={recordId}
      onClose={handleClose}
      containerRef={containerRef}
    />
  );
};
