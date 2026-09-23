import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { CommandMenuDropdownCloseContext } from '@/command-menu-item/contexts/CommandMenuDropdownCloseContext';

export const useCloseCommandMenu = ({
  closeSidePanelOnShowPageOptionsExecution = false,
  closeSidePanelOnCommandMenuListExecution = true,
}: {
  closeSidePanelOnShowPageOptionsExecution?: boolean;
  closeSidePanelOnCommandMenuListExecution?: boolean;
} = {}) => {
  const { containerType, commandMenuContextApi } =
    useContext(CommandMenuContext);
  const closeDropdownMenu = useContext(CommandMenuDropdownCloseContext);
  const isInSidePanel = commandMenuContextApi.isInSidePanel;

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { closeDropdown } = useCloseDropdown();

  const commandMenuId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );

  const dropdownId = getCommandMenuDropdownIdFromCommandMenuId(commandMenuId);

  const closeCommandMenu = () => {
    if (containerType === CommandMenuItemContainerType.CommandMenuList) {
      if (!closeSidePanelOnCommandMenuListExecution) {
        return;
      }
      closeSidePanelMenu();
    }

    if (
      containerType === CommandMenuItemContainerType.IndexPageDropdown ||
      containerType === CommandMenuItemContainerType.CommandMenuShowPageDropdown
    ) {
      closeDropdownMenu?.();

      if (!isDefined(closeDropdownMenu) && !isInSidePanel) {
        closeDropdown(dropdownId);
      }
    }

    if (
      containerType ===
        CommandMenuItemContainerType.CommandMenuShowPageDropdown &&
      closeSidePanelOnShowPageOptionsExecution
    ) {
      closeSidePanelMenu();
    }
  };

  return { closeCommandMenu };
};
