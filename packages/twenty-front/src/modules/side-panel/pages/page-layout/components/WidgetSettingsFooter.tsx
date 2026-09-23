import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { useDuplicatePageLayoutWidget } from '@/page-layout/hooks/useDuplicatePageLayoutWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useSidePanelOptionsHotkeys } from '@/side-panel/hooks/useSidePanelOptionsHotkeys';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { IconCopyPlus, IconDotsVertical, IconTrash } from 'twenty-ui/icon';

export const WidgetSettingsFooter = ({
  pageLayoutId,
}: {
  pageLayoutId: string;
}) => {
  const focusId = useId();
  const [open, setOpen] = useState(false);
  const { handleContentKeyDown } = useSidePanelOptionsHotkeys({
    focusId,
    onToggle: () => setOpen((previousOpen) => !previousOpen),
  });
  const { t } = useLingui();
  const { duplicateWidget } = useDuplicatePageLayoutWidget(pageLayoutId);
  const { deletePageLayoutWidget } = useDeletePageLayoutWidget(pageLayoutId);
  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const handleDuplicateWidget = () => {
    if (isDefined(pageLayoutEditingWidgetId)) {
      duplicateWidget(pageLayoutEditingWidgetId);
    }
  };

  const handleDeleteWidget = () => {
    if (isDefined(pageLayoutEditingWidgetId)) {
      deletePageLayoutWidget(pageLayoutEditingWidgetId);
    }
  };

  return (
    <SidePanelFooter
      actions={[
        <Dropdown.Root
          key="options"
          kind="menu"
          open={open}
          onOpenChange={setOpen}
        >
          <Dropdown.Trigger
            data-select-disable
            render={
              <IconButton aria-label={t`Options`} size="sm" variant="outline">
                <IconDotsVertical />
              </IconButton>
            }
          />
          <Dropdown.Content
            data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}
            side="top"
            align="end"
            sideOffset={8}
            onKeyDown={handleContentKeyDown}
          >
            <DropdownFocusEffect
              focusId={focusId}
              enableGlobalHotkeysWithModifiers
            />
            <Dropdown.Section>
              <Dropdown.ActionItem
                onClick={handleDuplicateWidget}
                startIcon={<IconCopyPlus />}
              >
                {t`Duplicate widget`}
              </Dropdown.ActionItem>
              <Dropdown.ActionItem
                onClick={handleDeleteWidget}
                startIcon={<IconTrash />}
                color="danger"
              >
                {t`Delete widget`}
              </Dropdown.ActionItem>
            </Dropdown.Section>
          </Dropdown.Content>
        </Dropdown.Root>,
      ]}
    />
  );
};
