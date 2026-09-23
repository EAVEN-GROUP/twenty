import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { DropdownFocusEffect } from '@/ui/utilities/focus/components/DropdownFocusEffect';
import { WorkflowStepOptionsMenuItems } from '@/workflow/workflow-steps/components/WorkflowStepOptionsMenuItems';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOptionsButtonContainer = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  position: absolute;
  right: calc(0px - ${themeCssVariables.spacing[4]});
  top: 0;
  transform: translateX(100%);
`;

export const WorkflowDiagramStepNodeOptionsDropdown = ({
  onChangeNode,
  onDuplicateNode,
  onDelete,
}: {
  onChangeNode: () => void;
  onDuplicateNode?: () => void;
  onDelete: () => void;
}) => {
  const { t } = useLingui();

  return (
    <StyledOptionsButtonContainer className="nodrag nopan">
      <Dropdown.Root kind="menu">
        <Dropdown.Trigger
          data-select-disable
          render={
            <IconButton elevated size="md" aria-label={t`Node options`}>
              <IconDotsVertical />
            </IconButton>
          }
        />
        <Dropdown.Content
          side="right"
          align="start"
          sideOffset={8}
          data-click-outside-id={
            WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID
          }
        >
          <DropdownFocusEffect enableGlobalHotkeysWithModifiers />
          <Dropdown.Section>
            <WorkflowStepOptionsMenuItems
              changeNodeText={t`Change node`}
              onChangeNode={onChangeNode}
              onDuplicateNode={onDuplicateNode}
              onDeleteNode={onDelete}
            />
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Root>
    </StyledOptionsButtonContainer>
  );
};
