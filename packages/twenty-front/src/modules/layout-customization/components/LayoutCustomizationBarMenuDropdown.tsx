import { useContext } from 'react';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconDotsVertical, IconReload } from 'twenty-ui/icon';
import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { GRAY_SCALE_LIGHT } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RESET_RECORD_PAGE_LAYOUT_MODAL_ID } from '@/layout-customization/constants/ResetRecordPageLayoutModalId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

const LAYOUT_MENU_WIDTH = 240;

const StyledInvertedIconButtonWrapper = styled.span`
  align-items: center;
  display: flex;

  button {
    color: ${GRAY_SCALE_LIGHT.gray1};
  }

  button:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

export const LayoutCustomizationBarMenuDropdown = () => {
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);
  const { t } = useLingui();
  const { openDialog } = useDialog();

  const handleResetClick = () => {
    openDialog(RESET_RECORD_PAGE_LAYOUT_MODAL_ID);
  };

  return (
    <Dropdown.Root kind="menu">
      <StyledInvertedIconButtonWrapper>
        <Dropdown.Trigger
          render={
            <LightIconButton
              emphasis="subtle"
              aria-label={t`Layout customization menu`}
            >
              <IconDotsVertical />
            </LightIconButton>
          }
        />
      </StyledInvertedIconButtonWrapper>
      <Dropdown.Content
        data-click-outside-id={parentClickOutsideId}
        width={LAYOUT_MENU_WIDTH}
      >
        <DropdownFocusEffect />
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconReload />}
            onClick={handleResetClick}
          >
            {t`Reset record page layout`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
