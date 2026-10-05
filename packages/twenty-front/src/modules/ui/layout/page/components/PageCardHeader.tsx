import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useWorkspaceSurfaceHeaderPortal } from '@/ui/layout/hooks/useWorkspaceSurfaceHeaderPortal';
import {
  Breadcrumb,
  type BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { PAGE_CARD_HEADER_MIN_HEIGHT } from '@/ui/layout/page/constants/PageCardHeaderMinHeight';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type PageCardHeaderProps = {
  links?: BreadcrumbProps['links'];
  breadcrumb?: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  tag?: ReactNode;
  actionButton?: ReactNode;
  centerTitle?: boolean;
  titleColor?: string;
};

const StyledHeader = styled.div<{ centerTitle?: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  column-gap: ${themeCssVariables.spacing[2]};
  display: grid;
  grid-template-columns: ${({ centerTitle }) =>
    centerTitle
      ? 'minmax(0, 1fr) minmax(0, auto) minmax(0, 1fr)'
      : 'minmax(0, auto) minmax(min-content, 1fr)'};
  min-height: ${PAGE_CARD_HEADER_MIN_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[5]};
  width: 100%;
`;

const StyledLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  grid-column: 1;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledTitle = styled.div<{ titleColor?: string }>`
  align-items: center;
  color: ${({ titleColor }) =>
    titleColor ?? themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StyledSubtitle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledCenteredTitle = styled(StyledTitle)`
  grid-column: 2;
  justify-content: center;
  justify-self: stretch;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const StyledRight = styled.div<{ centerTitle?: boolean }>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  grid-column: ${({ centerTitle }) => (centerTitle ? 3 : 2)};
  justify-content: flex-end;
  justify-self: end;
  width: 100%;
`;

const StyledSurfaceTitle = styled(StyledTitle)`
  overflow: hidden;
  width: 100%;
`;

const StyledSurfaceActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
`;

export const PageCardHeader = ({
  links,
  breadcrumb,
  icon,
  title,
  subtitle,
  tag,
  actionButton,
  centerTitle = false,
  titleColor,
}: PageCardHeaderProps) => {
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();
  const workspaceSurface = useWorkspaceSurface();
  const workspaceSurfaceHeaderPortal = useWorkspaceSurfaceHeaderPortal();

  const hasTitleContent = isDefined(icon) || isDefined(title) || isDefined(tag);
  const shouldCenterTitle = centerTitle && hasTitleContent;

  const titleContent = (
    <>
      {icon}
      {isDefined(title) && title}
      {tag}
    </>
  );

  const surfaceTitleContent = isDefined(breadcrumb) ? (
    breadcrumb
  ) : hasTitleContent ? (
    titleContent
  ) : isDefined(links) ? (
    <Breadcrumb links={links} />
  ) : null;

  if (workspaceSurface.type === 'side-panel') {
    return (
      <>
        {isDefined(workspaceSurfaceHeaderPortal.title) &&
          isDefined(surfaceTitleContent) &&
          createPortal(
            <StyledSurfaceTitle titleColor={titleColor}>
              {surfaceTitleContent}
            </StyledSurfaceTitle>,
            workspaceSurfaceHeaderPortal.title,
          )}
        {isDefined(workspaceSurfaceHeaderPortal.actions) &&
          isDefined(actionButton) &&
          createPortal(
            <StyledSurfaceActions
              data-click-outside-id={PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID}
            >
              {actionButton}
            </StyledSurfaceActions>,
            workspaceSurfaceHeaderPortal.actions,
          )}
      </>
    );
  }

  return (
    <StyledHeader centerTitle={shouldCenterTitle}>
      <StyledLeft>
        {!isMobile && !isNavigationDrawerExpanded && (
          <NavigationDrawerCollapseButton direction="right" />
        )}
        {isDefined(breadcrumb)
          ? breadcrumb
          : isDefined(links) && <Breadcrumb links={links} />}
        {!shouldCenterTitle && hasTitleContent && (
          <StyledTitleBlock>
            <StyledTitle titleColor={titleColor}>{titleContent}</StyledTitle>
            {isDefined(subtitle) && <StyledSubtitle>{subtitle}</StyledSubtitle>}
          </StyledTitleBlock>
        )}
      </StyledLeft>
      {shouldCenterTitle && (
        <StyledCenteredTitle titleColor={titleColor}>
          {titleContent}
        </StyledCenteredTitle>
      )}
      <StyledRight
        centerTitle={shouldCenterTitle}
        data-click-outside-id={PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID}
      >
        {actionButton}
      </StyledRight>
    </StyledHeader>
  );
};
