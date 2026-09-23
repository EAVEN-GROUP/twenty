import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { usePinnedCommandMenuItemsInlineLayout } from '@/command-menu-item/display/hooks/usePinnedCommandMenuItemsInlineLayout';
import { useSidePanelFooterPinnedItemsAvailableWidth } from '@/command-menu-item/hooks/useSidePanelFooterPinnedItemsAvailableWidth';
import { sidePanelWidgetFooterCommandMenuItemsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterCommandMenuItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useId, useMemo, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';
import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { useSidePanelOptionsHotkeys } from '@/side-panel/hooks/useSidePanelOptionsHotkeys';
import { CommandMenuDropdownCloseContext } from '@/command-menu-item/contexts/CommandMenuDropdownCloseContext';
import { CommandMenuDropdownActionItem } from '@/command-menu-item/display/components/CommandMenuDropdownActionItem';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const RecordPageSidePanelCommandMenuDropdown = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  const { t } = useLingui();
  const focusId = useId();
  const [open, setOpen] = useState(false);
  const { handleContentKeyDown } = useSidePanelOptionsHotkeys({
    focusId,
    onToggle: () => setOpen((previousOpen) => !previousOpen),
  });

  const sidePanelWidgetFooterCommandMenuItems = useAtomStateValue(
    sidePanelWidgetFooterCommandMenuItemsState,
  );

  const dropdownWidgetCommandMenuItems =
    sidePanelWidgetFooterCommandMenuItems.filter(
      (commandMenuItem) => commandMenuItem.isPinned === false,
    );

  const recordSelectionCommandMenuItems = useMemo(
    () =>
      commandMenuItems.filter(
        (item) =>
          item.availabilityType ===
          CommandMenuItemAvailabilityType.RECORD_SELECTION,
      ),
    [commandMenuItems],
  );

  const pinnedCommandMenuItems = useMemo(
    () => commandMenuItems.filter((item) => item.isPinned === true),
    [commandMenuItems],
  );

  const availableWidth = useSidePanelFooterPinnedItemsAvailableWidth();

  // Pinned items are buttons in the footer, so the dropdown only repeats the
  // ones the footer could not fit next to this dropdown's own footprint.
  const { pinnedOverflowCommandMenuItems } =
    usePinnedCommandMenuItemsInlineLayout({
      pinnedCommandMenuItems,
      layoutKey: 'side-panel-footer',
      containerWidth: availableWidth,
    });

  // A widget owning the footer suppresses those buttons entirely, and leaves
  // the footer measurements stale, so every pinned item belongs here instead.
  const hasPinnedWidgetCommandMenuItems =
    sidePanelWidgetFooterCommandMenuItems.some(
      (commandMenuItem) => commandMenuItem.isPinned !== false,
    );

  const pinnedOverflowCommandMenuItemIds = new Set(
    pinnedOverflowCommandMenuItems.map((item) => item.id),
  );

  const listedCommandMenuItems = hasPinnedWidgetCommandMenuItems
    ? recordSelectionCommandMenuItems
    : recordSelectionCommandMenuItems.filter(
        (item) =>
          item.isPinned !== true ||
          pinnedOverflowCommandMenuItemIds.has(item.id),
      );

  return (
    <Dropdown.Root kind="menu" open={open} onOpenChange={setOpen}>
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
        <CommandMenuDropdownCloseContext.Provider value={() => setOpen(false)}>
          <Dropdown.Section>
            {dropdownWidgetCommandMenuItems.map((commandMenuItem) => (
              <Dropdown.ActionItem
                key={commandMenuItem.id}
                startIcon={<SelectOptionIcon Icon={commandMenuItem.Icon} />}
                onClick={() => {
                  setOpen(false);
                  commandMenuItem.onClick();
                }}
              >
                {commandMenuItem.label}
              </Dropdown.ActionItem>
            ))}
            {isNonEmptyArray(dropdownWidgetCommandMenuItems) &&
              isNonEmptyArray(listedCommandMenuItems) && <Dropdown.Separator />}
            {listedCommandMenuItems.map((item) => (
              <CommandMenuDropdownActionItem item={item} key={item.id} />
            ))}
          </Dropdown.Section>
        </CommandMenuDropdownCloseContext.Provider>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
